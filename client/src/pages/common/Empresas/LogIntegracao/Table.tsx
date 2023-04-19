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
      dataField: "id",
      text: 'ID',
    },
    {
      dataField: "log_evento_id",
      text: 'Log Evt',
    },
    {
      dataField: "log_evento_id",
      text: 'Evento',
      formatter: (cell: any, row: any) => getDadosEvento(cell, row)
    },
    {
      dataField: "logEvento.contract_id",
      text: 'Contrato',
    },
    
    {
      dataField: "logEvento.event_id",
      text: 'Evento',
    },
    // {
    //   dataField: "protocolo_externo_id",
    //   text: 'Protocolo',
    // },
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
      formatter: (cell: any, row: any) => statusFormater(cell, row),
      align: 'center',
      headerAlign: 'center',
    },
    // hasPermission('ver-todas-solicitacoes') ? getColumnColaborador() : {}
    getColumnColaborador()
  ])

  const getDadosEvento = (cell: any, row: any) => {
    if (!row || !row.logEvento) {
      return
    }

    var title;
    var value;
    title = `Evento: ${row.logEvento.event_id}\nTipo: ${row.logEvento.event_type_id}\nDescrição: ${row.logEvento.event_descricao}`;
    value = row.logEvento.event_id;

    return (
      <>
        <Badge
          id={`evento-${row.logEvento.id}`}
          color={getColorEvento(row)}
          className="badge-lg"
          pill
          title={title}
        >
          {value}
        </Badge>
      </>
    )

  }

  function getColorEvento(row: LogIntegracao) {
    var color = 'secondary'

    if (row && row.logEvento) {
      if (isAprocavao(row.logEvento.event_type_id) || isDesbloqueio(row.logEvento.event_type_id) || isAlteracaoSituacao(row.logEvento.event_type_id)) {
        color = 'success'
      } else {
        if (isCancelamento(row.logEvento.event_type_id) || isSuspensao(row.logEvento.event_type_id) || isBloqueio(row.logEvento.event_type_id)) {
          color = 'warning'
        }
      }
    }

    return color
  }

  function isAprocavao(event_type_id?: number) {
    if (event_type_id) {
      const idsTipo = [3, 145, 117, 118]
      for (var i = 0; i < idsTipo.length; i++) {
        if (idsTipo[i] == event_type_id) {
          return true;
        }
      }
    }
    return false;
  }

  function isCancelamento(event_type_id?: number) {
    if (event_type_id) {
      const idsTipo = [24, 110, 144, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 174, 175]
      for (var i = 0; i < idsTipo.length; i++) {
        if (idsTipo[i] == event_type_id) {
          return true;
        }
      }
    }
    return false;
  }

  function isSuspensao(event_type_id?: number) {
    if (event_type_id) {
      const idsTipo = [43, 151]
      for (var i = 0; i < idsTipo.length; i++) {
        if (idsTipo[i] == event_type_id) {
          return true;
        }
      }
    }
    return false;
  }

  function isBloqueio(event_type_id?: number) {
    if (event_type_id) {
      const idsTipo = [40, 81]
      for (var i = 0; i < idsTipo.length; i++) {
        if (idsTipo[i] == event_type_id) {
          return true;
        }
      }
    }
    return false;
  }

  function isDesbloqueio(event_type_id?: number) {
    if (event_type_id) {
      const idsTipo = [41, 106]
      for (var i = 0; i < idsTipo.length; i++) {
        if (idsTipo[i] == event_type_id) {
          return true;
        }
      }
    }
    return false;
  }

  function isAlteracaoSituacao(event_type_id?: number) {
    if (event_type_id) {
      const idsTipo = [10]
      for (var i = 0; i < idsTipo.length; i++) {
        if (idsTipo[i] == event_type_id) {
          return true;
        }
      }
    }
    return false;
  }


  function isInclusaoAlteracaoOuExclusaoDeServico(event_type_id?: number) {
    if (event_type_id) {
      const idsTipo = [27, 133, 28]
      for (var i = 0; i < idsTipo.length; i++) {
        if (idsTipo[i] == event_type_id) {
          return true;
        }
      }
    }
    return false;
  }


  function getStatus(row: any) {
    if (row) {
      if (row.status && row.status == 'falha' && row.status_detalhe && row.status_detalhe == 'Ticket não encontrado pela api watch') {
        return 'executada'
      }
      return row.status
    }
    return null;
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
          if ((row.status == 'falha' || row.status == 'invalida') && !(row.status_detalhe && row.status_detalhe == 'Ticket não encontrado pela api watch')) {
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

  const statusFormater = (cell: any, row: any) => (
    <>
      <Badge
        id={`denc-${row.id}`}
        color={getColorStatus(row)}
        className="badge-lg"
        pill
        title={getStatusDetalhe(row)}
      >
        {getStatus(row)}
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