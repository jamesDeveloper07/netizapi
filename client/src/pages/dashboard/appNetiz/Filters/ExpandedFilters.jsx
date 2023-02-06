import React, { useState, useEffect, useContext } from 'react';
import EmpresaContext from '../../../../contexts/Empresa'
import moment from 'moment'
import api from "../../../../services/api";
import { usePersistedState } from '../../../../hooks'
import ReactDatetime from "react-datetime";
import Select2 from "react-select2-wrapper";

import {
    Form,
    FormGroup,
    Modal,
    InputGroup,
    Button,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
} from "reactstrap";

function ExpantedFilters({
    notify,
    colaborador,
    equipe,
    onColaboradorChanged,
    onEquipeChanged,
    show,
    hidde,
}) {

    const { empresaSelecionada } = useContext(EmpresaContext)
    const [colaboradores, setColaboradores] = useState([])
    const [equipes, setEquipes] = useState([])

    useEffect(() => {
        if (equipes.length === 0) {
            // loadEquipes()
        }

    }, [])

    useEffect(() => {
        colaboradores.unshift({ id: -1, name: '- todos -' })
    }, [colaboradores])

    useEffect(() => {
        onColaboradorChanged(null)
        loadColaboradores(equipe)
    }, [equipe])

    async function loadColaboradores(equipeId) {
        setColaboradores([])
        try {
            const hasEquipe = equipeId && equipeId > 0
            let url = ''
            hasEquipe
                ? url = `common/empresas/${empresaSelecionada.id}/equipes/${equipeId}/membros`
                : url = `common/empresas/${empresaSelecionada.id}/colaboradores`
            const response = await api.get(url)

            if (hasEquipe) setColaboradores(await response.data.map(it => it.user))
            else setColaboradores(await response.data)
        } catch (error) {
            console.error(error)
            notify('danger', 'Não foi possível carregar colaboradores')
        }
    }

    function limparFiltros() {
        onEquipeChanged(null)
        onColaboradorChanged(null)
        hidde()
    }

    async function loadEquipes() {
        try {
            const response = await api.get(`/common/empresas/${empresaSelecionada.id}/equipes`)
            const data = await response.data
            data.unshift({ nome: '- todos -', id: -1 })
            setEquipes(data)
        } catch (error) {
            console.error(error)
            notify('danger', 'Não foi possível carregar equipes')
        }
    }

    return (
        <>
            <Modal
                className="modal-dialog-centered"
                isOpen={show}
                toggle={hidde}
            >
                <div className="modal-header">
                    <h6 className="modal-title" id="modal-title-default">
                        Filtros
                    </h6>
                    <button
                        aria-label="Close"
                        className="close"
                        data-dismiss="modal"
                        type="button"
                        onClick={hidde}
                    >
                        <span aria-hidden={true}>×</span>
                    </button>
                </div>
                <div className="modal-body">
                    <Row className="py-4">
                        <Col xs="12" lg="12" sm="12" md="12">
                            <FormGroup>
                                <label
                                    className="form-control-label"
                                    htmlFor="example-number-input"
                                >
                                    Equipe
                                </label>
                                <InputGroup className="input-group-alternative">
                                    <Select2
                                        size='sm'
                                        defaultValue="-1"
                                        onSelect={(e) => onEquipeChanged(e.target.value)}
                                        options={{
                                            placeholder: "Selecione uma equipe..."
                                        }}
                                        value={equipe}
                                        data={equipes.map((item) => ({ id: item.id, text: item.nome }))}
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs="12" lg="12" sm="12" md="12">
                            <FormGroup>
                                <label
                                    className="form-control-label"
                                    htmlFor="example-number-input"
                                >
                                    Colaborador
                                </label>
                                <InputGroup className="input-group-alternative">
                                    <Select2
                                        defaultValue="-1"
                                        onSelect={(e) => onColaboradorChanged(e.target.value)}
                                        options={{
                                            placeholder: "Selecione um colaborador..."
                                        }}
                                        value={colaborador}
                                        data={
                                            colaboradores.map((item) => ({ id: item.id, text: item.name }))
                                        }
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Col>

                    </Row>
                </div>
                <div className="modal-footer">
                    <Button
                        //className="ml-auto"
                        color="link"
                        data-dismiss="modal"
                        type="button"
                        onClick={hidde}
                    >
                        Fechar
                    </Button>

                    <Button
                        //className="ml-auto"
                        color="primary"
                        data-dismiss="modal"
                        type="button"
                        onClick={limparFiltros}
                    >
                        Limpar
                    </Button>
                </div>

            </Modal>
        </>
    )
}

export default ExpantedFilters;