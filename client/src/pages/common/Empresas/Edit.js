import React, { useState, useEffect } from 'react';
import Form from "./Form"

// core components
import SimpleHeader from '../../../components/Headers/SimpleHeader'

export default ({ match, ...props }) => {

    const [id, setId] = useState(null)
    
    useEffect(() => {
        const { params } = match
        if (params && params.id != id) {
            setId(params.id)
        }
    }, [])

    return (
        <>
            <SimpleHeader
                name="Alterar Empresa"
                parentName="Empresas"
                {...props} />
            <Form
                {...props}
                empresaId={id}
                externaTabActive={null}
            />
        </>
    )


}
