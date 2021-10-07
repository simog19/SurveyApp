import {React, useState, useEffect} from 'react';
import {BrowserRouter as Router, Link, useParams} from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import API from './API'

import {Container, Row, Col, Button, Toast} from 'react-bootstrap';
import {LoginForm} from './components/Login';
import Navigation from './components/Navigation';
import List from './components/ContentList';
import CreationList from './components/Creation';

import {Route, Switch, Redirect} from 'react-router-dom';
import {Plus, X} from "react-bootstrap-icons";


const App = () => {

    const [surveyList, setSurveyList] = useState([]);
    const [surveyListAdmin, setSurveyListAdmin] = useState([]);
    const [message, setMessage] = useState('');
    const [loggedIn, setLoggedIn] = useState(false); // at the beginning, no admin is logged in
    const [admin, setAdmin] = useState(null);
    const [shouldLogin, setShouldLogin] = useState(false);
    const [showQuestions, setShowQuestions] = useState(false);
    const [creating, setCreating] = useState(false);
    const [viewing, setViewing] = useState(false);


    useEffect(() => {
        if (loggedIn === false) {
            API.getSurveys()
                .then(surveys => {
                    setSurveyList(surveys);
                })
                .catch(e => handleErrors(e));
        }
    }, [loggedIn])


    // show error message in toast
    const handleErrors = (err) => {
        setMessage({msg: err.error, type: 'danger'});

    }

    useEffect(() => {
        if (creating)
            return;
        if (loggedIn === true) {
            API.getSurveysAdmin(admin.id)
                .then(surveys => {
                    setSurveyListAdmin(surveys);
                })
                .catch(e => handleErrors(e));
        }
    }, [loggedIn, creating, admin])


    const handleQuestion = () => {
        setShowQuestions(true);
    }


    const handleSaveAnswers = (results, id, selectedUsername) => {

        API.addAnswers(results, id, selectedUsername)
            .then(() => setShowQuestions(false))
            .catch(e => handleErrors(e));

    }

    const handleSaveSurvey = (survey, id) => {
        API.addSurveys(survey, id)
            .then(() => setCreating(false))
            .catch(e => handleErrors(e))
    }


    // check if user is authenticated
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // here you have the user info, if already logged in
                const admin = await API.getAdminInfo();
                setAdmin(admin);
                setLoggedIn(true);
            } catch (err) {
                console.log(err.error); // mostly unauthenticated user
            }
        };
        checkAuth();
    }, []);

    const doLogIn = async (credentials) => {
        try {
            const admin = await API.logIn(credentials);
            setAdmin(admin);
            setLoggedIn(true);
            setShouldLogin(false);
        } catch (err) {

            throw(err)
        }
    }

    const handleLogOut = async () => {
        await API.logOut()
        // clean up everything
        setLoggedIn(false);
        setAdmin(null);
        setShouldLogin(false);
    }

    const handleLogIn = () => {
        setShouldLogin(true);

    }
    const startCreating = () => {
        setCreating(true);

    }
    const startViewing = () => {
        setViewing(true);

    }


    return (

        <Container fluid>
            <Row>
                <Navigation onLogIn={handleLogIn} onLogOut={handleLogOut} loggedIn={loggedIn} admin={admin}
                            showQuestions={showQuestions}/>

            </Row>
            <Toast show={message !== ''} onClose={() => setMessage('')} delay={3000} autohide>
                <Toast.Body>{message?.msg}</Toast.Body>
            </Toast>

            <Router>
                <Switch>

                    <Route exact path={"/"} render={() =>
                        loggedIn === true ? (creating === true ? (<Redirect to="/admin/creation"/>)
                            : (<Redirect to="/admin"/>))
                            : (shouldLogin === true ?
                                (<Redirect to="/login"/>)
                                : (<Row className="vh-100 below-nav">
                                    <SurveyMgr onViewing={startViewing} surveyList={surveyList}
                                               onQuestion={handleQuestion}/>
                                </Row>)
                            )
                    }>
                    </Route>
                    <Route exact path="/surveys/:id">
                        <Row className="vh-100 below-nav">
                            {loggedIn === true ? (<Redirect to="/admin"/>)
                                : (<QuestionMgr setShowQuestions={setShowQuestions}
                                                showQuestions={showQuestions}
                                                onSave={handleSaveAnswers}
                                                setMessage={setMessage}> </QuestionMgr>)
                            }
                        </Row>
                    </Route>
                    <Route exact path="/login">
                        {loggedIn ? <Redirect to="/admin"/> :
                            <Row className="vh-100 below-nav">
                                <LoginForm login={doLogIn} shouldShow={shouldLogin} setShouldShow={setShouldLogin}/>
                            </Row>
                        }
                    </Route>
                    <Route exact path="/admin">
                        {loggedIn === true ?
                            (<Row className="vh-100 below-nav">
                                <SurveyMgr surveyList={surveyListAdmin} loggedIn={loggedIn} admin={admin}> </SurveyMgr>
                                <Button as={Link} to={"/admin/creation"} onClick={startCreating}
                                        className="btn-add btn-danger position-fixed rounded-circle p-2">
                                    <Plus className="d-block"/>
                                </Button>
                            </Row>)
                            : (<Redirect to="/"/>)
                        }
                    </Route>

                    <Route exact path="/admin/creation">
                        <Row className="vh-100 below-nav">
                            {loggedIn ? (
                                <CreationMgr setMessage={setMessage} setCreating={setCreating} onSave={handleSaveSurvey}
                                             creating={creating} admin={admin}/>) : (<Redirect to="/"/>)}

                        </Row>
                    </Route>
                    <Route exact path="/admin/:id">
                        <Row className="vh-100 below-nav">
                            {loggedIn ? (
                                <ViewMgr viewing={viewing} setViewing={setViewing} setMessage={setMessage}/>) : (
                                <Redirect to="/"/>)}

                        </Row>

                    </Route>
                </Switch>
            </Router>

        </Container>

    );
}
const QuestionMgr = (props) => {
    const {onSave, showQuestions, setMessage, setShowQuestions} = props;
    const [questionList, setQuestionList] = useState([]);
    const [currentSurvey, setCurrentSurvey] = useState('');


    const {id} = useParams();

    useEffect(() => {
        const handleErrors = (err) => {
            setMessage({msg: err.error, type: 'danger'});
            console.log(err);
        }
        if (id != null) {
            API.getQuestions(id)
                .then(survey => {
                    setQuestionList(JSON.parse(survey.questions));
                    setCurrentSurvey(survey);
                })
                .catch(e => handleErrors(e));

        }
    }, [showQuestions, setMessage, id])


    return (
        <>
            <Col className="scroll-y h-100 pt-3 col-lg-12">
                <Button as={Link} to={"/"} onClick={() => setShowQuestions(false)}
                        className="btn-add btn-danger mr-4 rounded-circle p-2">
                    <X className="d-block"/>
                </Button>
                <h1 className="text-muted col-lg-12 text-center">{currentSurvey.title}</h1>
                <List.QuestionList
                    questions={questionList}
                    onSave={onSave}
                />
            </Col>
        </>
    )

}

