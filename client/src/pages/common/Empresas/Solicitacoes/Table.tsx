import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

import { Badge } from "reactstrap";
import Table from '../../../../components/Table'
import { MenuComportamento } from '../../../../components/Menus'
import { Solicitacao } from '../../../../entities/Common';
import Avatar from '../../../../components/Avatar';
import { hasPermission, getContrastYIQ } from '../../../../utils';

// import { Container } from './styles';
interface Props {
  solicitacoes: Array<Solicitacao>,
  pageProperties: any,
  onTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void>,
  notify(type: string, msg: string): void,
  loading: boolean
}

const TableSolicitacoes: React.FC<Props> = ({ solicitacoes, pageProperties, onTableChange, notify, loading, ...props }) => {
  const history = useHistory()

  const [columns] = useState([
    {
      dataField: 'acoes',
      formatter: (cell: any, row: any) => acoesFormatter(cell, row)
    },
    {
      dataField: "protocolo_externo_id",
      text: 'Protocolo',
    },
    {
      dataField: "cliente.nome",
      text: 'Cliente',
    },
    {
      dataField: "acaoServico.servico.nome",
      text: 'Serviço',
    },
    {
      dataField: "acaoServico.acao.nome",
      text: 'Ação',
    },
    {
      dataField: 'created_at',
      text: 'Criação',
      sort: true,
      formatter: (cell: any, row: any) => dataFormatter(cell, row)
    },
    {
      dataField: 'finished_at',
      text: 'Execução',
      sort: true,
      formatter: (cell: any, row: any) => dataFormatter(cell, row)
    },
    {
      situacao: "status",
      text: 'Status',
      formatter: (cell: any, row: any) => situacaoFormater(cell, row),
      align: 'center',
      headerAlign: 'center',
    },
    // hasPermission('ver-todas-solicitacoes') ? getColumnColaborador() : {}
    true ? getColumnColaborador() : {}
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
      if (row.status == 'finalizada') {
        color = 'success'
      } else {
        if (row.status == 'cancelada') {
          color = 'warning'
        } else {
          if (row.status == 'falha') {
            color = 'danger'
          }
        }
      }
    }

    return color
  }

  const situacaoFormater = (cell: any, row: any) => (
    <>
      <Badge
        id={`denc-${row.id}`}
        color={getColorStatus(row)}
        className="badge-lg"
        pill
      >
        {row.status}
      </Badge>
    </>
  )

  function getColumnColaborador() {
    return ({
      dataField: 'user.name',
      text: 'Colaborador',
      formatter: (row: any, column: any) => colaboradorFormatter(row, column),
      // csvFormatter: (cell, row) => colaboradorFormatterCsv(cell, row),
      align: 'center',
      headerAlign: 'center',
      sort: true
    })
  }


  const colaboradorFormatter = (cell: any, row: any) => (
    <>
      {
        row.user &&
        <Avatar
          title={row.user.name}
          user={row.user}
          className='avatar-xs'
          style={{
            cursor: 'default'
          }}
        />
      }
    </>
  )


  function goToEdit(id: number) {
    history.push(`/admin/solicitacoes/${id}/edit`)
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

  const acoesFormatter = (cell: any, row: { id: any; }) => {
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
        data={solicitacoes}
        pageProperties={pageProperties}
        onTableChange={onTableChange}
        notify={undefined}
        rowEvents={undefined} />
    </>
  );
}

export default TableSolicitacoes;