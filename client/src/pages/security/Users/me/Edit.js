import React from 'react';
import Form from "./Form"

// core components
import SimpleHeader from '../../../../components/Headers/SimpleHeader'

export default ({ match, ...props }) => {

    return (
        <>
            <SimpleHeader
                name="Alterar conta"
                parentName="Minha conta"
                {...props} />
            <Form
                {...props}
            />
        </>
    )


}
