import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

import { Badge } from "reactstrap";
import Table from '../../../../components/Table'
import { MenuComportamento } from '../../../../components/Menus'
import { LogEvento } from '../../../../entities/Common';
import Avatar from '../../../../components/Avatar';
import { hasPermission, getContrastYIQ } from '../../../../utils';
import moment from 'moment'

// import { Container } from './styles';
interface Props {
  logs: Array<LogEvento>,
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
      dataField: "contract_id",
      text: 'Contrato',
    },
    {
      dataField: "event_id",
      text: 'Evento',
      formatter: (cell: any, row: any) => getDadosEvento(cell, row)
    },
    {
      dataField: "name",
      text: 'Cliente',
      formatter: (cell: any, row: any) => clienteFormater(cell, row)
    },
    {
      dataField: "email",
      text: 'Email',
    },
    {
      dataField: "phone",
      text: 'Fone',
      formatter: (cell: any, row: any) => phoneFormater(cell, row)
    },
    {
      dataField: 'event_data',
      text: 'Datas',
      formatter: (cell: any, row: any) => getDatas(cell, row)
    },
    {
      dataField: "stage",
      text: 'Estágio',
      formatter: (cell: any, row: any) => stageFormater(cell, row),
      align: 'center',
      headerAlign: 'center',
    },
    {
      dataField: "status",
      text: 'Status',
      formatter: (cell: any, row: any) => statusFormater(cell, row),
      align: 'center',
      headerAlign: 'center',
    },
    {
      dataField: "isservicodigital",
      text: 'Tem SVA\'s?',
      formatter: (cell: any, row: any) => booleanFormater(cell, row, null),
      align: 'center',
      headerAlign: 'center',
    },
    {
      dataField: "isdeezer",
      text: 'Deezer?',
      formatter: (cell: any, row: any) => booleanFormater(cell, row, row.deezer_item_id),
      align: 'center',
      headerAlign: 'center',
    },
    {
      dataField: "iswatch",
      text: 'Watch?',
      formatter: (cell: any, row: any) => booleanFormater(cell, row, row.watch_item_id),
      align: 'center',
      headerAlign: 'center',
    },
    {
      dataField: "ishbo",
      text: 'HBO?',
      formatter: (cell: any, row: any) => booleanFormater(cell, row, row.hbo_item_id),
      align: 'center',
      headerAlign: 'center',
    },
    {
      dataField: "iswatchup",
      text: 'Watch Up+?',
      formatter: (cell: any, row: any) => booleanFormater(cell, row, row.watchup_item_id),
      align: 'center',
      headerAlign: 'center',
    },
    getColumnColaborador()

  ])

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

  function getColorStage(row: any) {
    var color = 'secondary'

    if (row) {
      if (row.stage == '3') {
        color = 'success'
      } else {
        color = 'warning'
      }
    }

    return color
  }

  function getStageDetalhe(row: any) {
    if (row) {
      if (row.stage) {
        return row.stage
      }
    }
    return null
  }

  function getColorStatus(row: any) {
    var color = 'secondary'

    if (row) {
      if (row.status == '1') {
        color = 'success'
      } else {
        color = 'warning'
      }
    }

    return color
  }

  function getStatusDetalhe(row: any) {
    if (row) {
      if (row.status) {
        return row.status
      }
    }
    return null
  }

  const clienteFormater = (cell: any, row: any) => (
    <>
      <div
        id={`cli-${row.id}`}
        title={`cpf: ${row.tx_id}`}
      >
        {row.name}
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
      if (row.phone) {
        tel = row.phone.replace(/[^0-9]/g, '');
      }
    }

    return tel
  }

  const stageFormater = (cell: any, row: any) => (
    <>
      <Badge
        id={`denc-${row.id}`}
        color={getColorStage(row)}
        className="badge-lg"
        pill
        title={getStageDetalhe(row)}
      >
        {row.v_stage}
      </Badge>
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
        {row.v_status}
      </Badge>
    </>
  )

  const booleanFormater = (cell: any, row: any, title:any) => (
    <>
      <Badge
        id={`bool-${row.id}`}
        color={getColorBoolean(cell)}
        className="badge-lg"
        pill
        title={title ? title : ''}
      >
        {cell ? 'Sim' : 'Não'}
      </Badge>
    </>
  )

  function getColorBoolean(cell: any) {
    var color = 'secondary'

    if (cell) {
      color = 'success'
    } else {
      color = 'warning'
    }

    return color;
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

  const getDadosEvento = (cell: any, row: any) => {
    if (!row) {
      return
    }

    var title;
    var value;
    title = `Evento: ${row.event_id}\nTipo: ${row.event_type_id}\nDescrição: ${row.event_descricao}`;
    value = row.event_id;

    return (
      <>
        <Badge
          id={`evento-${row.id}`}
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

  function getColorEvento(row: LogEvento) {
    var color = 'secondary'

    if (row) {
      if (isAprocavao(row.event_type_id) || isDesbloqueio(row.event_type_id) || isAlteracaoSituacao(row.event_type_id)) {
        color = 'success'
      } else {
        if (isCancelamento(row.event_type_id) || isSuspensao(row.event_type_id) || isBloqueio(row.event_type_id)) {
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

  const getDatas = (cell: any, row: any) => {
    if (!row || (!row.event_data && !row.created_at)) {
      return
    }

    var title;
    var value;

    if (row.event_data && row.created_at) {
      title = `Evento: ${dataFormatterNew(row.event_data, row)}\nIntegração: ${dataFormatterNew(row.created_at, row)}`;
      value = dataFormatterNew(row.event_data, row)?.toString();
    } else {
      if (row.event_data) {
        title = `Evento: ${dataFormatterNew(row.event_data, row)}}`;
        value = dataFormatterNew(row.event_data, row)?.toString();
      } else {
        title = `Integração: ${dataFormatterNew(row.created_at, row)}}`;
        value = dataFormatterNew(row.created_at, row)?.toString();
      }
    }

    return (
      <>
        <span
          id={`datas-${row.id}`}
          title={title}
        >
          {value}
        </span>
      </>
    )

  }

  const dataFormatterNew = (cell: any, row: any) => {
    if (!cell) {
      return
    }
    const data = moment(cell)
    return data.format('D MMM YYYY HH:mm:ss')
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