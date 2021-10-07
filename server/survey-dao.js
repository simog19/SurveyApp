'use strict';
/* Data Access Object (DAO) module for accessing surveys,questions and answers */

const db = require('./db');

// get all surveys
exports.listSurveys = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id,title FROM surveys';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const surveys = rows.map((s) => ({id: s.id, title: s.title}));
            resolve(surveys);
        });
    });
};

//create an answer for a given survey
exports.createAnswer = (answer) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO answer(id, survey, user, answers) VALUES(?, ?, ?, ?)';
        db.run(sql, [answer.id, answer.survey, answer.user, answer.answers], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this);
        });
    });
};

// get all surveys for a given admin
exports.listAdminSurveys = (adminID) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT surveys.id, surveys.title, COUNT(DISTINCT answer.id) as N_answ, surveys.admin FROM surveys LEFT OUTER JOIN answer ON surveys.id = answer.survey WHERE surveys.admin=? GROUP BY surveys.id';
        db.all(sql, [adminID], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const surveys = rows.map((s) => ({id: s.id, title: s.title, N_answ: s.N_answ}));
            resolve(surveys);
        });
    });
};

// get questions for a survey with a given id
exports.listQuestions = (surveyId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM surveys WHERE id = ?';
        db.get(sql, [surveyId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row === undefined) {
                resolve({error: 'Survey not found.'});
            } else {
                resolve(row);
            }

        });
    });
};

// get all answers for a given survey
exports.listAnswers = (surveyId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT  user,questions,answers FROM answer LEFT OUTER JOIN surveys ON  answer.survey = surveys.id WHERE answer.survey=?';
        db.all(sql, [surveyId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const results = rows.map((r) => ({user: r.user, questions: r.questions, answers: r.answers}));
            resolve(results);
        });
    });
};

// add a new survey:
exports.createSurvey = (survey) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO surveys(id, title, admin, questions) VALUES(?, ?, ?,?)';
        db.run(sql, [survey.id, survey.title, survey.admin, survey.questions], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this);
        });
    });
};

