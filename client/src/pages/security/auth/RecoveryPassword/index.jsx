import React, { useState, useRef, useEffect, useContext } from 'react';
import AuthContext from "../../../../contexts/Auth";
import api from "../../../../services/api";
import { login } from "../../../../services/auth";

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

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

export default ({ match, history, ...props }) => {

    const { saveAuth } = useContext(AuthContext)
    const [password, setPassword] = useState(null)
    const [alert, setAlert] = useState(null)
    const [user, setUser] = useState({})

    const [passwordType, setPasswordType] = useState('password')

    const notificationAlert = useRef()

    useEffect(() => {
        if (!token) {
            showInvalidAlert()
        } else if (!user.id) {
            loadUser()
        }
    }, [])


    async function loadUser() {
        try {
            const response = await api.get(`/security/forgot-password?token=${token}`);
            setUser(response.data)
        } catch (err) {
            console.log(err);
            notify('danger', 'URL inválida');
            if (err.response) {
                const response = err.response.data
                if ('message' in response) {
                    showInvalidAlert(response.message, false)
                }
            }
        }
    }

    function showInvalidAlert(msg, getOut = true) {
        setAlert(<ReactBSAlert
            warning
            confirmBtnText='Ok'
            onConfirm={() => getOut ? history.push('/') : setAlert(null)}
        >
            {msg || 'Link de recuperação inválido. Tente solicitar um novo link de recuperação de senha.'}
        </ReactBSAlert>)
    }

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
        //if (notificationAlert.current) notificationAlert?.current?.notificationAlert(options);
    };


    async function handleSavePassword() {
        if (!password) return
        try {
            const response = await api.post(`/security/recovery-password`, {
                password,
                token
            });
            saveAuth(response)
            history.push('/admin')
        } catch (err) {
            console.log(err);
            notify('danger', 'Houve um problema ao solicitar sua recuperação de senha');
            if (err.response) {
                const response = err.response.data
                if ('message' in response) {
                    showInvalidAlert(response.message)
                } else if (response instanceof Array) {
                    const message = response.map(item => `${item.message}\n`)
                    showInvalidAlert(message, false)
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
                                Nova senha
                                </CardTitle>
                            <CardText className="mb-4">
                                <h2>
                                    {`Olá, ${user.name}`}
                                </h2>
                                <p>
                                    {`Você pode informar sua nova senha de acesso logo a baixo`}
                                </p>
                            </CardText>
                            <FormGroup
                                className='mb-3'
                            >
                                <InputGroup className="input-group-merge input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-lock-circle-open" />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        placeholder="Sua senha..."
                                        type={passwordType}
                                        onChange={({ target }) => setPassword(target.value)}
                                    />
                                    <InputGroupAddon addonType="append">
                                        <InputGroupText>
                                            <Button
                                                color='link'
                                                size='xs'
                                                className='m-0 p-0'
                                                onClick={() => setPasswordType(passwordType == 'text' ? 'password' : 'text')}
                                            >
                                                {passwordType == 'password' ? 'mostrar' : 'esconder'}
                                            </Button>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormGroup>
                            <div className="text-center">
                                <Button
                                    disabled={!password}
                                    className="my-4"
                                    color="primary"
                                    onClick={handleSavePassword}>
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
