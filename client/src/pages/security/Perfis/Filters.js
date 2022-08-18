import React, { useState, useEffect } from 'react';
import api from "../../../services/api";

import Select2 from "react-select2-wrapper";
import Filters from '../../../components/Headers/Filters'
import {
    Collapse,
    Button,
    CardBody,
    Row,
    Col,
    Input,
    FormGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
} from "reactstrap";

export default ({ title, notify, load, ...props }) => {

    const [nome, setNome] = useState(null)
    //Flag para definir tempo de execução
    const [runLoad, setRunLoad] = useState(props.search ? props.search : true)
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

    function throwError(text) {
        if (notify) notify('danger', text)
    }

    function clearFilters() {
        setNome('')
    }

    function search() {
        load({
            nome,
        })
    }

    return (
        <>
            <Filters
                onSearch={search}
                title={<h1>Perfis</h1>}
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
                                placeholder="Nome do perfil..."
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </Filters>
        </>
    );
}
