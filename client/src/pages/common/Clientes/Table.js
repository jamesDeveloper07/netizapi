import React, { useState } from 'react';
import Table from '../../../components/Table'
import { MenuComportamento } from '../../../components/Menus'


export default ({ clientes, pageProperties, onTableChange, notify, ...props }) => {

    const [columns, setColumns] = useState([
        {
            dataField: 'acoes',
            formatter: (cell, row) => acoesFormatter(row, this)
        },
        {
            dataField: "nome",
            text: 'Nome',
        },
        {
            dataField: "tipo_pessoa",
            text: 'Tipo Pessoa',
            formatter: (cell, row) => tipoPessoaFormatter(row),
            align: 'center',
            headerAlign: 'center',
        },
        {
            dataField: "cpf_cnpj",
            text: 'CPF/CNPJ',
            align: 'center',
            headerAlign: 'center',
        },
        {
            dataField: "created_at",
            text: 'Data Cadastro',
            formatter: (cell, row) => dateFormater(row.created_at),
            align: 'center',
            headerAlign: 'center',
        },
        {
            dataField: "sexo",
            text: 'Sexo',
            formatter: (cell, row) => sexoFormatter(row),
            align: 'center',
            headerAlign: 'center',
        },

        {
            dataField: "data_nascimento",
            text: 'Data Nascimento/Fundação',
            formatter: (cell, row) => dateFormater(row.data_nascimento),
            align: 'center',
            headerAlign: 'center',
        },
    ])

    function goToEdit(id) {
        props.history.push(`/admin/clientes/${new Number(id)}/edit`)
    }

    function valorFormatter(row) {
        return (
            <>
                {Number(row.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </>
        )
    }

    function dateFormater(date) {
        if (!date) {
            return ''
        }
        const dt = new Date(date)
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        return (
            <>
                {dt.toLocaleDateString('pt-br', options)}
            </>
        )
    }


    function sexoFormatter(row) {
        if (row.tipo_pessoa == 'J') {
            return ''
        }
        let sexo = row.sexo
        if (sexo == "M") sexo = "Masculino"
        if (sexo == "F") sexo = "Feminino"
        if (sexo == "O") sexo = "Outro"
        return (
            <>
                {sexo}
            </>
        )
    }

    function tipoPessoaFormatter(row) {
        let tp = row.tipo_pessoa == "F" ? "Pessoa Física" : "Pessoa Jurídica"

        return (
            <>
                <span>{tp}</span>
            </>
        )
    }


    const acoesFormatter = (row, context) => {

        return (
            <MenuComportamento
                actions={[{
                    label: 'Alterar',
                    icon: 'far fa-edit',
                    onClick: () => goToEdit(row.id)
                }]}
            />
        )
    }

    return (
        <>
            <Table
                columns={columns}
                data={clientes}
                pageProperties={pageProperties}
                onTableChange={onTableChange}
            />
        </>
    );
}

