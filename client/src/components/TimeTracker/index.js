import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/pt-br';


import { FormGroup, Form, Input, Row, Col, Badge } from "reactstrap";

export default ({ time, size = 'lg', color = 'primary', timeDestiny = (new Date().getTime()) }, ...props) => {

    const [currentTime, setCurrentTime] = useState(null)
    const [waitTime, setWaitTime] = useState(null)

    useEffect(() => {
        if (waitTime) clearInterval(waitTime)
        //setWaitTime(setInterval(calculateTime, 1000))
    }, [time])


    const formatDate = (date) => {
        const dt = new Date(date)
        return ` À ${dt.getDate()} dias ${dt.getHours()} horas ${dt.getMinutes()} minutos e ${dt.getSeconds()} segundos`
    }

    const calculateTime = () => {
        try {
            const dt = (new Date()).getTime()
            const current = dt - time
            setCurrentTime(current)
        } catch (error) {
            setCurrentTime(null)
        }
    }



    const duration = () => {
        const antigo = moment(new Date(time))
        const atual = moment(timeDestiny)
        const duration = moment.duration(atual.diff(antigo))
        return duration
    }

    const difference = (type) => {
        const antigo = moment(time)
        const atual = moment(timeDestiny)
        return atual.diff(antigo, type)
    }

    const timeLarge = () => (
        <Row
            style={{
                justifyContent: 'center'
            }}
        >
            <div
                title="Dias"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 60
                }}
            >
                <Input
                    disabled
                    style={{
                        textAlign: 'center'
                    }}
                    className="form-control-muted"
                    placeholder="Muted input"
                    type="text"
                    value={currentTime ? difference('days') : '-'}
                />
                <label >
                    Dias
                </label>
            </div>
            <div
                title="Horas"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 60
                }}
            >
                <Input
                    disabled
                    style={{
                        textAlign: 'center'
                    }}
                    className="form-control-muted"
                    placeholder="Muted input"
                    type="text"
                    value={currentTime ? duration().get('hours') : '-'}
                />
                <label >
                    Horas
            </label>
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 60
                }}
                title="Minutos"
            >
                <Input
                    disabled
                    style={{
                        textAlign: 'center',
                        width: 60
                    }}
                    className="form-control-muted"
                    placeholder="Muted input"
                    type="text"
                    value={currentTime ? duration().get('minutes') : '-'}
                />
                <label >
                    Min
            </label>
            </div>

            <div
                title="Segundos"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 60
                }}
            >
                <Input
                    disabled
                    style={{
                        textAlign: 'center'
                    }}
                    className="form-control-muted"
                    placeholder="Muted input"
                    type="text"
                    value={currentTime ? duration().get('seconds') : '-'}
                />
                <label >
                    Seg
            </label>
            </div>
        </Row>
    )

    const timeSmall = () => (
        <>
            <Badge
                className="badge-lg"
                color={(() => {
                    const diff = difference('days')
                    if (diff < 3) {
                        return 'warning'
                    } else if (diff > 1) {
                        return 'primary'
                    }
                    return 'danger'
                })()}
                pill>
                {moment(time).to(moment(timeDestiny))}
            </Badge>
        </>
    )

    return (
        <>
            {
                size == 'lg' ?
                    timeLarge()
                    :
                    timeSmall()
            }
        </>
    );
}
