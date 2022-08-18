import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

import { Badge } from "reactstrap";
import Table from '../../../../components/Table'
import { MenuComportamento } from '../../../../components/Menus'
import {TermosUso } from '../../../../entities/Common';


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
      dataField: 'acoes',
      formatter: (cell: any, row: any) => acoesFormatter(cell, row)
    },
    {
      dataField: "nome",
      text: 'Nome',
    },
    {
      dataField: "versao",
      text: 'Versão',
    },
    {
      dataField: 'data_inicio_vigencia',
      text: 'Data Início',
      sort: true,
      formatter: (cell: any, row: any) => dataFormatter(cell, row)
    },
    {
      dataField: 'data_fim_vigencia',
      text: 'Data Fim',
      sort: true,
      formatter: (cell: any, row: any) => dataFormatter(cell, row)
    },
    {
      situacao: "status",
      text: 'Status',
      formatter: (cell: any, row: any) => situacaoFormater(cell, row),
      align: 'center',
      headerAlign: 'center',
    }
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
      if (row.data_fim_vigencia) {
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


  function goToEdit(id: number) {
    history.push(`/admin/termos-uso/${id}/edit`)
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
        data={termosUso}
        pageProperties={pageProperties}
        onTableChange={onTableChange}
        notify={undefined}
        rowEvents={undefined} />
    </>
  );
}

export default TableTermos;