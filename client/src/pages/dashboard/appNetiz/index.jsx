import React, { useState, useRef, useContext } from 'react';
import moment from 'moment'
import AuthContext from "../../../contexts/Auth";
import NotificationAlert from "react-notification-alert";
import { usePersistedState } from '../../../hooks'
import Chart from "chart.js";
import {
    // global options for the charts
    chartOptions,
    // function that adds the global options to our charts
    parseOptions,
} from "../../../variables/charts";

import Filters from './Filters'
import Informativos from './Informativos'
// import Graficos from './Graficos'
// core components
import SimpleHeader from '../../../components/Headers/SimpleHeader'
import { useEffect } from 'react';

export default ({ ...props }) => {

    const { hasPermission } = useContext(AuthContext)
    const [mes, setMes] = usePersistedState('mes', moment().format('MM'))
    const [ano, setAno] = usePersistedState('ano', moment().format('YYYY'))
    const [colaborador, setColaborador] = usePersistedState('colaboradorSelecionado', null)
    const [equipe, setEquipe] = usePersistedState('equipeSelecionada', null)
    const [campanha, setCampanha] = useState(null)

    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)
    const notificationAlert = useRef();

    const isGestor = hasPermission('ver-dashboard-gestao')

    useEffect(() => {
        setCampanha(null)
    }, [mes, ano])

    useEffect(() => {
        if (window.Chart) parseOptions(Chart, chartOptions());
    }, [])

    function notify(type, msg) {
        let options = {
            place: "tc",
            message: (
                <div className="alert-text">
                    <span data-notify="message">
                        {msg}
                    </span>
                </div>
            ),
            type: type,
            icon: "ni ni-bell-55",
            autoDismiss: 7
        };
        if (notificationAlert && notificationAlert.current) notificationAlert.current.notificationAlert(options);

    }

    return (
        <>
            {alert}
            <div className="rna-wrapper">
                <NotificationAlert ref={notificationAlert} />
            </div>
            <SimpleHeader name="App Netiz" parentName="Dashboard" {...props} />
            <Filters
                mes={mes}
                ano={ano}
                equipe={equipe}
                colaborador={colaborador}
                setMes={setMes}
                setAno={setAno}
                campanha={campanha}
                setColaborador={setColaborador}
                setEquipe={setEquipe}
                isGestor={isGestor}
                notify={notify}
            />

            <Informativos
                mes={mes}
                ano={ano}
                notify={notify} />

            {/* <Graficos
                notify={notify}
                mes={mes}
                ano={ano}
                equipe={equipe}
                campanha={campanha}
                colaborador={colaborador}
                setCampanha={setCampanha}
                props={props} /> */}

        </>
    );
}