const SurveyMgr = (props) => {

    const {onViewing, onQuestion, loggedIn, admin, surveyList} = props;

    return (
        <>
            {loggedIn ? (
                    <Col className="scroll-y h-100 pt-3 col-lg-12">
                        <h1 className="col-lg-12">List of your published surveys: {admin.username}</h1>
                        <List.SurveyList
                            surveys={surveyList}
                            loggedIn={loggedIn}
                            onViewing={onViewing}

                        />
                    </Col>)
                : (<Col className="scroll-y h-100 pt-3 col-lg-12">
                    <h1 className="col-lg-12">List of all surveys available</h1>
                    <List.SurveyList
                        surveys={surveyList}
                        onQuestion={onQuestion}
                    />
                </Col>)
            }
        </>
    )

}

const CreationMgr = (props) => {
    const {setCreating, admin, onSave} = props;

    return (
        <>
            <Col className="scroll-y h-100 pt-3 col-lg-12">
                <Button as={Link} to={"/admin"} onClick={() => setCreating(false)}
                        className="btn-add btn-danger mr-4 rounded-circle p-2">
                    <X className="d-block"/>
                </Button>
                <h1 className="text-muted col-lg-12 text-center">Creating a new survey</h1>
                <CreationList onSave={onSave} admin={admin}/>
            </Col>
        </>
    )
}

const ViewMgr = (props) => {
    const {setMessage, viewing, setViewing} = props;
    const [results, setResults] = useState([]);
    const {id} = useParams();

    useEffect(() => {
        const handleErrors = (err) => {
            setMessage({msg: err.error, type: 'danger'});
            console.log(err);
        }
        if (id != null) {
            API.getAnswers(id)
                .then(results => {
                    setResults(results);
                })
                .catch(e => handleErrors(e))

        }
    }, [viewing, id, setMessage]);


    return (
        <>
            <Col className="scroll-y h-100 pt-3 col-lg-12">
                <Button as={Link} to={"/admin"} onClick={() => setViewing(false)}
                        className="btn-add btn-danger mr-4 rounded-circle p-2">
                    <X className="d-block"/>
                </Button>
                <List.ViewList results={results}/>
            </Col>

        </>
    )
}


export default App;
