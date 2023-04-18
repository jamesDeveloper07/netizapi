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
    load(filters: object, clearPagination: boolean, clearSort: boolean): Promise<void>,
    search?: boolean
}

const FilterContratosByEventos: React.FC<Props> = ({ title, notify, load, ...props }) => {

    const { empresaSelecionada } = useContext(EmpresaContext)

    const [dataInicialEventoLogs, setDataInicialEventoLogs] = usePersistedState('dataInicialEventoLogs', getDataInicioMes())
    const [dataFinalEventoLogs, setDataFinalEventoLogs] = usePersistedState('dataFinalEventoLogs', getDataHoje())

    // const [dataInicialExecucaoLogs, setDataInicialExecucaoLogs] = usePersistedState('dataInicialExecucaoLogs', getDataHoje())
    // const [dataFinalExecucaoLogs, setDataFinalExecucaoLogs] = usePersistedState('dataFinalExecucaoLogs', getDataHoje())

    const [cliente, setCliente] = usePersistedState('clienteLogs', null)
    const [pesquisarTelefoneCliente, setPesquisarTelefoneCliente] = usePersistedState('pesquisarTelefoneClienteLogs', false)

    const [contrato, setContrato] = usePersistedState('contratoLogs', null)

    const [stage, setStage] = usePersistedState('stageLogs', [])
    const [stageList, setStageList] = useState([])

    const [status, setStatus] = usePersistedState('statusLogs', [])
    const [statusList, setStatusList] = useState([])

    const [temSVA, setTemSVA] = usePersistedState('temSVALogs', -1)
    const [temDeezer, setTemDeezer] = usePersistedState('temDeezerLogs', -1)
    const [temWatch, setTemWatch] = usePersistedState('temWatchLogs', -1)
    const [temHBO, setTemHBO] = usePersistedState('temHBOLogs', -1)

    const [temSvaList] = useState([{ id: -1, value: '- Todos -' }, { id: 0, value: 'Não' }, { id: 1, value: 'Sim' }])

    //Flag para definir tempo de execução
    const [runLoad, setRunLoad] = useState(true)
    const [monitorClearFilters, setMonitorClearFilters] = useState(undefined)
    //flag pra chamar o fillStatus
    const [runFillStatus, setRunFillStatus] = useState(true)
    const [runFillStage, setRunFillStage] = useState(true)

    useEffect(() => {
        if (runLoad) {
            search(false, false)
            setRunLoad(false)
        }
    }, [runLoad])

    useEffect(() => {
        if (monitorClearFilters) {
            search(true, true)
        }
    }, [monitorClearFilters])

    useEffect(() => {
        (async () => {
            if (statusList.length === 0) await loadStatusList()
            if (stageList.length === 0) await loadStageList()
        })()
    }, [])

    useEffect(() => {
        if (temSVA == 0) {
            setTemDeezer(null)
            setTemWatch(null)
            setTemHBO(null)
        }
    }, [temSVA])

    async function loadStatusList() {
        try {
            setStageList([])

            const response = await api.get(`voalle/getstatuslist`)

            if (response.data) {
                const data = await response.data
                // data.unshift({ id: -1, nome: '- Todos -' })
                setStatusList(data)
            }

            if (status && status.length > 0 && runFillStatus) {
                setStatus(status)
            } else {
                setStatus([])
            }


            setRunFillStatus(false)
        } catch (error) {
            console.log(error)
        }
    }

    async function loadStageList() {
        try {
            const response = await api.get(`voalle/getstageslist`)

            if (response.data) {
                const data = await response.data
                data.unshift({ id: -1, nome: '- Todos -' })
                setStageList(data)
            }

            if (stage && stage > 0 && runFillStage) {
                setStage(stage)
            } else {
                setStage(null)
            }


            setRunFillStage(false)
        } catch (error) {
            console.log(error)
        }
    }


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

    async function handlePesquisar() {
        await search(true, false)
    }

    function search(clearPagination: boolean, clearSort: boolean) {
        load({

            data_inicio_evento: dataInicialEventoLogs,
            data_fim_evento: dataFinalEventoLogs,

            // data_inicio_execucao: dataInicialExecucaoLogs,
            // data_fim_execucao: dataFinalExecucaoLogs,

            cliente,
            pesquisarTelefoneCliente,
            contract_id: contrato,
            status,
            stage,
            temSVA,
            temDeezer,
            temWatch,
            temHBO,
        }, clearPagination, clearSort)
    }

    function handleClearFilter() {
        setStatus(null)
        setStage(null)
        setDataInicialEventoLogs(getDataInicioMes())
        setDataFinalEventoLogs(getDataHoje())

        // setDataInicialExecucaoLogs(getDataHoje())
        // setDataFinalExecucaoLogs(getDataHoje())

        setContrato('')
        setCliente('')
        setPesquisarTelefoneCliente(false)
        setTemSVA(null)
        setTemDeezer(null)
        setTemWatch(null)
        setTemHBO(null)
    }

    function handleMultipleSelect(target: any, state: any) {
        const array = Array.from(target.selectedOptions)
        state(array.map((item: any) => item.value))
    }

    return (
        <>
            <Filters
                onSearch={handlePesquisar}
                title={<h1>Contratos com Último Evento</h1>}
                isLoading={undefined}
                isOpen={undefined}
                clearFilters={handleClearFilter}
                //@ts-ignore
                onFiltersClead={setMonitorClearFilters}
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
                </Row>

                <Row style={{ paddingTop: 15 }}>
                    <Col xs="3" lg="3" sm="6" md="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                            >
                                Contrato
                            </label>
                            <Input
                                placeholder='Id do Contrato...'
                                className="form-control"
                                value={contrato}
                                onChange={e => setContrato(e.target.value)}
                            />
                        </FormGroup>
                    </Col>

                    <Col xs="3" lg="3" sm="6" md="6">
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
                                placeholder={pesquisarTelefoneCliente ? 'Telefone do cliente...' : 'Nome, E-mail ou CPF do cliente...'}
                                className="form-control"
                                maskPlaceholder={null}
                                mask={pesquisarTelefoneCliente ? "99 99999-9999" : ""}
                                value={cliente}
                                onChange={e => setCliente(e.target.value)}
                            />
                        </FormGroup>
                    </Col>

                    <Col xs="3" lg="3" sm="6" md="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                            >
                                Estágio
                            </label>
                            <InputGroup className="input-group-alternative">
                                <Select2
                                    className="input-group-alternative"
                                    defaultValue="-1"
                                    options={{
                                        placeholder: "Selecione..."
                                    }}
                                    //@ts-ignore
                                    onSelect={({ target }) => setStage(target.value)}
                                    value={stage}
                                    //@ts-ignore
                                    data={stageList.map((item) => ({ id: item.id, text: item.nome }))}
                                />
                            </InputGroup>
                        </FormGroup>
                    </Col>
                    <Col xs="3" lg="3" sm="6" md="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="example-number-input"
                            >
                                Status
                            </label>
                            <InputGroup className="input-group-alternative">
                                <Select2
                                    multiple
                                    className="input-group-alternative"
                                    // defaultValue="-1"
                                    //@ts-ignore
                                    onSelect={({ target }) => handleMultipleSelect(target, setStatus)}
                                    //@ts-ignore
                                    onUnselect={({ target }) => handleMultipleSelect(target, setStatus)}
                                    options={{
                                        placeholder: "Selecione..."
                                    }}
                                    value={status}
                                    //@ts-ignore
                                    data={statusList.map((item) => ({ id: item.id, text: item.nome }))}
                                />
                            </InputGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs="3" lg="3" sm="6" md="6">
                        <FormGroup>
                            <label
                                className="form-control-label"
                            >
                                Tem SVA's?
                            </label>
                            <InputGroup className="input-group-alternative">
                                <Select2
                                    className="input-group-alternative"
                                    defaultValue="-1"
                                    options={{
                                        placeholder: "Selecione..."
                                    }}
                                    //@ts-ignore
                                    onSelect={({ target }) => setTemSVA(target.value)}
                                    value={temSVA}
                                    //@ts-ignore
                                    data={temSvaList.map((item) => ({ id: item.id, text: item.value }))}
                                />
                            </InputGroup>
                        </FormGroup>
                    </Col>

                    {temSVA && temSVA != 0 &&
                        <Col xs="3" lg="3" sm="6" md="6">
                            <FormGroup>
                                <label
                                    className="form-control-label"
                                >
                                    Tem Deezer?
                                </label>
                                <InputGroup className="input-group-alternative">
                                    <Select2
                                        className="input-group-alternative"
                                        defaultValue="-1"
                                        options={{
                                            placeholder: "Selecione..."
                                        }}
                                        //@ts-ignore
                                        onSelect={({ target }) => setTemDeezer(target.value)}
                                        value={temDeezer}
                                        //@ts-ignore
                                        data={temSvaList.map((item) => ({ id: item.id, text: item.value }))}
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                    }
                    {temSVA && temSVA != 0 &&
                        <Col xs="3" lg="3" sm="6" md="6">
                            <FormGroup>
                                <label
                                    className="form-control-label"
                                >
                                    Tem Watch?
                                </label>
                                <InputGroup className="input-group-alternative">
                                    <Select2
                                        className="input-group-alternative"
                                        defaultValue="-1"
                                        options={{
                                            placeholder: "Selecione..."
                                        }}
                                        //@ts-ignore
                                        onSelect={({ target }) => setTemWatch(target.value)}
                                        value={temWatch}
                                        //@ts-ignore
                                        data={temSvaList.map((item) => ({ id: item.id, text: item.value }))}
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                    }
                    {temSVA && temSVA != 0 &&
                        <Col xs="3" lg="3" sm="6" md="6">
                            <FormGroup>
                                <label
                                    className="form-control-label"
                                >
                                    Tem HBO?
                                </label>
                                <InputGroup className="input-group-alternative">
                                    <Select2
                                        className="input-group-alternative"
                                        defaultValue="-1"
                                        options={{
                                            placeholder: "Selecione..."
                                        }}
                                        //@ts-ignore
                                        onSelect={({ target }) => setTemHBO(target.value)}
                                        value={temHBO}
                                        //@ts-ignore
                                        data={temSvaList.map((item) => ({ id: item.id, text: item.value }))}
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                    }
                </Row>
            </Filters>
        </>
    );
}

export default FilterContratosByEventos;