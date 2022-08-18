import React, { useState, useEffect } from 'react';

import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";

import api from "../../../../../services/api";

import {
    Button
} from "reactstrap";


export default ({ perfis, empresa, user, notify, loadPerfis, confirmAlert, setAlert, loadColaboradores, loadEmpresas, ...props }) => {

    const [columns] = useState([
        {
            dataField: 'acoes',
            formatter: (cell, row) => acoesFormatter(cell, row)
        },
        {
            dataField: 'name',
            text: 'Nome',
            sort: true
        },
        {
            dataField: 'description',
            text: 'Descrição',
            sort: true
        },
    ])

    function acoesFormatter(cell, row) {
        return (<>
            <div class="btn-group" role="group" aria-label="Basic example">
                <Button
                    className="btn-sm"
                    color="danger"
                    onClick={() => handleRemoverPerfil(row)}
                    outline>
                    <i class="fas fa-times"></i>
                </Button>
            </div>
        </>)
    }

    async function removePerfil(perfil) {

        console.log('REMOVER PERFIL')
        console.log(perfil)
        console.log(empresa)

        try {
            await api.delete(`/security/usuarios/${user.id}/empresas/${empresa?.id}/perfis/${perfil.id}`)
            loadPerfis()
            if (loadColaboradores) {
                loadColaboradores()
            }
            if (loadEmpresas) {
                loadEmpresas()
            }
            notify('success', 'Perfil Usuário/Empresa Removido')
        } catch (error) {
            console.log(error)
            notify('danger', 'Não foi possível remover Perfil Usuário/Empresa')
        }
        setAlert(null)
    }

    function handleRemoverPerfil(perfil) {

        console.log('handleRemoverPerfil')
        console.log({ perfil })
        console.log({ empresa })
        console.log({ user })

        confirmAlert(`Deseja realmente remover o perfil ${perfil.name} do usuário ${user.name}?`,
            'danger',
            () => removePerfil(perfil))
    }


    return (
        <>
            <ToolkitProvider
                data={perfis}
                keyField="name"
                columns={columns}
                search
            >
                {props => (
                    <div className="py-4 table-responsive">
                        <BootstrapTable
                            {...props.baseProps}
                            bootstrap4={true}
                            bordered={false}
                        />
                    </div>
                )}
            </ToolkitProvider>
        </>
    );
}

