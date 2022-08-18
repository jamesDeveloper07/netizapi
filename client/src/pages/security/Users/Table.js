import React, { useState, useEffect } from 'react';

import Table from '../../../components/Table'
import { MenuComportamento } from '../../../components/Menus'
import {
    Badge,
} from "reactstrap";


export default ({ usuarios, pageProperties, onTableChange, notify, ...props }) => {

    const [columns, setColumns] = useState([
        {
            dataField: 'acoes',
            formatter: (cell, row) => acoesFormatter(cell, row, this)
        },
        {
            dataField: 'name',
            text: 'Nome',
            sort: true,
        },
        {
            dataField: "email",
            text: 'email',
            sort: true,
        },
        {
            dataField: 'empresas',
            text: 'Empresas',
            align: 'center',
            headerAlign: 'center',
            formatter: (cell, row) => empresasFormaters(cell, row)
        },
        // {
        //     dataField: 'perfils',
        //     text: 'perfis',
        //     align: 'center',
        //     headerAlign: 'center',
        //     formatter: (cell, row) => rolesFormaters(cell, row)
        // },
        {
            dataField: 'status',
            text: 'Situação',
            align: 'center',
            headerAlign: 'center',
            formatter: (cell, row) => situacaoFormaters(cell, row)
        }
    ])

    function rolesFormaters(cell, row) {
        return (
            <>
                {row.roles.map((item, key) =>
                    <>
                        <Badge key={key} className="badge-default" pill>
                            {item.name}
                        </Badge>
                    </>)}
            </>
        )
    }

    function situacaoFormaters(cell, row) {
        return (
            <>
                <Badge color={row.status ? "success" : "warning"} pill>
                    {row.status ? 'Ativo' : 'Inativo'}
                </Badge>
            </>
        )
    }

    function empresasFormaters(cell, row) {
        return (
            <>
                {row.empresas.map((item, key) =>
                    <>
                        <Badge key={key}
                            className="badge-default"
                            href='#'
                            onClick={() => props.history.push(`empresas/${item.id}/edit`)}
                        >
                            {item.nome}
                        </Badge>
                    </>)}
            </>
        )
    }

    const acoesFormatter = (cell, row, context) => {
        return (
            <MenuComportamento
                actions={[{
                    label: 'Alterar',
                    icons: 'far fa-edit',
                    onClick: () => goToEdit(row.id)
                }]}
            />
        )
    }


    function goToEdit(id) {
        props.history.push(`/admin/usuarios/${new Number(id)}/edit`)
    }


    return (
        <>
            <Table
                columns={columns}
                data={usuarios}
                pageProperties={pageProperties}
                onTableChange={onTableChange}
            />
        </>
    );
}

