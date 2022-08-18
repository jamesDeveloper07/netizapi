import React, { useState, useRef, useEffect } from 'react';
import api from "../../../../services/api";

import ReactBSAlert from "react-bootstrap-sweetalert";
import NotificationAlert from "react-notification-alert";
import { useDropzone } from 'react-dropzone';
import {
    Spinner,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
    FormGroup,
    Input,
    Button
} from "reactstrap";

export default ({ history }) => {

    const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
        noClick: true,
        noKeyboard: true,
        accept: 'image/*',
        onDrop: (acceptedFiles) => {
            const newFile = acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            }))
            if (newFile.length === 0) return

            setAvatar(newFile[0])
            setUser({
                ...user,
                avatar: null,
                avatar_url: newFile[0].preview
            })
        }
    });

    const [user, setUser] = useState({})
    const [email, setEmail] = useState(null)
    const [name, setName] = useState(null)
    const [novaSenha, setNovaSenha] = useState(null)
    const [confirmeNovaSenha, setConfirmeNovaSenha] = useState(null)
    const [senhaAtual, setSenhaAtual] = useState(null)
    const [avatar, setAvatar] = useState(null)

    const [savingAvatar, setSavingAvatar] = useState(false)
    const [erros, setErros] = useState({})
    const [alert, setAlert] = useState(null)
    const notificationAlert = useRef()

    useEffect(() => {
        if (!user.id) loadUser()
    }, [])

    useEffect(() => {
        if (avatar != null) saveAvatar()
    }, [avatar])


    useEffect(() => {
        setEmail(user.email)
        setName(user.name)
    }, [user])

    function handleGoBack() {
        history.goBack()
    }

    async function saveAvatar() {
        setSavingAvatar(true)
        try {
            let formData = new FormData()
            formData.append("avatar", avatar);
            const response = await api.post(`/security/sessions/me/avatars`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                })
            setUser(response.data)
        } catch (error) {
            notify('danger', 'Não foi possível alterar sua imagem')
        }
        setSavingAvatar(false)
    }

    const successAlert = (msg) => {
        setAlert(
            <ReactBSAlert
                success
                style={{ display: "block", marginTop: "-100px", maxWidth: "500px" }}
                title={msg}
                onConfirm={handleGoBack}
                confirmBtnBsStyle="success"
                confirmBtnText="Ok"
                btnSize=""
            >
            </ReactBSAlert>
        )
        setTimeout(handleGoBack, 2000);
    };

    async function loadUser() {
        try {
            const response = await api.get('/sessions')
            setUser(response.data)
        } catch (err) {
            notify('danger', err)
        }
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

    async function handleSave() {
        try {
            const response = await api.put("/security/sessions", {
                id: user.id,
                name,
                email,
                nova_senha: novaSenha,
                confirme_nova_senha: confirmeNovaSenha,
                password: senhaAtual
            });
            setUser(response.data)
            successAlert('Conta alterada')
        } catch (err) {
            notify('danger', "Não foi possível salvar usuário")
            if (err.response) updateErros(err.response.data)
        }
    }

    function updateErros(error) {
        try {
            if (error) {
                const errors = {}
                for (let e of error) {
                    errors[e.field] = e.message
                }
                setErros(errors)
            } else {
                setErros({})
            }
        } catch (error) {
            console.log(error)
            notify(error)
        }
    }

    return (
        <>
            <div className="rna-wrapper">
                <NotificationAlert ref={notificationAlert} />
            </div>
            {alert}
            <Container className="mt--6" fluid>
                <Card className="card-profile">
                    <Row className="justify-content-center">
                        <Col className="order-lg-2" lg="3">
                            <div className="card-profile-image">

                                <div {...getRootProps({ className: 'dropzone' })}>
                                    <div
                                        title='Alterar foto'
                                        onClick={open}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {
                                            (user.avatar && user.avatar.length > 0) ?
                                                <a href="#" onClick={e => e.preventDefault()} style={{ marginBottom: 50 }}>
                                                    <img
                                                        alt="avatar"
                                                        className="rounded-circle"
                                                        src={user.avatar_url}
                                                    />
                                                </a>
                                                :
                                                <a
                                                    className="avatar avatar-xl rounded-circle mt--4"
                                                    href="#"
                                                    onClick={e => e.preventDefault()}
                                                >
                                                    <i class="fas fa-user"></i>
                                                </a>

                                        }
                                        <Spinner
                                            hidden={!savingAvatar}
                                            color="light"
                                            size="md"
                                        />
                                    </div>

                                    <input {...getInputProps()} />
                                </div>

                            </div>
                        </Col>
                    </Row>
                    <CardHeader className="text-center ">
                        <label className='text-muted'>
                            {user.email}
                        </label>
                    </CardHeader>
                    <CardBody
                        outline
                        body
                    >
                        <Row className='mb-4'>
                            <Col>
                                <Row>
                                    <Col lg='6' xs='12' md='12' sm="12">
                                        <FormGroup>
                                            <label className="form-control-label">
                                                Nome*
                                    </label>
                                            <Input
                                                type="text"
                                                name="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                            <small class="text-danger">{erros.name ? erros.name : ''}</small>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <hr />
                        <Row>
                            <Col lg='6' xs='12' md='6' sm="12">
                                <FormGroup>
                                    <label className="form-control-label">
                                        Nova senha
                                </label>
                                    <Input
                                        type="password"
                                        name="nova_senha"
                                        value={novaSenha}
                                        onChange={(e) => setNovaSenha(e.target.value)}
                                    />
                                    <small class="text-danger">{erros.nova_senha ? erros.nova_senha : ''}</small>
                                    <small class="form-text text-muted">Deixe em branco caso não queira alterar</small>
                                </FormGroup>
                            </Col>
                            <Col lg='6' xs='12' md='6' sm="12">
                                <FormGroup>
                                    <label className="form-control-label">
                                        Confirme nova senha
                                </label>
                                    <Input
                                        type="password"
                                        name="confirme_nova_senha"
                                        value={confirmeNovaSenha}
                                        onChange={(e) => setConfirmeNovaSenha(e.target.value)}
                                    />
                                    <small class="text-danger">{erros.confirme_nova_senha || ''}</small>
                                </FormGroup>
                            </Col>
                            <Col lg='6' xs='12' md='6' sm="12">
                                <FormGroup>
                                    <label className="form-control-label">
                                        Senha atual
                                </label>
                                    <Input
                                        type="password"
                                        name="senha_atual"
                                        value={senhaAtual}
                                        onChange={(e) => setSenhaAtual(e.target.value)}
                                    />
                                    <small class="text-danger">{erros.password || ''}</small>
                                    <small class="form-text text-muted">Sua senha atual só é nescessária caso deseje altera-la</small>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div className="float-right">
                                    <Button
                                        className="ml-auto"
                                        color="link"
                                        data-dismiss="modal"
                                        type="button"
                                        onClick={handleGoBack}
                                    >
                                        Voltar
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        color="primary">
                                        Salvar
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Container>
        </>
    );
}
