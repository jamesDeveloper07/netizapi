import React, { useState, useEffect, useContext } from 'react';
import EmpresaContext from '../../../../contexts/Empresa';
import api from "../../../../services/api";

//@ts-ignore
import Select2 from 'react-select2-wrapper';
import { usePersistedState } from '../../../../hooks'
import Filters from '../../../../components/Headers/Filters'
import { LogEvento } from '../../../../entities/Common';

import { hasPermission } from '../../../../utils';

import {
    Row,
    Col,
    Input,
    FormGroup,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
} from "reactstrap";

import ReactDatetimeClass from 'react-datetime';
import moment from 'moment';
import InputMask from "react-input-mask";
import ReactDatetime from "react-datetime";

interface Props {
    title: React.ReactElement,
    data: Array<LogEvento>
    notify(type: string, msg: string): void,
    load(filters: object): void
    search?: boolean
}

const FilterLogs: React.FC<Props> = ({ title, notify, load, ...props }) => {

    const { empresaSelecionada } = useContext(EmpresaContext)

    const [dataInicialEventoLogs, setDataInicialEventoLogs] = usePersistedState('dataInicialEventoLogs', null)
    const [dataFinalEventoLogs, setDataFinalEventoLogs] = usePersistedState('dataFinalEventoLogs', null)

    const [dataInicialExecucaoLogs, setDataInicialExecucaoLogs] = usePersistedState('dataInicialExecucaoLogs', getDataHoje())
    const [dataFinalExecucaoLogs, setDataFinalExecucaoLogs] = usePersistedState('dataFinalExecucaoLogs', getDataHoje())

    const [cliente, setCliente] = usePersistedState('clienteLogs', null)
    const [pesquisarTelefoneCliente, setPesquisarTelefoneCliente] = usePersistedState('pesquisarTelefoneClienteLogs', false)

    const [contrato, setContrato] = usePersistedState('contratoLogs', null)

    const [status, setStatus] = usePersistedState('statusLogs', null)

    //Flag para definir tempo de execução
    const [runLoad, setRunLoad] = useState(true)
    //flag pra chamar o fillAcoes
    const [runFillAcoes, setRunFillAcoes] = useState(true)

    useEffect(() => {
        if (runLoad) {
            search()
            setRunLoad(false)
        }
    }, [runLoad])




    function throwError(text: string) {
        if (notify) notify('danger', text)
    }

    function getDataInicioMes() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth());
    }

    function getDataFinalMes() {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    function getDataHoje() {
        return new Date();
    }

    function search() {
        load({

            data_inicio_evento: dataInicialEventoLogs,
            data_fim_evento: dataFinalEventoLogs,

            data_inicio_execucao: dataInicialExecucaoLogs,
            data_fim_execucao: dataFinalExecucaoLogs,

            cliente,
            pesquisarTelefoneCliente,
            contract_id: contrato,
            status,
        })
    }

    function handleClearFilter() {
        setStatus(null)
        setDataInicialEventoLogs(null)
        setDataFinalEventoLogs(null)

        setDataInicialExecucaoLogs(getDataHoje())
        setDataFinalExecucaoLogs(getDataHoje())

        setContrato('')

        setCliente('')
        setPesquisarTelefoneCliente(false)
    }

    function handleMultipleSelect(target: any, state: any) {
        const array = Array.from(target.selectedOptions)
        state(array.map((item: any) => item.value))
    }

    return (
        <>
            <Filters
                onSearch={search}
                title={<h1>Logs de Evento</h1>}
                onFiltersClead={handleClearFilter}
                isLoading={undefined}
                clearFilters={undefined}
                isOpen={undefined}
            >
                <Row>
                    <Col xs="auto" lg={6} sm={12} md={12}>
                        <fieldset className="border p-2">
                            <legend className="w-auto" style={{ margin: 0 }}>
                                <label
                                    className="form-control-label"
                                >
                                    Período Evento
                                </label>
                            </legend>
                            <Row>
                                <Col xs={6}>
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="example-number-input"
                                        >
                                            Início
                                        </label>
                                        <InputGroup className="input-group-alternative">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="ni ni-calendar-grid-58" />
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <ReactDatetimeClass
                                                inputProps={{
                                                    placeholder: "Início",
                                                    style: {
                                                        width: '100px'
                                                    }
                                                }}
                                                //COMENTADO PORQUE É TESTE DE DATA
                                                value={moment(dataInicialEventoLogs)}
                                                dateFormat="DD/MM/YYYY"
                                                timeFormat={false}
                                                renderDay={(props, currentDate, selectedDate) => {
                                                    let classes = props.className;
                                                    if (
                                                        dataInicialEventoLogs &&
                                                        dataFinalEventoLogs &&
                                                        dataInicialEventoLogs._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " start-date";
                                                    } else if (
                                                        dataInicialEventoLogs &&
                                                        dataFinalEventoLogs &&
                                                        new Date(dataInicialEventoLogs._d + "") <
                                                        new Date(currentDate._d + "") &&
                                                        new Date(dataFinalEventoLogs._d + "") >
                                                        new Date(currentDate._d + "")
                                                    ) {
                                                        classes += " middle-date";
                                                    } else if (
                                                        dataFinalEventoLogs &&
                                                        dataFinalEventoLogs._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " end-date";
                                                    }
                                                    return (
                                                        <td {...props} className={classes}>
                                                            {currentDate.date()}
                                                        </td>
                                                    );
                                                }}
                                                onChange={e => setDataInicialEventoLogs(e)}
                                            />
                                        </InputGroup>
                                    </FormGroup>
                                </Col>
                                <Col xs={6}>
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="example-number-input"
                                        >
                                            Fim
                                        </label>
                                        <InputGroup className="input-group-alternative">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="ni ni-calendar-grid-58" />
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <ReactDatetimeClass
                                                inputProps={{
                                                    placeholder: "Fim",
                                                    style: {
                                                        width: '100px'
                                                    }
                                                }}
                                                value={moment(dataFinalEventoLogs)}
                                                dateFormat="DD/MM/YYYY"
                                                timeFormat={false}
                                                renderDay={(props, currentDate, selectedDate) => {
                                                    let classes = props.className;
                                                    if (
                                                        dataInicialEventoLogs &&
                                                        dataFinalEventoLogs &&
                                                        dataInicialEventoLogs._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " start-date";
                                                    } else if (
                                                        dataInicialEventoLogs &&
                                                        dataFinalEventoLogs &&
                                                        new Date(dataInicialEventoLogs._d + "") <
                                                        new Date(currentDate._d + "") &&
                                                        new Date(dataFinalEventoLogs._d + "") >
                                                        new Date(currentDate._d + "")
                                                    ) {
                                                        classes += " middle-date";
                                                    } else if (
                                                        dataFinalEventoLogs &&
                                                        dataFinalEventoLogs._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " end-date";
                                                    }
                                                    return (
                                                        <td {...props} className={classes}>
                                                            {currentDate.date()}
                                                        </td>
                                                    );
                                                }}
                                                onChange={e => setDataFinalEventoLogs(e)}
                                            />
                                        </InputGroup>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </fieldset>
                    </Col>

                    <Col xs="auto" lg={6} sm={12} md={12}>
                        <fieldset className="border p-2">
                            <legend className="w-auto" style={{ margin: 0 }}>
                                <label
                                    className="form-control-label"
                                >
                                    Período Integração
                                </label>
                            </legend>
                            <Row>
                                <Col xs={6}>
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="example-number-input"
                                        >
                                            Início
                                        </label>
                                        <InputGroup className="input-group-alternative">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="ni ni-calendar-grid-58" />
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <ReactDatetimeClass
                                                inputProps={{
                                                    placeholder: "Início",
                                                    style: {
                                                        width: '100px'
                                                    }
                                                }}
                                                //COMENTADO PORQUE É TESTE DE DATA
                                                value={moment(dataInicialExecucaoLogs)}
                                                dateFormat="DD/MM/YYYY"
                                                timeFormat={false}
                                                renderDay={(props, currentDate, selectedDate) => {
                                                    let classes = props.className;
                                                    if (
                                                        dataInicialExecucaoLogs &&
                                                        dataFinalExecucaoLogs &&
                                                        dataInicialExecucaoLogs._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " start-date";
                                                    } else if (
                                                        dataInicialExecucaoLogs &&
                                                        dataFinalExecucaoLogs &&
                                                        new Date(dataInicialExecucaoLogs._d + "") <
                                                        new Date(currentDate._d + "") &&
                                                        new Date(dataFinalExecucaoLogs._d + "") >
                                                        new Date(currentDate._d + "")
                                                    ) {
                                                        classes += " middle-date";
                                                    } else if (
                                                        dataInicialExecucaoLogs &&
                                                        dataInicialExecucaoLogs._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " end-date";
                                                    }
                                                    return (
                                                        <td {...props} className={classes}>
                                                            {currentDate.date()}
                                                        </td>
                                                    );
                                                }}
                                                onChange={e => setDataInicialExecucaoLogs(e)}
                                            />
                                        </InputGroup>
                                    </FormGroup>
                                </Col>
                                <Col xs={6}>
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="example-number-input"
                                        >
                                            Fim
                                        </label>
                                        <InputGroup className="input-group-alternative">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="ni ni-calendar-grid-58" />
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <ReactDatetimeClass
                                                inputProps={{
                                                    placeholder: "Fim",
                                                    style: {
                                                        width: '100px'
                                                    }
                                                }}
                                                value={moment(dataFinalExecucaoLogs)}
                                                dateFormat="DD/MM/YYYY"
                                                timeFormat={false}
                                                renderDay={(props, currentDate, selectedDate) => {
                                                    let classes = props.className;
                                                    if (
                                                        dataInicialExecucaoLogs &&
                                                        dataFinalExecucaoLogs &&
                                                        dataInicialExecucaoLogs._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " start-date";
                                                    } else if (
                                                        dataInicialExecucaoLogs &&
                                                        dataFinalExecucaoLogs &&
                                                        new Date(dataInicialExecucaoLogs._d + "") <
                                                        new Date(currentDate._d + "") &&
                                                        new Date(dataFinalExecucaoLogs._d + "") >
                                                        new Date(currentDate._d + "")
                                                    ) {
                                                        classes += " middle-date";
                                                    } else if (
                                                        dataFinalExecucaoLogs &&
                                                        dataFinalExecucaoLogs._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " end-date";
                                                    }
                                                    return (
                                                        <td {...props} className={classes}>
                                                            {currentDate.date()}
                                                        </td>
                                                    );
                                                }}
                                                onChange={e => setDataFinalExecucaoLogs(e)}
                                            />
                                        </InputGroup>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </fieldset>
                    </Col>
                </Row>

                <Row style={{ paddingTop: 15 }}>
                    <Col xs="6" lg="6" sm="12" md="12">
                        <FormGroup>
                            <label
                                className="form-control-label"
                            >
                                Contrato
                            </label>
                            <Input
                                placeholder='Protocolo...'
                                className="form-control"
                                value={contrato}
                                onChange={e => setContrato(e.target.value)}
                            />
                        </FormGroup>
                    </Col>

                    <Col xs="6" lg="6" sm="12" md="12">
                        <FormGroup>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flex: 1,
                                    justifyContent: 'space-between'
                                }}
                            >
                                <label
                                    className="form-control-label"
                                >
                                    Cliente
                                </label>
                                <div className="custom-control custom-checkbox">
                                    <input
                                        className="custom-control-input"
                                        id="check-telefone"
                                        type="checkbox"
                                        checked={pesquisarTelefoneCliente}
                                        onChange={() => setPesquisarTelefoneCliente(!pesquisarTelefoneCliente)}
                                    />
                                    <label
                                        className="custom-control-label" htmlFor="check-telefone">
                                        Pesquisar por telefone
                                    </label>
                                </div>
                            </div>
                            <InputMask
                                placeholder={pesquisarTelefoneCliente ? 'Telefone do cliente...' : 'Nome ou CPF/CNPJ do cliente...'}
                                className="form-control"
                                maskPlaceholder={null}
                                mask={pesquisarTelefoneCliente ? "99 99999-9999" : ""}
                                value={cliente}
                                onChange={e => setCliente(e.target.value)}
                            />
                        </FormGroup>
                    </Col>
                </Row>                
            </Filters>
        </>
    );
}

export default FilterLogs;