import React, { useState, useEffect } from 'react';
import api from "../../../services/api";

import Select2 from "react-select2-wrapper";
import Filters from '../../../components/Headers/Filters'
import {
    Row,
    Col,
    Input,
    FormGroup,
    InputGroup,
} from "reactstrap";

export default ({ title, notify, load, ...props }) => {

    const [nome, setNome] = useState(null)
    const [status, setStatus] = useState(null)
    const [empresas, setEmpresas] = useState(null)
    //Flag para definir tempo de execução
    const [runLoad, setRunLoad] = useState(props.search ? props.search : true)
    const [empresasList, setEmpresasList] = useState([])
    const [monitorClearFilters, setMonitorClearFilters] = useState(undefined)

    useEffect(() => {
        if (monitorClearFilters) search()
    }, [monitorClearFilters])


    useEffect(() => {
        if (runLoad) {
            search()
            setRunLoad(false)
        }
    }, [runLoad])

    useEffect(() => {
        if (empresasList.length === 0) loadEmpresas()
    }, [])

    async function loadEmpresas() {
        try {
            const response = await api.get('common/empresas?paginate=false')
            if (response.data) {
                setEmpresasList(response.data)
            }
        } catch (error) {
            console.log(error)
            throwError('Não foi possível carregar empresas')
        }
    }

    function throwError(text) {
        if (notify) notify('danger', text)
    }

    function search() {
        load({
            nome,
            status,
            empresas
        })
    }

    function handleMultipleSelect(target, state) {
        const array = Array.from(target.selectedOptions)
        state(array.map((item) => item.value))
    }


    function clearFilters() {
        setNome('')
        setStatus(null)
        setEmpresas(null)
    }

    return (
        <>
            <Filters
                onSearch={search}
                title={<h1>Usuários</h1>}
                onFiltersClead={setMonitorClearFilters}
                clearFilters={clearFilters}
            >
                <Row className="py-4">
                    <Col xs="12" lg="4" sm="12" md="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                            >
                                Nome
                                    </label>
                            <Input
                                className="form-control-alternative"
                                placeholder="Nome do usuário..."
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </FormGroup>
                    </Col>
                    <Col xs="12" lg="4" sm="6" md="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="example-number-input"
                            >
                                Empresa
                            </label>
                            <InputGroup className="input-group-alternative">
                                <Select2
                                    multiple
                                    onSelect={(e) => handleMultipleSelect(e.target, setEmpresas)}
                                    onUnselect={(e) => handleMultipleSelect(e.target, setEmpresas)}
                                    options={{
                                        placeholder: "Selecione uma empresa..."
                                    }}
                                    value={empresas}
                                    data={empresasList.map((item) => ({ id: item.id, text: item.nome }))}
                                />
                            </InputGroup>
                        </FormGroup>
                    </Col>
                    <Col xs="12" lg="4" sm="6" md="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="example-number-input"
                            >
                                Situação
                            </label>
                            <InputGroup className="input-group-alternative">
                                <Select2
                                    multiple
                                    onSelect={(e) => handleMultipleSelect(e.target, setStatus)}
                                    onUnselect={(e) => handleMultipleSelect(e.target, setStatus)}
                                    options={{
                                        placeholder: "Selecione uma situação..."
                                    }}
                                    value={status}
                                    data={
                                        [{
                                            id: true,
                                            text: 'Ativo'
                                        }, {
                                            id: false,
                                            text: 'Inativo'
                                        }]
                                    }
                                />
                            </InputGroup>
                        </FormGroup>
                    </Col>
                </Row>
            </Filters>
        </>
    );
}
