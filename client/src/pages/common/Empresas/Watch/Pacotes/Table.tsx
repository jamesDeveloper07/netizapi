import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

import { Badge } from "reactstrap";
import Table from '../../../../../components/Table'
import { MenuComportamento } from '../../../../../components/Menus'
import Avatar from '../../../../../components/Avatar';
import { hasPermission, getContrastYIQ } from '../../../../../utils';
import Pacote from '../../../../../entities/Common/Watch/Pacote';

// import { Container } from './styles';
interface Props {
  pacotes: Array<Pacote>,
  pageProperties: any,
  onTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void>,
  notify(type: string, msg: string): void,
  loading: boolean
}

const TablePacotes: React.FC<Props> = ({ pacotes, pageProperties, onTableChange, notify, loading, ...props }) => {
  const history = useHistory()

  const [columns] = useState([
    {
      dataField: 'acoes',
      formatter: (cell: any, row: any) => acoesFormatter(cell, row)
    },
    {
      dataField: "Pacote",
      text: 'Código',
    },
    {
      dataField: "Note",
      text: 'Pacote',
    },
    {
      dataField: "Tipo",
      text: 'Tipo',
    },
    {
      dataField: "QuantidadeTickets",
      text: 'Qtd Tickets',
    },
    {
      dataField: "QuantidadeAtivos",
      text: 'Ativos',
    },
    {
      dataField: "QuantidadeInativos",
      text: 'Inativos',
    },
    {
      dataField: "QuantidadeDisponivel",
      text: 'Disponíveis',
    },
    {
      dataField: "QuantidadeDesvinculados",
      text: 'Excluídos',
    },
    {
      situacao: "Status",
      text: 'Status',
      formatter: (cell: any, row: any) => situacaoFormater(cell, row),
      align: 'center',
      headerAlign: 'center',
    },
    {
      dataField: 'CreatedAt',
      text: 'Criação',
      sort: true,
      formatter: (cell: any, row: any) => dataFormatter(cell, row)
    },

    // hasPermission('ver-todas-solicitacoes') ? getColumnColaborador() : {}
    // true ? getColumnColaborador() : {}
  ])


  function getStatus(row: any) {
    var status = 'Não identificado'

    if (row) {
      if (row.data_fim_vigencia) {
        status = 'Não Vigente'
      } else {
        status = 'Vigente'
      }
    }

    return status
  }

  function getColorStatus(row: any) {
    var color = 'secondary'

    if (row) {
      if (row.Status == 'ACTIVE') {
        color = 'success'
      } else {
        color = 'danger'
      }
    }

    return color
  }

  function getStatusDetalhe(row: any) {
    if (row) {
      if (row.status_detalhe) {
        return row.status_detalhe
      }
    }
    return null
  }

  const situacaoFormater = (cell: any, row: any) => (
    <>
      <Badge
        id={`denc-${row.id}`}
        color={getColorStatus(row)}
        className="badge-lg"
        pill
        title={getStatusDetalhe(row)}
      >
        {row.Status}
      </Badge>
    </>
  )

 
  function goToEdit(pacote: number) {
    history.push(`/admin/watch/pacotes/${pacote}/tickets`)
  }

  const dataFormatter = (cell: any, row: any) => {
    var data = null;
    if (cell) {
      const dt = new Date(cell)
      var options = { year: 'numeric', month: 'long', day: 'numeric' };
      {/* @ts-ignore */ }
      data = dt.toLocaleDateString('pt-br', options);
    }

    return (
      <>
        {data ? data : ''}
      </>
    )
  }

  const acoesFormatter = (cell: any, row: { Pacote: any; }) => {
    return (
      <MenuComportamento
        actions={[{
          label: 'View',
          icon: 'far fa-edit',
          onClick: () => goToEdit(row.Pacote)
        }]}
      />
    )
  }



  return (
    <>
      <Table
        columns={columns}
        data={pacotes}
        pageProperties={pageProperties}
        onTableChange={onTableChange}
        notify={undefined}
        rowEvents={undefined} />
    </>
  );
}

export default TablePacotes;