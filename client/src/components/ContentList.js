import {Form, ListGroup, Button, Col, Row} from 'react-bootstrap';
import {NavLink, useParams} from 'react-router-dom';
import {React, useState} from "react";
import Carousel from "react-bootstrap/Carousel";

const Mcq = (props) => {
    const {question, handleAnswer, isDisabled, selectedAnswers} = props;
    const options = question.options;

    return <>
        <Form.Group>
            {
                options.map((o, i) => {
                    return (
                        <Form.Check
                            key={i}
                            inline
                            disabled={isDisabled && !selectedAnswers.includes(o)}
                            value={o}
                            label={o}
                            type="checkbox"
                            onChange={handleAnswer}
                        />
                    );

                })
            }
        </Form.Group>
    </>
}
const QuestionRowData = (props) => {

    const {question, selectedAnswers, id} = props;
    const [isDisabled, setIsDisabled] = useState(false);
    question.max = parseInt(question.max);
    question.min = parseInt(question.min);

    const constraint = question.min === 0 ? ("Optional") : ("Mandatory");


    const handleAnswer = (e) => {

        const a = e.target.value;
        if (selectedAnswers.includes(a)) {
            const index = selectedAnswers.indexOf(a);
            selectedAnswers.splice(index, 1);
        } else {
            selectedAnswers.push(a);
        }

        if (selectedAnswers.length === question.max) {
            setIsDisabled(true);
        } else
            setIsDisabled(false);
    }

    const handleTextAnswer = (val) => {
        selectedAnswers[0] = val.target.value;
    }

    return question.options ? (<>
        <div className="flex-fill m-auto">
            <Form.Group className="m-0" controlId="formBasicCheckbox">
                <div>
                    <Form.Label className="font-weight-bold">Q{id + 1}:&nbsp;</Form.Label>
                    <Form.Label className="font-italic">{question.question}</Form.Label>
                </div>
            </Form.Group>
            <div className="text-right">
                <Form.Label className="font-italic">{constraint}:&nbsp;
                    <small>min:{question.min} max:{question.max}</small> </Form.Label>
            </div>
            <Form.Group>
                <div>
                    <Mcq question={question} handleAnswer={handleAnswer} isDisabled={isDisabled}
                         selectedAnswers={selectedAnswers}/>
                </div>
            </Form.Group>
        </div>
    </>) : (
        <>
            <div className="flex-fill m-auto">
                <Form.Group>
                    <div>
                        <Form.Label className="font-weight-bold">Q{id + 1}:&nbsp;</Form.Label>
                        <Form.Label className="font-italic">{question.question}</Form.Label>
                    </div>
                </Form.Group>
                <div className="text-right">
                    <Form.Label className="font-italic">{constraint}</Form.Label>
                </div>
                <Form.Group>
                    <Form.Label>Write you answer:</Form.Label>
                    <Form.Control as="input" type="text" maxLength="200" onChange={handleTextAnswer}/>
                </Form.Group>
            </div>
        </>

    );
}

