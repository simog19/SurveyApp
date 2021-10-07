import React, {useState} from 'react';
import {Modal, Form, Button} from 'react-bootstrap';


const ModalForm = (props) => {
    const {setShowModal, onSave} = props;

    // use controlled form components
    const [question, setQuestion] = useState('');
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(0);
    const [options, setOptions] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isMandatory, setIsMandatory] = useState(false);

    const [validated, setValidated] = useState(false);


    const handleSubmit = (event) => {

        // stop event default and propagation
        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;

        if (!form.checkValidity()) {
            setValidated(true); // enables bootstrap validation error report
        } else {

            if (isOpen) {
                if (isMandatory) {
                    const newQuestion = Object.assign({}, {
                        min: 1,
                        question: question
                    });
                    onSave(newQuestion);
                } else {
                    const newQuestion = Object.assign({}, {
                        min: 0,
                        question: question
                    });
                    onSave(newQuestion);
                }
            } else {
                let opt = [];
                opt = options.split(",", 10);

                const newQuestion = Object.assign({}, {
                    min: (opt.length < min) ? opt.length - 1 : min,
                    max: (opt.length < max) ? opt.length : max,
                    question: question,
                    options: opt
                });
                onSave(newQuestion);
            }
        }
    }

    const onClose = () => setShowModal(false);

    return (
        <Modal show onHide={onClose} animation={false}>
            <Modal.Header closeButton>
                <Modal.Title>Add question</Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group controlId="form-question">
                        <Form.Label>Question</Form.Label>
                        <Form.Control type="text" name="question" placeholder="Enter question" value={question}
                                      onChange={(ev) => setQuestion(ev.target.value)} required autoFocus/>
                        <Form.Control.Feedback type="invalid">
                            Please provide the question.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="form-is-open">
                        <Form.Check custom type="checkbox" label="Open answer" name="isOpen" checked={isOpen}
                                    onChange={(ev) => setIsOpen(ev.target.checked)}/>
                    </Form.Group>
                    {isOpen && <Form.Group controlId="form-is-mandatory">
                        <Form.Check custom type="checkbox" label="Mandatory" name="isMandatory"
                                    checked={isMandatory} onChange={(ev) => setIsMandatory(ev.target.checked)}/>
                    </Form.Group>}
                    <Form.Group controlId="form-value">
                        <Form.Label>Min</Form.Label>
                        <Form.Control type="number" min="0" max="10" name="min"
                                      placeholder="Enter n.min of choices(0-10)"
                                      disabled={isOpen} onChange={(ev) => setMin(ev.target.value)} required autoFocus/>
                        <Form.Control.Feedback type="invalid">
                            Please provide a value.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Max</Form.Label>
                        <Form.Control type="number" min="0" max="10" name="max"
                                      placeholder="Enter n.max of choices(0-10)"
                                      disabled={isOpen} onChange={(ev) => setMax(ev.target.value)} required autoFocus/>
                        <Form.Control.Feedback type="invalid">
                            Please provide a value.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="form-options">
                        <Form.Label>Options</Form.Label>
                        <Form.Control type="text" name="options"
                                      placeholder="Enter options separated by a comma (ex. Yes,No)" value={options}
                                      onChange={(ev) => setOptions(ev.target.value)} disabled={isOpen} required
                                      autoFocus/>
                        <Form.Control.Feedback type="invalid">
                            Please provide the options.
                        </Form.Control.Feedback>
                    </Form.Group>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )

}

export default ModalForm;
