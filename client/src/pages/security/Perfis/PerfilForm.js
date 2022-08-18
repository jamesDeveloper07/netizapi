import React, { useState, useEffect } from 'react';
import api from "../../../services/api";

import {
    FormGroup,
    Input,
    Button,
    Row,
    Col,
    InputGroupAddon,
    InputGroup,
    UncontrolledPopover,
    PopoverBody
} from "reactstrap";

export default ({ perfil,
    notify,
    history,
    onPerfilChange,
    ...props }) => {

    const [name, setName] = useState(null)
    const [slug, setSlug] = useState(null)
    const [description, setDescription] = useState(null)
    const [is_invisible, setIs_invisible] = useState(null)

    const [erros, setErros] = useState({})

    useEffect(() => {
        setName(perfil.name)
        setSlug(perfil.slug)
        setDescription(perfil.description)
        setIs_invisible(perfil.is_invisible)
    }, [perfil])


    function handleSave() {
        if (perfil && perfil.id) {
            update()
        } else {
            insert()
        }
    }

    async function insert() {
        try {
            const response = await api.post('/security/perfis', {
                name,
                slug,
                description,
                is_invisible
            })
            updateErros(null)
            notify('success', 'Perfil adicionado com sucesso')
            if (onPerfilChange) onPerfilChange(response.data)
        } catch (error) {
            console.log(error)
            if (notify) notify('danger', 'Não foi possível salvar perfil')
            updateErros(error.response.data)
        }
    }

    async function update() {
        try {
            const response = await api.put(`/security/perfis/${perfil.id}`, {
                name,
                slug,
                description,
                is_invisible
            })
            updateErros(null)
            notify('success', 'Perfil alterado com sucesso')
            if (onPerfilChange) onPerfilChange(response.data)
        } catch (error) {
            console.log(error)
            if (notify) notify('danger', 'Não foi possível salvar perfil')
            updateErros(error.response.data)
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
            console.error(error)
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
                            placeholder="Nome do perfil..."
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <small class="text-danger">
                            {erros.name || ''}
                        </small>
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
                        <label
                            className="form-control-label"
                        >
                            Apelido(name key)*
                        </label>
                        <Input
                            disabled={perfil.id}
                            className="form-control"
                            placeholder="ex.: gestor_comercial"
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                        />
                        <small class="text-muted">
                            Esse apelido servirá como chave interna do sistema para identificar o menu.
                            Ele será unico na base de dados e não deverá conter espaços e nenhum caracter especial.
                            <b> Esse valor não poderá ser alterado novamente</b>
                        </small>
                        <small class="text-danger">
                            {erros.slug ? erros.slug : ''}
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
                            Descrição
                        </label>
                        <Input
                            className="form-control"
                            placeholder="Descrição..."
                            type="textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <small class="text-danger">
                            {erros.description || ''}
                        </small>
                    </FormGroup>
                </Col>

                <Col lg={6} md={6}>
                    <FormGroup>
                        <label
                            className="form-control-label"
                            htmlFor="example-number-input"
                        >
                        </label>
                        <div className="custom-control custom-checkbox">
                            <input
                                checked={new Boolean(is_invisible).valueOf()}
                                onChange={() => setIs_invisible(!is_invisible)}
                                className="custom-control-input"
                                id="check1"
                                type="checkbox"
                            />
                            <label className="custom-control-label" htmlFor="check1">
                                Ficar invisível
                            </label>
                            <Button
                                className='p-0 ml-2 mb-1'
                                color="link"
                                id="tooltip8762793499823049823222"
                                type="button">
                                ?
                            </Button>
                            <UncontrolledPopover placement="top" target="tooltip8762793499823049823222">
                                <PopoverBody>
                                    Selecione caso queira que esse perfil não fique disponível para ser inserido a um colaborador.
                                </PopoverBody>
                            </UncontrolledPopover>
                        </div>
                        <small className="text-danger">
                            {erros.is_invisible || ""}
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