const QuestionList = (props) => {
    const {questions, onSave} = props;
    const results = [];
    let selectedUsername = '';
    let validated = true;
    const {id} = useParams();

    const handleUsername = (val) => {
        selectedUsername = val.target.value;
    }

    const handleSubmit = (event) => {
        validated = true;
        if (!selectedUsername) {
            const message = `Please: enter an username before submitting. It is mandatory!`;
            window.alert(message);
            validated = false;
        }
        if (selectedUsername.length > 30) {
            const message = `Violated constraints!\nPlease note: for username you can use at most 30 char!`;
            window.alert(message);
            validated = false;
        }

        questions.forEach((q, index) => {
            if (q.options) {
                if (results[index].length < q.min || results[index].length > q.max) {
                    const message = `Violated constraints! Review answer to: Q${index + 1}!\nPlease note:  min:${q.min} - max:${q.max}`;
                    window.alert(message);
                    validated = false;

                } else {

                }
            } else {
                if ((q.min === 1) && (results[index].length === 0)) {
                    const message = `Violated constraints!\nPlease note: answer for Q${index + 1} it is mandatory!`;
                    window.alert(message);
                    validated = false;
                }
                if (results[index][0] > 200) {
                    const message = `Violated constraints!\nPlease note: for answer Q${index + 1} you can use at most 200 char!`;
                    window.alert(message);
                    validated = false;
                }
            }
        });

        if (validated === true) {

            results.forEach((r, i, s) => {
                if (questions[i].options === undefined) {
                    results[i] = {"answer": results[i][0]};
                } else {
                    results[i] = {"answer": results[i]}
                }
            });

            onSave(results, id, selectedUsername);
        } else {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    return (
        <>
            <div>
                <Form>
                    <Form.Group as={Col}>
                        <Form.Label className="font-weight-bold">Please, insert your username:</Form.Label>
                        <Form.Control as="input"
                                      required
                                      type="text"
                                      maxLength="30"
                                      placeholder="Your Username"
                                      onChange={handleUsername}
                        />
                    </Form.Group>
                </Form>
            </div>
            <ListGroup as="ul" variant="flush">
                {
                    questions.map((q, i) => {
                        const selectedAnswers = [];
                        const id = questions.indexOf(q);
                        results.splice(id, 0, selectedAnswers);
                        return (
                            <ListGroup.Item as="li" key={i} className="d-flex w-100 justify-content-between">
                                <QuestionRowData question={q} id={id} selectedAnswers={selectedAnswers}/>
                            </ListGroup.Item>
                        );
                    })
                }
            </ListGroup>
            <div className="text-center">
                <Button as={NavLink} to={"/"} type="submit" className="mb-5" onClick={handleSubmit}>Submit
                    survey</Button>
            </div>
        </>
    )
}

const SurveyRowData = (props) => {
    const {survey, loggedIn} = props;

    return (
        <> {loggedIn ? (
            <div className="flex-fill m-auto">
                <Row>
                    <Col className="col-lg-6  font-italic">Survey {survey.id}: <p
                        className="text-uppercase font-weight-bold">{survey.title}</p></Col>
                    <Col className="col-lg-5 text-center">answers: <p
                        className="text-uppercase font-weight-bold">{survey.N_answ}</p></Col>
                </Row>
            </div>
        ) : (
            <div className="flex-fill m-auto">
                <Row>
                    <Col className="col-lg-10 font-italic">Survey {survey.id}: <p
                        className="text-uppercase font-weight-bold">{survey.title}</p></Col>
                </Row>
            </div>
        )}

        </>
    )
}

const SurveyRowControl = (props) => {
    const {onViewing, survey, onQuestion, loggedIn} = props;
    return (
        <>{loggedIn ? (
            <div>
                <Button as={NavLink} to={`/admin/${survey.id}`} variant="outline-dark" onClick={onViewing}> View
                    Results</Button>
            </div>
        ) : (
            <div>
                <Button as={NavLink} to={`/surveys/${survey.id}`} variant="outline-dark" onClick={onQuestion}> Start to
                    answer</Button>
            </div>
        )}

        </>
    )
}

const SurveyList = (props) => {
    const {onViewing, surveys, onQuestion, loggedIn} = props;
    return (
        <>
            {loggedIn ? (
                <ListGroup as="ul" variant="flush">
                    {
                        surveys.map(s => {
                            return (
                                <ListGroup.Item as="li" key={s.id} className="d-flex w-100 justify-content-between">
                                    <SurveyRowData survey={s} loggedIn={loggedIn}/>
                                    <SurveyRowControl onViewing={onViewing} survey={s} loggedIn={loggedIn}/>
                                </ListGroup.Item>
                            );
                        })
                    }
                </ListGroup>

            ) : (
                <ListGroup as="ul" variant="flush">
                    {
                        surveys.map(s => {
                            return (
                                <ListGroup.Item as="li" key={s.id} className="d-flex w-100 justify-content-between">
                                    <SurveyRowData survey={s}/>
                                    <SurveyRowControl survey={s} onQuestion={onQuestion}/>
                                </ListGroup.Item>
                            );
                        })
                    }
                </ListGroup>
            )}

        </>
    )
}


const ViewRowData = (props) => {
    const {answer, q} = props;
    let singleAnsw = [];
    singleAnsw = answer;

    return (
        <>
            {
                singleAnsw.map((sa, index) => (
                    <ListGroup.Item as="li" key={index}
                                    className="d-flex w-100 justify-content-between">
                        <div className="flex-fill m-auto">
                            <div
                                className="mb-2 col-lg-12 font-weight-bold">Question: {q[index].question.toString()}&nbsp;&nbsp;[{q[index].min === 0 ? ("Optional") : ("Mandatory")}]</div>
                            <div
                                className="font-italic col-lg-12">Answer: {sa.answer === undefined ? sa.answer : sa.answer.toString()}</div>
                        </div>
                    </ListGroup.Item>

                ))
            }

        </>
    )
}


const ViewList = (props) => {
    const {results} = props;
    let answers = [];
    let questions = [];


    for (let i = 0; i < results.length; i++)
        answers[i] = JSON.parse(results[i].answers);


    if (results[0] !== undefined) {
        questions.push(JSON.parse(results[0].questions));

    }


    return (
        <>
            <Carousel slide={false} fade={false}>
                {results.map(
                    (r, i) => (
                        <Carousel.Item key={i}>
                            <h2 className="text-muted col-12 text-center">User: {`${r.user}`}</h2>
                            <div style={{margin: "auto", width: "80%"}}>
                                <ListGroup as="ul" variant="flush">
                                    <ViewRowData answer={answers[i]} q={questions[0]}/>
                                </ListGroup>
                            </div>
                        </Carousel.Item>
                    )
                )
                }
            </Carousel>
        </>
    )
}


const List = {SurveyList, QuestionList, ViewList}
export default List;
