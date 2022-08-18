import React, { useState, useEffect, useRef, useContext } from 'react';
import api from "../../../../../services/api";
import AuthContext from '../../../../../contexts/Auth'

import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import Select2 from "react-select2-wrapper";
import NotificationAlert from "react-notification-alert";
import {
    Button,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Modal,
    Row,
    Col
} from "reactstrap";

export default ({ equipe, empresa, close, onSuccess, show, ...props }) => {

    const { auth } = useContext(AuthContext)
    const [membros, setMembros] = useState([])
    const [erros, setErros] = useState({})
    const [loading, setLoading] = useState(false)
    const [colaborador, setColaborador] = useState(undefined)
    const notificationAlert = useRef()
    const [columns, setColumns] = useState([
        {
            dataField: 'acoes',
            formatter: (cell, row) => acoesFormatter(cell, row)
        },
        {
            dataField: 'user.name',
            text: 'Nome',
            sort: true
        },
        {
            dataField: 'user.email',
            text: 'Email',
            sort: true,
        },
    ])

    useEffect(() => {
        setMembros([])
        loadMembros(equipe.id)
    }, [equipe])

    async function loadMembros(equipe_id) {
        if (!equipe_id) return
        try {
            const response = await api.get(`/common/empresas/${empresa.id}/equipes/${equipe_id}/membros`)
            setMembros(response.data)
        } catch (error) {
            console.log(error)
            notify('danger', 'Não foi possível carregar colaboradores da equipe')
        }
    }

    function handleRemoverColaborador(membro) {
        if (window.confirm(`Deseja realmente remover ${membro.user.name}?`)) {
            removeColaborador(membro)
        }
    }

    async function removeColaborador(membro) {
        setLoading(true)
        try {
            await api.delete(`/common/empresas/${empresa.id}/equipes/${membro.equipe_id}/membros/${membro.id}`)
            await loadMembros(membro.equipe_id)
            notify('success', 'Colaborador removido')
            onSuccess()
        } catch (error) {
            console.log(error)
            notify('danger', 'Não foi possível remover colaborador')
        }
        setLoading(false)
    }

    function handleAddColaborador() {
        if (!colaborador) {
            return
        }
        addColaborador()
    }
    async function addColaborador() {
        setLoading(true)
        try {
            await api.post(`/common/empresas/${empresa.id}/equipes/${equipe.id}/membros`, {
                user_id: colaborador
            })
            setColaborador(undefined)
            await loadMembros(equipe.id)
            onSuccess()
            notify('success', 'Colaborador adicionado')
        } catch (error) {
            console.log(error)
            notify('danger', 'Não foi possível adicionar colaborador')
        }
        setLoading(false)
    }

    function acoesFormatter(cell, row) {
        return (<>
            <div class="btn-group" role="group" aria-label="Basic example">
                <Button
                    className="btn-sm"
                    color="danger"
                    onClick={() => handleRemoverColaborador(row)}
                >
                    <i class="fas fa-trash"></i>
                </Button>
            </div>
        </>)
    }

    function clienteOptions() {
        const option = {
            placeholder: "Colaboradores...",
        }
        option['ajax'] = {
            url: `${process.env.REACT_APP_API_URL}/common/empresas/${empresa.id}/colaboradores`,
            dataType: 'json',
            headers: {
                Authorization: `Bearer ${auth.token}`
            },
            processResults: function (data) {
                return {
                    results: data.
                        filter((item) => !membros.find(membro => membro.user.id == item.id))
                        .map((item) => ({ id: item.id, text: `${item.name}, ${item.email}` }))
                };
            }
        }
        return option
    }


    const notify = (type, msg) => {
        let options = {
            place: "tc",
            message: (
                <div className="alert-text" style={{ width: '100%' }}>
                    <span data-notify="message">
                        {msg}
                    </span>
                </div>
            ),
            type: type,
            closeButton: false,
            autoDismiss: 3
        };
        if (notificationAlert.current) notificationAlert.current.notificationAlert(options);
    };

    return (
        <>
            <Modal
                className="modal-dialog-centered"
                size='md'
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
                    <NotificationAlert ref={notificationAlert} />
                    <>
                        <Row>
                            <Col lg={12} md={12} style={{
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: 1,
                                display: 'flex'
                            }}>
                                <FormGroup>
                                    <label
                                        className="form-control-label"
                                        htmlFor="example-number-input"
                                    >
                                        Colaborador
                                    </label>
                                    <Select2
                                        maximumInputLength={10}
                                        className="form-control"
                                        onSelect={(e) => setColaborador(e.target.value)}
                                        options={clienteOptions()}
                                        value={colaborador}
                                    />
                                </FormGroup>
                                <div>
                                    <Button
                                        color="primary"
                                        type="button"
                                        outline
                                        onClick={handleAddColaborador}
                                        className="btn-icon btn-3"
                                    >
                                        <span className="btn-inner--icon">
                                            <i className="ni ni-fat-add"></i>
                                        </span>
                                        <span className="btn-inner--text">Adicionar</span>
                                    </Button>
                                </div>

                            </Col>
                        </Row>
                        <Row>
                            <Col className='py-4 table-responsive'>
                                <ToolkitProvider
                                    data={membros}
                                    keyField="user.name"
                                    columns={columns}
                                    search
                                >
                                    {props => (
                                        <div className="py-4">
                                            <BootstrapTable
                                                {...props.baseProps}
                                                bootstrap4={true}
                                                bordered={false}
                                            />
                                        </div>
                                    )}
                                </ToolkitProvider>
                            </Col>
                        </Row>

                    </>
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
                            </div>
                        </Col>
                    </Row>
                </div>

            </Modal>
        </>
    );
}
