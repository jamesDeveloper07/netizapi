import React, { useEffect, useState, useRef } from 'react';
import { login } from "../../../../services/auth";
import api from "../../../../services/api";

import NotificationAlert from "react-notification-alert";
import {
    Row,
    Button,
    Input,
    Card,
    CardBody,
    Container,
    Col
} from "reactstrap";

const user = JSON.parse(localStorage.getItem('user'))

export default ({ history, ...props }) => {

    const [password, setPassword] = useState(null)

    const notificationAlert = useRef()

    useEffect(() => {
        if (!user) history.push('/auth/login')
    }, [])

    function handleCancelar() {
        localStorage.removeItem('user')
        history.push('/auth/login')
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
        notificationAlert.current.notificationAlert(options);
    };


    async function handleLogin() {
        if (!password) return
        try {
            const response = await api.post("/sessions", { email: user.email, password });
            login(response.data.token)
            history.push("/admin/publicacoes");
        } catch (err) {
            console.log(err);
            notify('danger', 'Houve um problema com o login, verifique suas credenciais.');
        }
    }

    return (
        <Container>
            <div className="rna-wrapper">
                <NotificationAlert ref={notificationAlert} />
            </div>
            <Row className="justify-content-center ">
                <Card className="card-profile" style={{ marginTop: 100 }}>
                    <Row className="justify-content-center">
                        <Col className="order-lg-2" lg="3">
                            <div className="card-profile-image">
                                {
                                    (user.avatar && user.avatar.length > 0) ?
                                        <a href="#pablo" onClick={e => e.preventDefault()} style={{ marginBottom: 50 }}>
                                            <img
                                                alt="avatar"
                                                className="rounded-circle"
                                                src={user.avatar_url}
                                            />

                                        </a>
                                        :
                                        <a
                                            className="avatar avatar-xl rounded-circle mt--4"
                                            href="#pablo"
                                            onClick={e => e.preventDefault()}
                                        >
                                            <i class="fas fa-user"></i>
                                            {user.email}
                                        </a>

                                }
                            </div>

                        </Col>
                    </Row>
                    <CardBody className="pt-5 mt-5 pr-25 pl-25">
                        <div className="text-muted justify-content-center text-center ">{user.email}</div>
                        <div className="heading justify-content-center text-center">{`Olá, ${user.name}`}</div>
                        <div className="description justify-content-center text-center mt-4">
                            {`Para sua segurança, precisamos que você efetue login novamente.`}<br />
                            {`Caso você não seja ${user.name}, clique em cancelar.`}
                        </div>
                        <Row>
                            <div className="col">
                                <div className="card-profile-stats d-flex justify-content-center">
                                    <Input
                                        style={{ maxWidth: '65%' }}
                                        placeholder="Senha"
                                        type="password"
                                        onChange={({ target }) => setPassword(target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="card-profile-stats d-flex justify-content-center">
                                    <Button
                                        color='primary'
                                        onClick={handleLogin}
                                    >
                                        Entrar
                                    </Button>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center mt-5" style={{ flex: 1 }}>
                                <Button
                                    color='link'
                                    onClick={handleCancelar}
                                >
                                    Cancelar
                                    </Button>
                            </div>
                        </Row>

                    </CardBody>
                </Card>
            </Row>
        </Container>
    );
}
