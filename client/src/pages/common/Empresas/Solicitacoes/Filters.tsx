import React, { useState, useEffect } from 'react';

//@ts-ignore
import Select2 from 'react-select2-wrapper';
import { usePersistedState } from '../../../../hooks'
import Filters from '../../../../components/Headers/Filters'
import { Solicitacao } from '../../../../entities/Common';

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
    data: Array<Solicitacao>
    notify(type: string, msg: string): void,
    load(filters: object): void
    search?: boolean
}

const FilterTermos: React.FC<Props> = ({ title, notify, load, ...props }) => {

    const [status, setStatus] = usePersistedState('statusSolicitacoes', null)

    const [dataInicialCriacaoSolicitacoes, setDataInicialCriacaoSolicitacoes] = usePersistedState('dataInicialCriacaoSolicitacoes', getDataInicialCriacaoSolicitacoes())
    const [dataFinalCriacaoSolicitacoes, setDataFinalCriacaoSolicitacoes] = usePersistedState('dataFinalCriacaoSolicitacoes', getDataFinalCriacaoSolicitacoes())

    //Flag para definir tempo de execução
    //pra que essa validação
    const [runLoad, setRunLoad] = useState(true)

    useEffect(() => {
        if (runLoad) {
            search()
            setRunLoad(false)
        }
    }, [runLoad])


    function throwError(text: string) {
        if (notify) notify('danger', text)
    }

    function getDataInicialCriacaoSolicitacoes() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth());
    }

    function getDataFinalCriacaoSolicitacoes() {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }


    function search() {
        load({
            status,
            data_inicio_criacao: dataInicialCriacaoSolicitacoes,
            data_fim_criacao: dataFinalCriacaoSolicitacoes
        })
    }

    function hanldeClearFilter() {
        setStatus(null)
        setDataInicialCriacaoSolicitacoes(getDataInicialCriacaoSolicitacoes())
        setDataFinalCriacaoSolicitacoes(getDataFinalCriacaoSolicitacoes())
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
                onFiltersClead={hanldeClearFilter}
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
                </Row>

            </Filters>
        </>
    );
}

export default FilterTermos;