import {Form, Button, Alert, Modal} from 'react-bootstrap';
import {React, useState} from 'react';
import {Redirect} from "react-router-dom";

function LoginForm({shouldShow, setShouldShow, login}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage('');
        const credentials = {username, password};

        // basic validation
        let valid = true;
        if (username === '' || password === '' || password.length < 6) {
            valid = false;
            setErrorMessage('Email cannot be empty and password must be at least six character long.');
            setShow(true);
        }

        if (valid) {
            login(credentials)
                .catch((err) => {
                    setErrorMessage(err);
                    setShow(true);
                })
        }

    };


    const handleShow = () => setShouldShow(false);


    return shouldShow === true ? (
        <Modal centered show animation={false}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton onClick={handleShow}>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert
                        dismissible
                        show={show}
                        onClose={() => setShow(false)}
                        variant="danger">
                        {errorMessage}
                    </Alert>
                    <Form.Group controlId="username">
                        <Form.Label>email</Form.Label>
                        <Form.Control
                            type="email"
                            value={username}
                            onChange={(ev) => setUsername(ev.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(ev) => setPassword(ev.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleShow}>
                        Close
                    </Button>
                    <Button type="submit" onClick={handleSubmit}>Login</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    ) : (<Redirect to="/"/>);
}

function LogoutButton(props) {
    return (
        <Button variant="outline-light" onClick={props.logout}>Logout</Button>
    )
}

function LoginButton(props) {
    return (
        <Button className="float-right" variant="outline-light" onClick={props.login}>Login</Button>
    )
}

export {LoginForm, LogoutButton, LoginButton};
