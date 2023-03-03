import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

import { Badge } from "reactstrap";
import Avatar from '../../../../../../components/Avatar'
import Table from '../../../../../../components/Table'
import { MenuComportamento } from '../../../../../../components/Menus'
import { TermosUso } from '../../../../../../entities/Common';


// import { Container } from './styles';
interface Props {
  termosUso: Array<TermosUso>,
  pageProperties: any,
  onTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void>,
  notify(type: string, msg: string): void,
  loading: boolean
}

const TableTermos: React.FC<Props> = ({ termosUso, pageProperties, onTableChange, notify, loading, ...props }) => {
  const history = useHistory()

  const [columns] = useState([
    {
      dataField: "termosUso.nome",
      text: 'Nome',
    },
    {
      dataField: "termosUso.versao",
      text: 'Versão',
    },
    {
      dataField: 'termosUso.data_inicio_vigencia',
      text: 'Data Início',
      sort: true,
      formatter: (cell: any, row: any) => dataFormatter(cell, row)
    },
    {
      dataField: 'termosUso.data_fim_vigencia',
      text: 'Data Fim',
      sort: true,
      formatter: (cell: any, row: any) => dataFormatter(cell, row)
    },
    {
      dataField: 'dt_assinatura',
      text: 'Data Assinatura',
      sort: true,
      formatter: (cell: any, row: any) => dataFormatter(cell, row)
    },
    {
      dataField: 'user.name',
      text: 'Assinante',
      formatter: (cell: any, row:any) => colaboradorFormatter(cell, row),
      align: 'center',
      headerAlign: 'center'
    },
    {
      situacao: "status",
      text: 'Status',
      formatter: (cell: any, row: any) => situacaoFormater(cell, row),
      align: 'center',
      headerAlign: 'center',
    }
  ])


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

  function getStatus(row: any) {
    var status = 'Não identificado'

    if (row) {
      if (row.termosUso.data_fim_vigencia) {
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
      if (row.termosUso.data_fim_vigencia) {
        color = 'danger'
      } else {
        color = 'success'
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
        {getStatus(row)}
      </Badge>
    </>
  )

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

  return (
    <>
      <Table
        columns={columns}
        data={termosUso}
        pageProperties={pageProperties}
        onTableChange={onTableChange}
        notify={notify}
        rowEvents={undefined} />
    </>
  );
}

export default TableTermos;