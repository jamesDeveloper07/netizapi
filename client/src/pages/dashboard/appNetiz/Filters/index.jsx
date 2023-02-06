import React, { useState, useEffect } from 'react';
import moment from 'moment'

import ExpandedFilters from './ExpandedFilters'
import ReactDatetime from "react-datetime";
import Select2 from "react-select2-wrapper";
import {
    Collapse,
    Button,
    Card,
    CardBody,
    CardHeader,
    Container,
    InputGroup,
    FormGroup,
    InputGroupAddon,
    InputGroupText,
    Row,
    Col,
    Alert,
} from "reactstrap";


import {
    Gradient,
} from './styles';

function Filters({
    notify,
    onDateChanged,
    isGestor,
    ano,
    mes,
    campanha,
    colaborador,
    equipe,
    setAno,
    setMes,
    setColaborador,
    setEquipe
}) {

    const [showCalendar, setShowCalandar] = useState(false)
    const [showDetails, setShowDetatails] = useState(false)


    useEffect(() => {
        if (onDateChanged) onDateChanged(mes, ano)
    }, [mes, ano])

    useEffect(() => {
        setShowCalandar(false)
    }, [showDetails])


    function handleDateSelected(e) {
        try {
            setMes(e.format('MM'))
            setAno(e.format('YYYY'))
        } catch (error) {
            console.error(error)
        }
    }
    function handleShow(e) {
        //Se ação do botão for acionada pelo Botão Principal, ou pelo Botão de escolha de Mês
        //é acionado o método de Ocultar/Mostrar Calendário
        console.log(e.target.className)
        if (e.target.className.includes('form-control-flush h2 text-blue d-inline-block mb-0') ||
            e.target.className.includes('rdtMonth') ||
            e.target.className.includes('btn-neutral btn btn-default btn-sm btn btn-secondary btn-sm')
        ) {
            setShowCalandar(!showCalendar)
        }
    }

    return (
        <>

            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    justifyContent: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    marginTop: '-150px',
                    paddingBottom: '20px'
                }}
            >
                <Button
                    className="btn-neutral btn btn-default btn-sm"
                    style={{ marginTop: 12, marginRight: '-5px' }}
                    color="secondary"
                    size="sm"
                    onClick={handleShow}
                    type="button">

                    <ReactDatetime
                        style={{
                            marginTop: -37,
                            visibility: false,
                            position: 'absolute',
                            zIndex: 1000
                        }}
                        open={showCalendar}
                        inputProps={{
                            readOnly: true,
                            className: 'form-control-flush h2 text-blue d-inline-block mb-0',
                            style: {
                                background: '#ffff',
                                textAlign: 'center',
                                color: '#11CDEF',
                                cursor: 'pointer'

                            }
                        }}
                        defaultValue={moment()}
                        value={moment(`${mes}-${ano}`, 'MM/YYYY')}
                        dateFormat={'MMMM/YYYY'}
                        viewMode='months'
                        timeFormat={false}
                        onChange={handleDateSelected}
                    />

                </Button>

                {/* <FormGroup> */}
                    {
                        isGestor &&
                        <Button
                            className="btn-icon btn-2 ml-2"
                            style={{ marginTop: 12, 
                                height: '45px',
                                width: '45px',
                                color: '#0847d6',
                                background: 'rgb(255, 255, 255)'
                             }}
                            color="secondary"
                            size="sm"
                            onClick={() => setShowDetatails(!showDetails)}
                            type="button">
                            <span className="btn-inner--icon">
                                <i className={`ni ni-${showDetails ? 'bold-up' : 'bold-down'}`}></i>
                            </span>
                        </Button>
                    }
                {/* </FormGroup> */}
            </div>

            {
                isGestor &&
                <ExpandedFilters
                    hidde={() => setShowDetatails(!showDetails)}
                    show={showDetails}
                    notify={notify}
                    colaborador={colaborador}
                    equipe={equipe}
                    campanha={campanha}
                    onColaboradorChanged={setColaborador}
                    onEquipeChanged={setEquipe}
                />
            }


        </>
    )
}

export default Filters;