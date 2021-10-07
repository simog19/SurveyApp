import {Form, ListGroup, Button, Col} from 'react-bootstrap';
import {NavLink} from 'react-router-dom';
import {React, useState} from "react";
import ModalForm from './ModalForm'
import {Trash, ArrowUpCircle, ArrowDownCircle} from 'react-bootstrap-icons';

const CreationRowControl = (props) => {
    const {question, onDelete, onUp, onDown} = props;
    return (
        <>{
            <div>
                <div className="ml-10">
                    <Button variant="link" className="shadow-none" onClick={onUp}><ArrowUpCircle/></Button>
                    <Button variant="link" className="shadow-none" onClick={onDown}><ArrowDownCircle/></Button>
                    <Button variant="link" className="shadow-none" onClick={onDelete}><Trash/></Button>
                </div>
                <div>
                    <small>min:{question.min} max:{question.max ? question.max : '1'}</small>
                </div>
            </div>

        }
        </>
    )
}

const CreationRowData = (props) => {
    const {question} = props;
    return (
        <>
            <div className="flex-fill m-auto">
                <div className="mb-2 col-lg-12 font-weight-bold">Question: {question.question} </div>
                <div
                    className="font-italic col-lg-12">Options: {question.options ? question.options.toString() : '**open-ended question**'} </div>
            </div>
        </>
    )
}

const CreationList = (props) => {
    const {onSave, admin} = props;
    const [createdList, setCreatedList] = useState([]);
    const [title, setTitle] = useState('');
    let validated = true;

    const handleUsername = (val) => {
        setTitle(val.target.value);
    }

    const [showModal, setShowModal] = useState(false);

    const startQuestionCreate = () => {
        setShowModal(true);
    }
    const handleSaveQuestion = (question) => {
        setCreatedList((oldValue) => ([...oldValue, question]));
        setShowModal(false);
    }

    const handleDelete = (q) => {
        setCreatedList(createdList.filter(el => el !== q));
    }

    const goDown = (question) => {
        setCreatedList(oldList => {
            let newList = [];

            if (question === oldList[oldList.length - 1])
                return oldList;

            for (let i = 0; i < oldList.length;) {
                if (oldList[i] === question) {
                    newList.push(oldList[i + 1]);
                    newList.push(oldList[i]);
                    i += 2;
                } else {
                    newList.push(oldList[i]);
                    i++;
                }
            }
            return newList;
        });
    }

    const goUp = (question) => {
        setCreatedList(oldList => {
            let newList = [];
            if (question === oldList[0])
                return oldList;

            for (let i = 0; i < oldList.length; i++) {
                if (oldList[i] === question) {
                    newList[i - 1] = oldList[i];
                    newList[i] = oldList[i - 1];
                } else {
                    newList[i] = oldList[i];
                }
            }
            return newList;
        });
    }

    const handleSubmit = (event) => {
        validated = true;
        if (title === '') {
            const message = `Please: enter a title before publish this survey.`;
            window.alert(message);
            validated = (false);
        }
        //check on title length not required
        if (title.length > 200) {
            const message = `Violated constraints!\nPlease note: for title you can use at most 200 char!`;
            window.alert(message);
            validated = (false);
        }
        if (createdList.length === 0) {
            const message = `Add one question at least!`;
            window.alert(message);
            validated = (false);
        }

        if (validated === true) {

            const survey = {
                "title": title,
                "questions": createdList
            }
            onSave(survey, admin.id);
        } else {
            event.preventDefault();
            event.stopPropagation();
        }

    }


    return (
        <>
            <div>
                <div className="text-center mt-3">
                    <Button as={NavLink} to={"/admin"} type="submit" onClick={handleSubmit}>Publish survey</Button>{' '}
                    <Button variant="danger outline-light" onClick={startQuestionCreate}>Add new question</Button>
                    {showModal ?
                        <ModalForm show={showModal} setShowModal={setShowModal} onSave={handleSaveQuestion}/> : ''}
                </div>
                <Form>
                    <Form.Group as={Col}>
                        <Form.Label className="font-weight-bold">Insert a title here below:</Form.Label>
                        <Form.Control as="input"
                                      required
                                      type="text"
                                      maxLength="200"
                                      placeholder="Title"
                                      onChange={handleUsername}
                        />
                    </Form.Group>
                </Form>
            </div>
            <ListGroup as="ul" variant="flush">
                {
                    createdList.map((q, i) => {
                        return (
                            <ListGroup.Item as="li" key={i} className="d-flex w-100 justify-content-between">
                                <CreationRowData question={q}/>
                                <CreationRowControl question={q} onDelete={() => handleDelete(q)}
                                                    onDown={() => goDown(q)}
                                                    onUp={() => goUp(q)}/>
                            </ListGroup.Item>
                        );
                    })
                }
            </ListGroup>
        </>
    )
}


export default CreationList;