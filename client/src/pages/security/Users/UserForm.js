import React, { useState, useRef, useEffect } from 'react';
import api from "../../../services/api";


import Select2 from "react-select2-wrapper";
import {
    FormGroup,
    Input,
    Button,
    Row,
    Col,

} from "reactstrap";

export default ({ user,
    notify,
    history,
    onUserChange,
    ...props }) => {

    const [nome, setNome] = useState(null)
    const [email, setEmail] = useState(null)
    const [situacao, setSituacao] = useState(1)

    const [erros, setErros] = useState({})

    useEffect(() => {
        setNome(user.name)
        setEmail(user.email)
        setSituacao(user.status ? 1 : 0)
    }, [user])


    function handleSave() {
        if (user && user.id) {
            update()
        } else {
            insert()
        }
    }

    async function insert() {
        try {
            const response = await api.post('/security/usuarios', {
                name: nome,
                email: email ? email.trim().toLowerCase() : email,
                password: email ? email.trim().toLowerCase() : email,
                status: situacao,
            })
            updateErros(null)
            notify('success', 'Usuário adicionada com sucesso')
            if (onUserChange) onUserChange(response.data)
        } catch (error) {
            console.log(error)
            if (notify) notify('danger', 'Não foi possível salvar usuário')
            updateErros(error.response.data)
        }
    }

    async function update() {
        try {
            const response = await api.put(`/security/usuarios/${user.id}`, {
                name: nome,
                status: situacao,
            })
            updateErros(null)
            notify('success', 'Usuário alterada com sucesso')
            if (onUserChange) onUserChange(response.data)
        } catch (error) {
            console.log(error)
            if (notify) notify('danger', 'Não foi possível salvar Usuário')
            updateErros(error.response.data)
        }
    }

    function updateErros(error) {
        if (error) {
            const errors = {}
            for (let e of error) {
                errors[e.field] = e.message
            }
            setErros(errors)
        } else {
            setErros({})
        }
    }

    return (
        <>
            <Row>
                <Col >
                    <FormGroup>
                        <label
                            className="form-control-label"
                        >
                            Nome*
                        </label>
                        <Input
                            className="form-control"
                            placeholder="Nome do usuário..."
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                        <small class="text-danger">
                            {erros.name ? erros.name : ''}
                        </small>
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
                        <label
                            className="form-control-label"
                        >
                            Email*
                        </label>
                        <Input
                            disabled={user.id}
                            className="form-control"
                            placeholder="Email do usuário..."
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <small class="text-muted">
                            {user.id ? '' : 'Vamos enviar um email para o usuário ativar sua conta.'}
                        </small>
                        <small class="text-danger">
                            {erros.email ? erros.email : ''}
                        </small>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col lg={6} md={6}>
                    <FormGroup>
                        <label
                            className="form-control-label"
                            htmlFor="example-number-input"
                        >
                            Situação*
                        </label>

                        <Select2
                            onSelect={(e) => { setSituacao(e.target.value) }}
                            options={{
                                placeholder: "Selecione a situação do usuário..."
                            }}
                            value={situacao}
                            data={
                                [{ id: 1, text: 'Ativo' }, { id: 0, text: 'Inativo' }]
                            }
                        />
                        <small class="text-danger">
                            {erros.status ? erros.status : ''}
                        </small>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div className="float-right ">
                        <Button
                            className="ml-auto"
                            color="link"
                            data-dismiss="modal"
                            type="button"
                            onClick={() => history.goBack()}
                        >
                            Voltar
                          </Button>
                        <Button
                            color="primary"
                            onClick={handleSave}
                        >
                            Salvar
                          </Button>
                    </div>
                </Col>
            </Row>
        </>
    );
}
