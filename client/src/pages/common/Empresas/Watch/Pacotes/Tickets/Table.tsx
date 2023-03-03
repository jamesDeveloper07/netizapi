import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

import { Badge } from "reactstrap";
import Table from '../../../../../../components/Table'
import { MenuComportamento } from '../../../../../../components/Menus'
import Avatar from '../../../../../../components/Avatar';
import { hasPermission, getContrastYIQ } from '../../../../../../utils';
import Pacote from '../../../../../../entities/Common/Watch/Pacote';
import Ticket from '../../../../../../entities/Common/Watch/Ticket';

// import { Container } from './styles';
interface Props {
  pacote: Pacote,
  tickets: Array<Ticket>,
  pageProperties: any,
  onTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void>,
  onPhoneChange(ticket: Ticket): Promise<void>,
  onStatusChange(ticket: Ticket): Promise<void>,
  onDeleteTicket(ticket: Ticket): Promise<void>,
  notify(type: string, msg: string): void,
  loading: boolean
}

const TableTickets: React.FC<Props> = ({ pacote, tickets, pageProperties, onPhoneChange, onTableChange, onStatusChange, onDeleteTicket, notify, loading, ...props }) => {
  const history = useHistory()

  const [columns] = useState([
    {
      dataField: 'acoes',
      formatter: (cell: any, row: any) => acoesFormatter(cell, row)
    },
    {
      dataField: "Pacote",
      text: 'Pacote'
    },
    {
      dataField: "Ticket",
      text: 'Ticket',
    },
    {
      dataField: "IDIntegracaoAssinante",
      text: 'ID Integração',
    },
    {
      dataField: "EmailUsuario",
      text: 'Email',
    },
    {
      situacao: "Status",
      text: 'Status',
      formatter: (cell: any, row: any) => situacaoFormater(cell, row),
      align: 'center',
      headerAlign: 'center',
    },
    {
      dataField: 'DataCriacao',
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
      if (row.Status) {
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
        {row.Status ? 'Ativo' : 'Inativo'}
      </Badge>
    </>
  )


  function goToChangePhone(ticket: any) {
    console.log(`Alterar o telefone do Ticket ${ticket.Ticket}.`)
    onPhoneChange(ticket);    
  }

  function goToChangeStatus(ticket: any) {    
    console.log(`Alterar o status para ${ticket.Status ? 'Inativo' : 'Ativo'}.`)
    onStatusChange(ticket);
  }

  function goToDelete(ticket: any) {    
    console.log(`Deletar o Ticket ${ticket.Ticket}.`)
    onDeleteTicket(ticket);
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

  const acoesFormatter = (cell: any, row: any) => {
    return (
      <MenuComportamento
        actions={[
          {
            label: 'Alterar Telefone',
            icon: 'fa fa-edit',
            onClick: () => goToChangePhone(row)
          },
          {
            label: !row.Status ? 'Ativar' : 'Inativar',
            icon: !row.Status ? 'fa fa-check-circle' : 'fa fa-times-circle',
            onClick: () => goToChangeStatus(row)
          },
          {
            label: 'Excluir',
            icon: 'fa fa-trash',
            onClick: () => goToDelete(row)
          }
        ]}
      />
    )
  }

  const pacoteNoteFormatter = (cell: any, row: { Pacote: any; }, pacote: any) => {
    return (<>{pacote.Tipo}</>)
  }

  const pacoteTipoFormatter = (cell: any, row: { Pacote: any; }) => {
    return (<>Teste tipo</>)
  }



  return (
    <>
      <Table
        columns={columns}
        data={tickets}
        pageProperties={pageProperties}
        onTableChange={onTableChange}
        notify={undefined}
        rowEvents={undefined} />
    </>
  );
}

export default TableTickets;