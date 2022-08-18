import React, { useState, useEffect } from 'react';

//@ts-ignore
import Select2 from 'react-select2-wrapper';
import { usePersistedState } from '../../../../hooks'
import Filters from '../../../../components/Headers/Filters'
import { TermosUso } from '../../../../entities/Common';

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
    data: Array<TermosUso>
    notify(type: string, msg: string): void,
    load(filters: object): void
    search?: boolean
}

const FilterTermos: React.FC<Props> = ({ title, notify, load, ...props }) => {
    const [nome, setNome] = usePersistedState('nomeTermos', null)
    const [status, setStatus] = usePersistedState('statusTermos', null)

    const [dataInicialVigenciaTermos, setDataInicialVigenciaTermos] = usePersistedState('dataInicialVigenciaTermos', getDataInicialVigenciaTermos())
    const [dataFinalVigenciaTermos, setDataFinalVigenciaTermos] = usePersistedState('dataFinalVigenciaTermos', getDataFinalVigenciaTermos())

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

    function getDataInicialVigenciaTermos() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth());
    }

    function getDataFinalVigenciaTermos() {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }


    function search() {
        load({
            nome,
            status,
            data_inicio_vigencia: dataInicialVigenciaTermos,
            data_fim_vigencia: dataFinalVigenciaTermos
        })
    }

    function hanldeClearFilter() {
        setNome('')
        setStatus(null)
        setDataInicialVigenciaTermos(getDataInicialVigenciaTermos())
        setDataFinalVigenciaTermos(getDataFinalVigenciaTermos())
    }

    function handleMultipleSelect(target: any, state: any) {
        const array = Array.from(target.selectedOptions)
        state(array.map((item: any) => item.value))
    }

    return (
        <>
            <Filters
                onSearch={search}
                title={<h1>Termos de Uso</h1>}
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
                                    Período Vigência
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
                                                value={moment(dataInicialVigenciaTermos)}
                                                dateFormat="DD/MM/YYYY"
                                                timeFormat={false}
                                                renderDay={(props, currentDate, selectedDate) => {
                                                    let classes = props.className;
                                                    if (
                                                        dataInicialVigenciaTermos &&
                                                        dataFinalVigenciaTermos &&
                                                        dataInicialVigenciaTermos._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " start-date";
                                                    } else if (
                                                        dataInicialVigenciaTermos &&
                                                        dataFinalVigenciaTermos &&
                                                        new Date(dataInicialVigenciaTermos._d + "") <
                                                        new Date(currentDate._d + "") &&
                                                        new Date(dataFinalVigenciaTermos._d + "") >
                                                        new Date(currentDate._d + "")
                                                    ) {
                                                        classes += " middle-date";
                                                    } else if (
                                                        dataFinalVigenciaTermos &&
                                                        dataFinalVigenciaTermos._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " end-date";
                                                    }
                                                    return (
                                                        <td {...props} className={classes}>
                                                            {currentDate.date()}
                                                        </td>
                                                    );
                                                }}
                                                onChange={e => setDataInicialVigenciaTermos(e)}
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
                                                value={moment(dataFinalVigenciaTermos)}
                                                dateFormat="DD/MM/YYYY"
                                                timeFormat={false}
                                                renderDay={(props, currentDate, selectedDate) => {
                                                    let classes = props.className;
                                                    if (
                                                        dataInicialVigenciaTermos &&
                                                        dataFinalVigenciaTermos &&
                                                        dataInicialVigenciaTermos._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " start-date";
                                                    } else if (
                                                        dataInicialVigenciaTermos &&
                                                        dataFinalVigenciaTermos &&
                                                        new Date(dataInicialVigenciaTermos._d + "") <
                                                        new Date(currentDate._d + "") &&
                                                        new Date(dataFinalVigenciaTermos._d + "") >
                                                        new Date(currentDate._d + "")
                                                    ) {
                                                        classes += " middle-date";
                                                    } else if (
                                                        dataFinalVigenciaTermos &&
                                                        dataFinalVigenciaTermos._d + "" === currentDate._d + ""
                                                    ) {
                                                        classes += " end-date";
                                                    }
                                                    return (
                                                        <td {...props} className={classes}>
                                                            {currentDate.date()}
                                                        </td>
                                                    );
                                                }}
                                                onChange={e => setDataFinalVigenciaTermos(e)}
                                            />
                                        </InputGroup>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </fieldset>
                    </Col>
                </Row>

                <Row style={{paddingBottom:'1rem'}}>
                    <Col
                        lg={6}
                        md={12}
                        sm={12}
                    >
                        <FormGroup>
                            <label
                                className="form-control-label"
                            >
                                Nome
                            </label>
                            <Input
                                className="form-control-alternative"
                                placeholder="Nome..."
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

export default FilterTermos;