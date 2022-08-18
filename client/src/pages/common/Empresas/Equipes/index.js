import React, { useState, useEffect } from 'react';
import api from "../../../../services/api";

import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import Form from './Form'
import AddMembro from './AddMembro'
import List from './List'
import {
    Button,
    Row,
    Col,
} from "reactstrap"


export default ({ notify, empresa, ...props }) => {

    const [equipes, setEquipes] = useState([])
    const [equipe, setEquipe] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [showAddMembro, setShowAddMembro] = useState(false)


    useEffect(() => {
        if (equipes.length === 0) loadEquipes()
    }, [empresa])

    async function loadEquipes() {
        try {
            const response = await api.get(`/common/empresas/${empresa.id}/equipes`)
            setEquipes(await response.data)
        } catch (error) {
            console.error(error)
            notify('danger', 'Não foi possível carregar equipes')
        }
    }

    function handleEditEquipe(equipe) {
        setEquipe(equipe)
        setShowModal(true)
    }

    function handleShowAddMembro(equipe) {
        setEquipe(equipe)
        setShowAddMembro(true)
    }

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    justifyContent: 'center'
                }}
            >
                <AddMembro
                    equipe={equipe}
                    empresa={empresa}
                    onSuccess={loadEquipes}
                    show={showAddMembro}
                    notify={notify}
                    close={() => {
                        setShowAddMembro(false)
                        setEquipe({})
                    }}
                />
                <Form
                    equipe={equipe}
                    empresa={empresa}
                    onSuccess={loadEquipes}
                    show={showModal}
                    notify={notify}
                    close={() => {
                        setShowModal(false)
                        setEquipe({})
                    }}
                />
                <Button
                    color="primary"
                    type="button"
                    className="btn-icon btn-3"
                    onClick={() => {
                        setEquipe({})
                        setShowModal(!showModal)
                    }}
                >
                    <span className="btn-inner--icon">
                        <i className="ni ni-fat-add"></i>
                    </span>
                    <span className="btn-inner--text">Novo</span>
                </Button>
            </div>
            <List
                showMembros={handleShowAddMembro}
                itens={equipes}
                onSelected={handleEditEquipe}
                empresa={empresa}
                reload={loadEquipes}
                notify={notify}
            />
 

        </>
    );
}
