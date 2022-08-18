import React, { useState, useEffect } from 'react';

//@ts-ignore
import Select2 from 'react-select2-wrapper';
import { usePersistedState } from '../../../hooks'
import Filters from '../../../components/Headers/Filters'
import { Notificacao } from '../../../entities/Security';

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

interface Props {
    title: React.ReactElement,
    data: Array<Notificacao>
    notify(type: string, msg: string): void,
    load(filters: object, clearPagination: boolean, clearSort: boolean): Promise<void>,
    search?: boolean
}

const FilterNotificacoes: React.FC<Props> = ({ title, notify, load, ...props }) => {
    const [titulo, setTitulo] = usePersistedState('tituloNotificacao', null)
    const [situacao, setSituacao] = usePersistedState('situacaoNotificacao', 'todas')

    const [dataInicialEnvio, setDataInicialEnvio] = usePersistedState('dataInicialEnvioNotificacao', getDataInicialEnvio())
    const [dataFinalEnvio, setDataFinalEnvio] = usePersistedState('dataFinalEnvioNotificacao', getDataFinalEnvio())

    //Flag para definir tempo de execução
    //pra que essa validação
    const [runLoad, setRunLoad] = useState(true)

    const [monitorClearFilters, setMonitorClearFilters] = useState(undefined)

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

    function throwError(text: string) {
        if (notify) notify('danger', text)
    }

    function getDataInicialEnvio() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth());
    }

    function getDataFinalEnvio() {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    async function handlePesquisar() {
        await search(true, false)
    }

    async function search(clearPagination: boolean, clearSort: boolean) {
        await load({
            titulo,
            situacao,
            dataInicialEnvio,
            dataFinalEnvio
        }, clearPagination, clearSort)
    }

    function handleClearFilter() {
        setTitulo('')
        setSituacao('todas')
        setDataInicialEnvio(getDataInicialEnvio())
        setDataFinalEnvio(getDataFinalEnvio())
    }

    function handleMultipleSelect(target: any, state: any) {
        const array = Array.from(target.selectedOptions)
        state(array.map((item: any) => item.value))
    }

    return (
        <>
            <Filters
                onSearch={handlePesquisar}
                title={<h1>Notificações</h1>}
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
                                    Período Envio
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
                                                value={moment(dataInicialEnvio)}
                                                dateFormat="DD/MM/YYYY"
                                                timeFormat={false}
                                                renderDay={(props, currentDate, selectedDate) => {
                                                    let classes = props.className;
                                                    if (
                                                        dataInicialEnvio &&
                                                        dataFinalEnvio &&
                                                        dataInicialEnvio._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " start-date";
                                                    } else if (
                                                        dataInicialEnvio &&
                                                        dataFinalEnvio &&
                                                        new Date(dataInicialEnvio._d + "") <
                                                        new Date(currentDate._d + "") &&
                                                        new Date(dataFinalEnvio._d + "") >
                                                        new Date(currentDate._d + "")
                                                    ) {
                                                        classes += " middle-date";
                                                    } else if (
                                                        dataFinalEnvio &&
                                                        dataFinalEnvio._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " end-date";
                                                    }
                                                    return (
                                                        <td {...props} className={classes}>
                                                            {currentDate.date()}
                                                        </td>
                                                    );
                                                }}
                                                onChange={e => setDataInicialEnvio(e)}
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
                                                value={moment(dataFinalEnvio)}
                                                dateFormat="DD/MM/YYYY"
                                                timeFormat={false}
                                                renderDay={(props, currentDate, selectedDate) => {
                                                    let classes = props.className;
                                                    if (
                                                        dataInicialEnvio &&
                                                        dataFinalEnvio &&
                                                        dataInicialEnvio._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " start-date";
                                                    } else if (
                                                        dataInicialEnvio &&
                                                        dataFinalEnvio &&
                                                        new Date(dataInicialEnvio._d + "") <
                                                        new Date(currentDate._d + "") &&
                                                        new Date(dataFinalEnvio._d + "") >
                                                        new Date(currentDate._d + "")
                                                    ) {
                                                        classes += " middle-date";
                                                    } else if (
                                                        dataFinalEnvio &&
                                                        dataFinalEnvio._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " end-date";
                                                    }
                                                    return (
                                                        <td {...props} className={classes}>
                                                            {currentDate.date()}
                                                        </td>
                                                    );
                                                }}
                                                onChange={e => setDataFinalEnvio(e)}
                                            />
                                        </InputGroup>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </fieldset>
                    </Col>
                </Row>

                <Row style={{ paddingBottom: '1rem' }}>
                    <Col
                        lg={6}
                        md={12}
                        sm={12}
                    >
                        <FormGroup>
                            <label
                                className="form-control-label"
                            >
                                Título
                            </label>
                            <Input
                                className="form-control-alternative"
                                placeholder="Título..."
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                            />
                        </FormGroup>
                    </Col>
                </Row>

                <Row style={{ paddingBottom: '1rem' }}>
                    <Col
                        lg={6}
                        md={12}
                        sm={12}
                    >
                        <FormGroup>
                            <label
                                className="form-control-label"
                            >
                                Situação
                            </label>
                            <InputGroup className="input-group-alternative">
                                <Select2
                                    className="input-group-alternative"
                                    defaultValue="-1"
                                    options={{
                                        placeholder: "Selecione..."
                                    }}
                                    //@ts-ignore
                                    onSelect={(e) => setSituacao(e.target.value)}
                                    value={situacao}
                                    data={[{
                                        id: 'todas', text: '- Todas -'
                                    }, {
                                        id: 'lidas', text: 'Lidas'
                                    },
                                    {
                                        id: 'nao_lidas', text: 'Não Lidas'
                                    }
                                    ]}
                                />
                            </InputGroup>
                        </FormGroup>
                    </Col>
                </Row>

            </Filters>
        </>
    );
}

export default FilterNotificacoes;