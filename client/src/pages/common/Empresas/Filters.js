import React, { useState, useEffect } from 'react';

import {
    Collapse,
    Button,
    CardBody,
    Row,
    Col,
    Input,
    FormGroup,
} from "reactstrap";

export default ({ title, load, ...props }) => {

    const [nomeEmpresa, setNomeEmpresa] = useState(null)
    //Flag para definir tempo de execução
    const [runLoad, setRunLoad] = useState(props.search ? props.search : true)
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        if (runLoad) {
            search()
            setRunLoad(false)
        }
    }, [runLoad])

    function search() {
        load({
            nomeEmpresa,
        })
        setCollapsed(false)
    }

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {
                    title
                }
                <Button
                    color="secondary"
                    outline
                    size="sm"
                    style={{
                        height: '32px'
                    }}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <span className="btn-inner--icon">
                        <i className="fa fa-filter" />
                    </span>
                    <span className="btn-inner--text"> Filtros</span>
                </Button>
            </div>
            <Collapse isOpen={collapsed}>
                <CardBody>
                    <Row className="py-4">
                        <Col xs="12" lg="4" sm="12" md="6">
                            <FormGroup>
                                <label
                                    className="form-control-label"
                                >
                                    Empresa
                                    </label>
                                <Input
                                    className="form-control-alternative"
                                    placeholder="Nome da empresa..."
                                    type="text"
                                    value={nomeEmpresa}
                                    onChange={(e) => setNomeEmpresa(e.target.value)}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Button
                            color="secondary"
                            style={{
                                marginBottom: '8px'
                            }}
                            onClick={() => search()}
                            outline
                            size="sm"
                            href="#">
                            <span className="btn-inner--icon">
                                <i className="fa fa-search" />
                            </span>
                            <span className="btn-inner--text"> Pesquisar</span>
                        </Button>
                    </Row>
                </CardBody>
            </Collapse>
        </>
    );
}
