import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

import { Badge } from "reactstrap";
import Table from '../../../../components/Table'
import { MenuComportamento } from '../../../../components/Menus'
import { LogIntegracao, Solicitacao } from '../../../../entities/Common';
import Avatar from '../../../../components/Avatar';
import { hasPermission, getContrastYIQ } from '../../../../utils';

// import { Container } from './styles';
interface Props {
  logs: Array<LogIntegracao>,
  pageProperties: any,
  onTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void>,
  notify(type: string, msg: string): void,
  loading: boolean
}

const TableLogs: React.FC<Props> = ({ logs, pageProperties, onTableChange, notify, loading, ...props }) => {
  const history = useHistory()

  const [columns] = useState([
    // {
    //   dataField: 'acoes',
    //   formatter: (cell: any, row: any) => acoesFormatter(cell, row)
    // },
    {
      dataField: "protocolo_externo_id",
      text: 'Protocolo',
    },
    {
      dataField: "nome_cliente",
      text: 'Cliente',
      formatter: (cell: any, row: any) => clienteFormater(cell, row)
    },
    {
      dataField: "email_cliente",
      text: 'Email',
    },
    {
      dataField: "telefone_cliente",
      text: 'Fone',
      formatter: (cell: any, row: any) => phoneFormater(cell, row)
    },
    {
      dataField: "servico.nome",
      text: 'Serviço',
    },
    {
      dataField: "acaoServico.acao.nome",      
      text: 'Ação',
      formatter: (cell: any, row: any) => acaoServicoFormater(cell, row)
    },
    {
      dataField: 'data_evento',
      text: 'Evento',
      sort: true,
      formatter: (cell: any, row: any) => dataFormatter(cell, row)
    },
    {
      dataField: 'created_at',
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
      if (row.status == 'executada') {
        color = 'success'
      } else {
        if (row.status == 'cancelada') {
          color = 'warning'
        } else {
          if (row.status == 'falha' || row.status == 'invalida') {
            color = 'danger'
          }
        }
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

  const clienteFormater = (cell: any, row: any) => (
    <>
      <div
        id={`cli-${row.id}`}
        title={`cpf: ${row.documento_cliente}`}
      >
        {row.nome_cliente}
      </div>
    </>
  )

  const phoneFormater = (cell: any, row: any) => (
    <>
      <div
        id={`fone-${row.id}`}
      >
        {getFoneFormat(row)}
      </div>
    </>
  )

  function getFoneFormat(row: any) {
    var tel
    if (row) {
      if (row.telefone_cliente) {
        tel = row.telefone_cliente.replace(/[^0-9]/g, '');
      }
    }

    return tel
  }

  const acaoServicoFormater = (cell: any, row: any) => (
    <>
      <div
        id={`acao-${row.id}`}
        title={`${row.acao}`}
      >
        {row.acaoServico.acao.nome}
      </div>
    </>
  )

  const situacaoFormater = (cell: any, row: any) => (
    <>
      <Badge
        id={`denc-${row.id}`}
        color={getColorStatus(row)}
        className="badge-lg"
        pill
        title={getStatusDetalhe(row)}
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
        data={logs}
        pageProperties={pageProperties}
        onTableChange={onTableChange}
        notify={undefined}
        rowEvents={undefined} />
    </>
  );
}

export default TableLogs;