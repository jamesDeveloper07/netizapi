import React, { useState, useEffect, useContext } from 'react';
import EmpresaContext from '../../../../contexts/Empresa';
import api from "../../../../services/api";

//@ts-ignore
import Select2 from 'react-select2-wrapper';
import { usePersistedState } from '../../../../hooks'
import Filters from '../../../../components/Headers/Filters'
import { LogIntegracao, Solicitacao } from '../../../../entities/Common';

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
    data: Array<LogIntegracao>
    notify(type: string, msg: string): void,
    load(filters: object): void
    search?: boolean
}

const FilterLogs: React.FC<Props> = ({ title, notify, load, ...props }) => {

    const { empresaSelecionada } = useContext(EmpresaContext)

    const [dataInicialEventoLogs, setDataInicialEventoLogs] = usePersistedState('dataInicialEventoLogs',  null)
    const [dataFinalEventoLogs, setDataFinalEventoLogs] = usePersistedState('dataFinalEventoLogs', null)

    const [dataInicialExecucaoLogs, setDataInicialExecucaoLogs] = usePersistedState('dataInicialExecucaoLogs', getDataHoje())
    const [dataFinalExecucaoLogs, setDataFinalExecucaoLogs] = usePersistedState('dataFinalExecucaoLogs', getDataHoje())

    const [cliente, setCliente] = usePersistedState('clienteLogs', null)
    const [pesquisarTelefoneCliente, setPesquisarTelefoneCliente] = usePersistedState('pesquisarTelefoneClienteLogs', false)

    const [protocoloExterno, setProtocoloExterno] = usePersistedState('protocoloExternoLogs', null)

    const [status, setStatus] = usePersistedState('statusLogs', null)

    const [acao, setAcao] = usePersistedState('acaoLogs', null)
    const [servico, setServico] = usePersistedState('servicoLogs', null)

    const [colaboradores, setColaboradores] = usePersistedState('colaboradoresLogs', [])

    //Listas para carregar os filtros
    const [users, setUsers] = useState([])
    const [acoesList, setAcoesList] = useState([])
    const [servicos, setServicos] = useState([])

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


    useEffect(() => {
        (async () => {
            if (servicos.length === 0) await loadServicos()
            if (acoesList.length === 0) await loadAcoes()
            // if (hasPermission('ver-todas-solicitacos') && users.length === 0) {
            if (users.length === 0) {
                await loadColaboradores()
            }
        })()
    }, [])

   
    async function loadServicos() {
        try {
            const response = await api.get(`/common/servico`)

            if (response.data) {
                response.data.unshift({ id: -1, nome: '- Todos -' })
                setServicos(response.data)
            }

        } catch (error) {
            console.log(error)
        }
    }

    async function loadAcoes() {
        try {
            const response = await api.get(`/common/acao`)

            if (response.data) {
                const data = await response.data
                data.unshift({ id: -1, nome: '- Todas -' })
                setAcoesList(data)
            }

            if (acao && acao > 0 && runFillAcoes) {
                setAcao(acao)
            } else {
                setAcao(null)
            }


            setRunFillAcoes(false)
        } catch (error) {
            console.log(error)
        }
    }

    async function loadColaboradores() {
        try {
            setColaboradores([])

            const response = await api.get(`common/empresas/${empresaSelecionada?.id}/colaboradores`, {
                params: {
                    //roles: ['comercial', 'relacionamento'],
                    // equipes: (equipes && equipes.length > 0) ? equipes : [-1],
                    equipes: [-1],
                }
            })
            let listaColaboradores = response.data
            setUsers(listaColaboradores)

            if (colaboradores && colaboradores.length > 0) {
                //valida se os colaboradores selecionados ainda fazem parte das novas equipes selecionadas
                const colabsValidos = [];
                for (const colab of listaColaboradores) {
                    for (const idColab of colaboradores) {
                        if (idColab == colab.id) {
                            colabsValidos.push(idColab)
                        }
                    }
                }
                setColaboradores(colabsValidos)
            } else {
                setColaboradores([])
            }

        } catch (error) {
            console.log(error)
        }
    }

    function ColaboradorSelect({ }) {
        if (hasPermission('ver-todas-solicitacoes')) {
            return (
                <>

                    <Col xs="4" lg="4" sm="12" md="12">
                        <FormGroup>

                            <label
                                className="form-control-label"
                            >
                                Colaborador
                            </label>

                            <InputGroup className="input-group-alternative">
                                <Select2
                                    multiple
                                    //@ts-ignore
                                    onSelect={({ target }) => handleMultipleSelect(target, setColaboradores)}
                                    //@ts-ignore
                                    onUnselect={({ target }) => handleMultipleSelect(target, setColaboradores)}
                                    options={{
                                        placeholder: "Selecione os colaboradores..."
                                    }}
                                    value={colaboradores}
                                    data={
                                        //@ts-ignore
                                        users.map(user => ({ id: user.id, text: user.name }))
                                    }
                                />
                            </InputGroup>
                        </FormGroup>
                    </Col>
                </>
            )
        }
        return null
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

    function search() {
        load({

            data_inicio_criacao: dataInicialEventoLogs,
            data_fim_criacao: dataFinalEventoLogs,

            data_inicio_execucao: dataInicialExecucaoLogs,
            data_fim_execucao: dataFinalExecucaoLogs,

            cliente,
            pesquisarTelefoneCliente,
            protocolo_externo_id: protocoloExterno,
            servico_id: servico,
            acao_id: acao,
            // acao_servico_id: acaoServico,
            status,
            colaboradores
        })
    }

    function handleClearFilter() {
        setStatus(null)
        setDataInicialEventoLogs(null)
        setDataFinalEventoLogs(null)

        setDataInicialExecucaoLogs(getDataHoje())
        setDataFinalExecucaoLogs(getDataHoje())

        setProtocoloExterno('')

        setCliente('')
        setPesquisarTelefoneCliente(false)
        
        setAcao(null);
        setServico(null);

        setColaboradores([]);

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
                title={<h1>Logs de Integração</h1>}
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
                                    Período Execução
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
                                Protocolo Externo
                            </label>
                            <Input
                                placeholder='Protocolo...'
                                className="form-control"
                                value={protocoloExterno}
                                onChange={e => setProtocoloExterno(e.target.value)}
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

                <Row>
                    <Col xs="6" lg="6" sm="12" md="12">
                        <FormGroup>
                            <label
                                className="form-control-label"
                            >
                                Serviço
                            </label>
                            <InputGroup className="input-group-alternative">
                                <Select2
                                    className="input-group-alternative"
                                    defaultValue="-1"
                                    options={{
                                        placeholder: "Selecione..."
                                    }}
                                    //@ts-ignore
                                    onSelect={({ target }) => setServico(target.value)}
                                    value={servico}
                                    //@ts-ignore
                                    data={servicos.map((item) => ({ id: item.id, text: item.nome }))}
                                />
                            </InputGroup>
                        </FormGroup>
                    </Col>
                    <Col xs="6" lg="6" sm="12" md="12">
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="example-number-input"
                            >
                                Ação
                            </label>
                            <InputGroup className="input-group-alternative">
                                <Select2
                                    className="input-group-alternative"
                                    defaultValue="-1"
                                    options={{
                                        placeholder: "Selecione..."
                                    }}
                                    //@ts-ignore
                                    onSelect={({ target }) => setAcao(target.value)}
                                    value={acao}
                                    //@ts-ignore
                                    data={acoesList.map((item) => ({ id: item.id, text: item.nome }))}
                                />
                            </InputGroup>
                        </FormGroup>
                    </Col>
                    {/* <ColaboradorSelect /> */}
                </Row>
            </Filters>
        </>
    );
}

export default FilterLogs;