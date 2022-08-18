import React, { useState, useRef } from 'react';
import api from "../../../../services/api";

import ReactBSAlert from "react-bootstrap-sweetalert";
import NotificationAlert from "react-notification-alert";
import {
    Row,
    Button,
    FormGroup,
    InputGroup,
    CardTitle,
    InputGroupAddon,
    InputGroupText,
    Input,
    CardText,
    Card,
    CardBody,
    Container,
    Col,
} from "reactstrap";


export default ({ history, ...props }) => {

    const [email, setEmail] = useState(null)
    const [alert, setAlert] = useState(null)

    const notificationAlert = useRef()


    const notify = (type, msg) => {
        let options = {
            place: "tc",
            message: (
                <div className="alert-text">
                    <span data-notify="message">
                        {msg}
                    </span>
                </div>
            ),
            type: type,
            icon: "ni ni-bell-55",
            autoDismiss: 7
        };
        notificationAlert.current.notificationAlert(options);
    };


    async function handleRequestNewPassword() {
        if (!email) return
        try {
            await api.post(`/security/usuarios/${email}/forgot-password`);
            setAlert(<ReactBSAlert
                success
                allowEscape={false}
                confirmBtnText='Certo'
                onConfirm={() => history.push('/auth/login')}
                confirmBtnBsStyle="success"
            >
                Verifique seu email, você deve receber novas instruções a qualquer momento.
            </ReactBSAlert>)
        } catch (err) {
            console.log(err);
            notify('danger', 'Houve um problema ao solicitar sua recuperação de senha');
            if (err.response) {
                const response = err.response.data
                if ('message' in response) {
                    setAlert(<ReactBSAlert
                        warning
                        confirmBtnText='Ok'
                        onConfirm={() => setAlert(null)}
                    >
                        {response.message}
                    </ReactBSAlert>)
                }
            }
        }
    }

    return (
        < Container >
            {alert}
            <div className="rna-wrapper">
                <NotificationAlert ref={notificationAlert} />
            </div>
            <Row className="justify-content-center">
                <Col lg="5" md="7">
                    <Card className='bg-secondary border-0 mb-0 mt-7' >

                        <CardBody className="mt-5 pr-25 pl-25">
                            <CardTitle className="mb-3" tag="h3">
                                Esqueceu a senha?
                                </CardTitle>
                            <CardText className="mb-4">
                                Informe seu email para receber instruções para recuperação da sua senha
                            </CardText>
                            <FormGroup
                                className='mb-3'
                            >
                                <InputGroup className="input-group-merge input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-email-83" />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        onChange={({ target }) => setEmail(target.value)}
                                        onKeyPress={({ key }) => {
                                            if (key == 'Enter') handleRequestNewPassword()
                                        }}
                                    />
                                </InputGroup>
                            </FormGroup>
                            <div className="text-center">
                                <Button
                                    disabled={!email}
                                    className="my-4"
                                    color="primary"
                                    onClick={handleRequestNewPassword}>
                                    Continuar
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                    <Row className="mt-3">
                        <Col xs="6">
                            <a
                                className="text-light"
                                href="#"
                                onClick={e => history.push('/auth/login')}
                            >
                                <small>Sign in</small>
                            </a>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container >
    );
}
