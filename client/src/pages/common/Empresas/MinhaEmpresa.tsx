import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'

import EmpresaContext from '../../../contexts/Empresa'
import Form from "./Form";
import SimpleHeader from '../../../components/Headers/SimpleHeader'

const Empresas: React.FC<any> = ({ ...props }) => {

    const history = useHistory()
    const { empresaSelecionada } = useContext(EmpresaContext)
    const [empresaId, setEmpresaId] = useState<undefined | number>(undefined)

    useEffect(() => {
        if (empresaSelecionada) setEmpresaId(empresaSelecionada.id)
    }, [empresaSelecionada])

    var externaTabActive = props.location.state?.externaTabActive ? props.location.state.externaTabActive : null;

    return (
        <>
            <SimpleHeader
                parentName="Minha Empresa"
            />
            <Form
                empresaId={empresaId}
                history={history}
                minhaEmpresa={true}
                // hiddeTabs={{
                //     users: true
                // }}
                externaTabActive={externaTabActive}
            />
        </>
    )

}

export default Empresas;