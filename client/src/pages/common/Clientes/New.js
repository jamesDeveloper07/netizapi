import React from 'react';
import FormCliente from "./Form"

// core components
import SimpleHeader from '../../../components/Headers/SimpleHeader'

class New extends React.Component {

    dateOptions(){
        return { year: 'numeric', month: 'long', day: 'numeric' };
    }

    state = {
        cliente: {
            "created_at": new Date().toLocaleDateString('pt-br', this.dateOptions)
        }
    }


    render(){
        return(
            <>
                <SimpleHeader name="Novo cliente" parentName="Clientes" {...this.props} />
                <FormCliente {...this.props} clienteId={null} />
            </>
        )
    }

}

export default New;
