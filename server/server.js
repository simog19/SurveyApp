'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const {check, validationResult} = require('express-validator'); // validation middleware
const surveyDao = require('./survey-dao'); // module for accessing the surveys and answers in the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const adminDao = require('./admin-dao');
const Strategy = require("passport-local"); // module for accessing the admins in the DB


/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password

// noinspection JSCheckFunctionSignatures
passport.use(new Strategy(async (username, password, done) => {
    // verification callback for authentication
    try {
        const user = await adminDao.getAdmin(username, password);
        if (!user) {
            return done(null, false, {message: 'Incorrect username and/or password'});
        } else
            return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
    adminDao.getAdminById(id)
        .then(user => {
            done(null, user); // this will be available in req.user
        }).catch(err => {
        done(err, null);
    });
});


// custom middleware: check if a given request is coming from an authenticated admin
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated())
        return next();

    return res.status(401).json({error: 'not authenticated'});
}


// init express
const app = new express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());

// set up the session
app.use(session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
    resave: false,
    saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/*** Normal User APIs ***/

// GET /api/surveys
app.get('/api/surveys', (req, res) => {
    surveyDao.listSurveys()
        .then(surveys => res.json(surveys))
        .catch(() => res.status(500).end());
});

// GET /api/surveys/:id
app.get('/api/surveys/:id', async (req, res) => {
    try {
        const survey = await surveyDao.listQuestions(req.params.id);
        res.json(survey);

    } catch (err) {
        res.status(500).end();
    }
});

// POST /api/surveys/:id
app.post('/api/surveys/:id', [
    check('survey').isInt(),
    check('user').isString(),
    check('answers').isString()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const answer = {
        survey: req.body.survey,
        user: req.body.user,
        answers: req.body.answers
    };

    try {
        await surveyDao.createAnswer(answer);
        res.status(201).json({});
    } catch (err) {
        res.status(503).json({error: `Database error during the creation of answer ${answer.id}.`});
    }
});

/*** Admins APIs ***/

// GET /api/admin
app.get('/api/admin', isLoggedIn, async (req, res) => {
    try {
        const surveys = await surveyDao.listAdminSurveys(req.user.id);
        res.json(surveys);

    } catch (err) {
        res.status(500).end();
    }
});

// GET /api/admin/:id
app.get('/api/admin/:id', isLoggedIn, async (req, res) => {
    try {
        const answers = await surveyDao.listAnswers(req.params.id);
        res.json(answers);
    } catch (err) {
        res.status(500).end();
    }
});


// POST /api/admin/creation
app.post('/api/admin/creation', isLoggedIn, [
    check('title').isString(),
    check('questions').isString(),
    check('admin').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    const survey = {
        title: req.body.title,
        admin: req.body.admin,
        questions: req.body.questions
    };

    try {
        await surveyDao.createSurvey(survey, req.body.admin);
        res.status(201).json({});
    } catch (err) {
        res.status(503).json({error: `Database error.`});
    }
});


// POST /api/login
// login
app.post('/api/sessions', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            // display wrong login messages
            return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            const responseAdmin = {...user}
            delete responseAdmin.hash;
            return res.json(responseAdmin);
        });
    })(req, res, next);
});


// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else
        res.status(401).json({error: 'Unauthenticated user!'});
});


// DELETE /api/logout
// logout
app.delete('/api/sessions/current', (req, res) => {
    req.logout();
    res.json({message: 'Logged out'});
});


// activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});