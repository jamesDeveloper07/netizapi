import React, { useState, useEffect } from 'react';
import api from "../../../../services/api";
import { Empresa, SiteEmpresa } from '../../../../entities/Common'
import List from './List'
import Form from './Form'

import {
    Button,
    Row,
    Col,
} from "reactstrap"

//Definindo as propriedades desse componente 
type Props = {
    onEmpresaChange(empresa: Empresa): void,
    notify(type: string, msg: string): void,
    empresa: Empresa
}

const Sites: React.FC<Props> = ({
    onEmpresaChange,
    notify,
    empresa
}) => {

    const [sites, setSites] = useState(new Array<SiteEmpresa>())
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        if (empresa.id) {
            load()
        }
    }, [empresa])

    async function load() {
        try {
            const response = await api.get(`/common/empresas/${empresa.id}/sites-empresas`)
            setSites(await response.data)

        } catch (error) {
            console.log(error)
            notify('danger', 'Não foi possível carregar os sites da empresa')
        }

    }

    function hideForm() {
        setShowForm(false)
    }

    function handleShowForm() {
        setShowForm(true)
    }

    return (
        <>
            <Form
                empresa={empresa}
                hide={hideForm}
                notify={notify}
                success={load}
                show={showForm}
                site={{} as SiteEmpresa}
            />
            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    justifyContent: 'center'
                }}
            >
                <Button
                    color="primary"
                    type="button"
                    className="btn-icon btn-3"
                    onClick={handleShowForm}

                >
                    <span className="btn-inner--icon">
                        <i className="ni ni-fat-add"></i>
                    </span>
                    <span className="btn-inner--text">Novo Site</span>
                </Button>
            </div>
            <List
                sites={sites}
                empresa={empresa}
                notify={notify}
                reLoad={load}
            />
        </>
    );
}



export default Sites;