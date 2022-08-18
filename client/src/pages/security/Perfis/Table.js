import React, { useState } from 'react';
import Table from '../../../components/Table'
import { MenuComportamento } from '../../../components/Menus'


export default ({ perfis, pageProperties, onTableChange, notify, ...props }) => {

    const [columns, setColumns] = useState([
        {
            dataField: 'acoes',
            formatter: (cell, row) => acoesFormatter(cell, row, this)
        },
        {
            dataField: 'name',
            text: 'Nome',
            align: 'center',
            headerAlign: 'center',
        },
        {
            dataField: 'slug',
            text: 'Apelido(name key)',
            align: 'center',
            headerAlign: 'center',
        }
    ])


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
        props.history.push(`/admin/perfis/${new Number(id)}/edit`)
    }


    return (
        <>
            <Table
                columns={columns}
                data={perfis}
                pageProperties={pageProperties}
                onTableChange={onTableChange}
            />
        </>
    );
}

