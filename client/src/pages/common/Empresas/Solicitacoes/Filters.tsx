import React, { useState, useEffect, useContext } from 'react';
import EmpresaContext from '../../../../contexts/Empresa';
import api from "../../../../services/api";

//@ts-ignore
import Select2 from 'react-select2-wrapper';
import { usePersistedState } from '../../../../hooks'
import Filters from '../../../../components/Headers/Filters'
import { Solicitacao } from '../../../../entities/Common';

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
    data: Array<Solicitacao>
    notify(type: string, msg: string): void,
    load(filters: object): void
    search?: boolean
}

const FilterSolicitacoes: React.FC<Props> = ({ title, notify, load, ...props }) => {

    const { empresaSelecionada } = useContext(EmpresaContext)

    const [dataInicialCriacaoSolicitacoes, setDataInicialCriacaoSolicitacoes] = usePersistedState('dataInicialCriacaoSolicitacoes', getDataHoje())
    const [dataFinalCriacaoSolicitacoes, setDataFinalCriacaoSolicitacoes] = usePersistedState('dataFinalCriacaoSolicitacoes', getDataHoje())

    const [dataInicialExecucaoSolicitacoes, setDataInicialExecucaoSolicitacoes] = usePersistedState('dataInicialExecucaoSolicitacoes', null)
    const [dataFinalExecucaoSolicitacoes, setDataFinalExecucaoSolicitacoes] = usePersistedState('dataFinalExecucaoSolicitacoes', null)

    const [cliente, setCliente] = usePersistedState('clienteSolicitacoes', null)
    const [pesquisarTelefoneCliente, setPesquisarTelefoneCliente] = usePersistedState('pesquisarTelefoneClienteSolicitacoes', false)

    const [protocoloExterno, setProtocoloExterno] = usePersistedState('protocoloExternoSolicitacoes', null)

    const [status, setStatus] = usePersistedState('statusSolicitacoes', null)

    // const [acaoServico, setAcaoServico] = usePersistedState('acaoServicoSolicitacoes', null)
    const [acao, setAcao] = usePersistedState('acaoSolicitacoes', null)
    const [servico, setServico] = usePersistedState('servicoSolicitacoes', null)

    const [colaboradores, setColaboradores] = usePersistedState('colaboradores', [])

    //Listas para carregar os filtros
    const [users, setUsers] = useState([])
    // const [acoesServicosList, setAcoesServicosList] = useState([])
    const [acoesList, setAcoesList] = useState([])
    const [servicos, setServicos] = useState([])

    //Flag para definir tempo de execução
    const [runLoad, setRunLoad] = useState(true)
    //flag pra chamar o fillAcoesServicos
    // const [runFillAcoesServicos, setRunFillAcoesServicos] = useState(true)
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

    // useEffect(() => {
    //     loadAcoesServicos(servico)
    // }, [servico])

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

    // async function loadAcoesServicos(servico: any) {
    //     if (servico && servico == -1) {
    //         servico = null
    //     }
    //     try {
    //         const response = await api.get(`/common/get_acoes_by_servico`, {
    //             params: {
    //                 servico_id: servico
    //             }
    //         })

    //         if (response.data) {
    //             const data = await response.data
    //             setAcoesServicosList(data)
    //         }

    //         // if (produtos && produtos.length > 0 && runFillAcoesServicos) {
    //         //     setProdutos(produtos)
    //         // } else {
    //         //     setProdutos([])
    //         // }

    //         if (acaoServico && acaoServico > 0 && runFillAcoesServicos) {
    //             setAcaoServico(acaoServico)
    //         } else {
    //             setAcaoServico(null)
    //         }


    //         setRunFillAcoesServicos(false)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

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

            data_inicio_criacao: dataInicialCriacaoSolicitacoes,
            data_fim_criacao: dataFinalCriacaoSolicitacoes,

            data_inicio_execucao: dataInicialExecucaoSolicitacoes,
            data_fim_execucao: dataFinalExecucaoSolicitacoes,

            cliente,
            pesquisarTelefoneCliente,
            protocolo_externo_id: protocoloExterno,
            // acao_servico_id: acaoServico,
            servico_id: servico,
            acao_id: acao,
            status,
            colaboradores
        })
    }

    function handleClearFilter() {
        setStatus(null)
        setDataInicialCriacaoSolicitacoes(getDataHoje())
        setDataFinalCriacaoSolicitacoes(getDataHoje())

        setDataInicialExecucaoSolicitacoes(null)
        setDataFinalExecucaoSolicitacoes(null)

        setProtocoloExterno('')

        setCliente('')
        setPesquisarTelefoneCliente(false)

        // setAcaoServico(null);
        setServico(null);
        setAcao(null);

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
                title={<h1>Solicitações</h1>}
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
                                    Período Criação
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
                                                value={moment(dataInicialCriacaoSolicitacoes)}
                                                dateFormat="DD/MM/YYYY"
                                                timeFormat={false}
                                                renderDay={(props, currentDate, selectedDate) => {
                                                    let classes = props.className;
                                                    if (
                                                        dataInicialCriacaoSolicitacoes &&
                                                        dataFinalCriacaoSolicitacoes &&
                                                        dataInicialCriacaoSolicitacoes._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " start-date";
                                                    } else if (
                                                        dataInicialCriacaoSolicitacoes &&
                                                        dataFinalCriacaoSolicitacoes &&
                                                        new Date(dataInicialCriacaoSolicitacoes._d + "") <
                                                        new Date(currentDate._d + "") &&
                                                        new Date(dataFinalCriacaoSolicitacoes._d + "") >
                                                        new Date(currentDate._d + "")
                                                    ) {
                                                        classes += " middle-date";
                                                    } else if (
                                                        dataFinalCriacaoSolicitacoes &&
                                                        dataFinalCriacaoSolicitacoes._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " end-date";
                                                    }
                                                    return (
                                                        <td {...props} className={classes}>
                                                            {currentDate.date()}
                                                        </td>
                                                    );
                                                }}
                                                onChange={e => setDataInicialCriacaoSolicitacoes(e)}
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
                                                value={moment(dataFinalCriacaoSolicitacoes)}
                                                dateFormat="DD/MM/YYYY"
                                                timeFormat={false}
                                                renderDay={(props, currentDate, selectedDate) => {
                                                    let classes = props.className;
                                                    if (
                                                        dataInicialCriacaoSolicitacoes &&
                                                        dataFinalCriacaoSolicitacoes &&
                                                        dataInicialCriacaoSolicitacoes._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " start-date";
                                                    } else if (
                                                        dataInicialCriacaoSolicitacoes &&
                                                        dataFinalCriacaoSolicitacoes &&
                                                        new Date(dataInicialCriacaoSolicitacoes._d + "") <
                                                        new Date(currentDate._d + "") &&
                                                        new Date(dataFinalCriacaoSolicitacoes._d + "") >
                                                        new Date(currentDate._d + "")
                                                    ) {
                                                        classes += " middle-date";
                                                    } else if (
                                                        dataFinalCriacaoSolicitacoes &&
                                                        dataFinalCriacaoSolicitacoes._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " end-date";
                                                    }
                                                    return (
                                                        <td {...props} className={classes}>
                                                            {currentDate.date()}
                                                        </td>
                                                    );
                                                }}
                                                onChange={e => setDataFinalCriacaoSolicitacoes(e)}
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
                                                value={moment(dataInicialExecucaoSolicitacoes)}
                                                dateFormat="DD/MM/YYYY"
                                                timeFormat={false}
                                                renderDay={(props, currentDate, selectedDate) => {
                                                    let classes = props.className;
                                                    if (
                                                        dataInicialExecucaoSolicitacoes &&
                                                        dataFinalExecucaoSolicitacoes &&
                                                        dataInicialExecucaoSolicitacoes._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " start-date";
                                                    } else if (
                                                        dataInicialExecucaoSolicitacoes &&
                                                        dataFinalExecucaoSolicitacoes &&
                                                        new Date(dataInicialExecucaoSolicitacoes._d + "") <
                                                        new Date(currentDate._d + "") &&
                                                        new Date(dataFinalExecucaoSolicitacoes._d + "") >
                                                        new Date(currentDate._d + "")
                                                    ) {
                                                        classes += " middle-date";
                                                    } else if (
                                                        dataInicialExecucaoSolicitacoes &&
                                                        dataInicialExecucaoSolicitacoes._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " end-date";
                                                    }
                                                    return (
                                                        <td {...props} className={classes}>
                                                            {currentDate.date()}
                                                        </td>
                                                    );
                                                }}
                                                onChange={e => setDataInicialExecucaoSolicitacoes(e)}
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
                                                value={moment(dataFinalExecucaoSolicitacoes)}
                                                dateFormat="DD/MM/YYYY"
                                                timeFormat={false}
                                                renderDay={(props, currentDate, selectedDate) => {
                                                    let classes = props.className;
                                                    if (
                                                        dataInicialExecucaoSolicitacoes &&
                                                        dataFinalExecucaoSolicitacoes &&
                                                        dataInicialCriacaoSolicitacoes._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " start-date";
                                                    } else if (
                                                        dataInicialExecucaoSolicitacoes &&
                                                        dataFinalExecucaoSolicitacoes &&
                                                        new Date(dataInicialExecucaoSolicitacoes._d + "") <
                                                        new Date(currentDate._d + "") &&
                                                        new Date(dataFinalExecucaoSolicitacoes._d + "") >
                                                        new Date(currentDate._d + "")
                                                    ) {
                                                        classes += " middle-date";
                                                    } else if (
                                                        dataFinalExecucaoSolicitacoes &&
                                                        dataFinalExecucaoSolicitacoes._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " end-date";
                                                    }
                                                    return (
                                                        <td {...props} className={classes}>
                                                            {currentDate.date()}
                                                        </td>
                                                    );
                                                }}
                                                onChange={e => setDataFinalExecucaoSolicitacoes(e)}
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
                    <Col xs="4" lg="4" sm="12" md="12">
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
                    <Col xs="4" lg="4" sm="12" md="12">
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
                    <ColaboradorSelect />
                </Row>

            </Filters>
        </>
    );
}

export default FilterSolicitacoes;