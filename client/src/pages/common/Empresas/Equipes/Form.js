import React, { useState, useEffect } from 'react';
import api from "../../../../services/api";

import Select2 from "react-select2-wrapper";
import {
    Button,
    FormGroup,
    Form,
    Input,
    Modal,
    Row,
    Col
} from "reactstrap";

export default ({ notify, equipe = {}, empresa, close, onSuccess, show, ...props }) => {

    const [nome, setNome] = useState(null)
    const [captadora, setCaptadora] = useState('I')
    const [erros, setErros] = useState({})


    useEffect(() => {
        setNome(equipe.nome)
        setCaptadora(equipe.captadora || 'I')
    }, [equipe])


    function handleSave() {
        if (equipe.id) {
            update()
        } else {
            insert()
        }
    }

    async function insert() {
        try {
            await api.post(`/common/empresas/${empresa.id}/equipes`, {
                nome,
                captadora,
            })
            updateErros(null)
            if (onSuccess) close(); onSuccess();
        } catch (error) {
            console.error(error)
            if (notify) notify('danger', 'Não foi possível adicionar equipe')
            if (error.response) updateErros(error.response.data)
        }
    }

    async function update() {
        try {
            await api.put(`/common/empresas/${empresa.id}/equipes/${equipe.id}`, {
                nome,
                captadora
            })
            updateErros(null)
            if (onSuccess) close(); onSuccess();
        } catch (error) {
            console.error(error)
            if (notify) notify('danger', 'Não foi possível salvar equipe')
            if (error.response) updateErros(error.response.data)
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
            <Modal
                className="modal-dialog-centered"
                isOpen={show}
                toggle={close}
            >
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                        {equipe.id ? 'Alterar Equipe' : 'Nova Equipe'}
                    </h5>
                    <button
                        aria-label="Close"
                        className="close"
                        data-dismiss="modal"
                        type="button"
                        onClick={close}
                    >
                        <span aria-hidden={true}>×</span>
                    </button>
                </div>
                <div className="modal-body">
                    <Row>
                        <Col>
                            <FormGroup>
                                <label
                                    className="form-control-label"
                                >
                                    Nome*
                                    </label>
                                <Input
                                    className="form-control"
                                    placeholder="Nome..."
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                                <small class="text-danger">
                                    {erros.nome ? erros.nome : ''}
                                </small>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup>
                                <div className="custom-control custom-checkbox">
                                    <input
                                        className="custom-control-input"
                                        onChange={() => setCaptadora(captadora === 'A' ? 'I' : 'A')}
                                        checked={captadora === 'A'}
                                        id="customCheckDisabled"
                                        type="checkbox"
                                    />
                                    <label
                                        className="custom-control-label"
                                        htmlFor="customCheckDisabled"
                                    >
                                        Captadora de oportundiades
                                        </label>
                                </div>
                                <small class="text-danger">
                                    {erros.captadora || ''}
                                </small>
                            </FormGroup>
                        </Col>
                    </Row>
                </div>
                <div className="modal-footer">
                    <Row>
                        <Col>
                            <div className="float-right ">
                                <Button
                                    className="ml-auto"
                                    color="link"
                                    data-dismiss="modal"
                                    type="button"
                                    onClick={close}
                                >
                                    Fechar
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
                </div>

            </Modal>
        </>
    );
}
