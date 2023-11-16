import React, { useState, useContext } from 'react';
import EmpresaContext from "../../../../contexts/Empresa";
import { useHistory } from "react-router-dom";

import { Badge, Modal, Button } from "reactstrap";
import Table from '../../../../components/Table'
import { MenuComportamento } from '../../../../components/Menus'
import { LogEvento } from '../../../../entities/Common';
import Avatar from '../../../../components/Avatar';
import { hasPermission, getContrastYIQ } from '../../../../utils';
import moment from 'moment'
import api from "../../../../services/api";

// import { Container } from './styles';
interface Props {
  contratos: Array<LogEvento>,
  pageProperties: any,
  setPageProperties(pageProperties: any): any,
  // setPageProperties: any,
  onTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void>,
  notify(type: string, msg: string): void,
  loading: boolean
}

const TableContratosByEventos: React.FC<Props> = ({ contratos, pageProperties, setPageProperties, onTableChange, notify, loading, ...props }) => {
  const history = useHistory()
  const { empresaSelecionada } = useContext(EmpresaContext)
  const [reexecutandoIntegracao, setReexecutandoIntegracao] = useState(false)
  const [alert, setAlert] = useState<any>(undefined)

  const [columns] = useState([
    {
      dataField: 'acoes',
      formatter: (cell: any, row: any) => acoesFormatter(cell, row)
    },
    {
      dataField: "contract_id",
      text: 'Contrato',
      sort: true,
    },
    {
      dataField: "event_id",
      text: 'Evento',
      formatter: (cell: any, row: any) => getDadosEvento(cell, row),
      sort: true,
    },
    {
      dataField: "name",
      text: 'Cliente',
      formatter: (cell: any, row: any) => clienteFormater(cell, row),
      sort: true,
    },
    {
      dataField: "email",
      text: 'Email',
      sort: true,
    },
    {
      dataField: "phone",
      text: 'Fone',
      formatter: (cell: any, row: any) => phoneFormater(cell, row),
      sort: true,
    },
    {
      dataField: 'event_data',
      text: 'Datas',
      formatter: (cell: any, row: any) => getDatas(cell, row),
      sort: true,
    },
    {
      dataField: "stage",
      text: 'Estágio',
      formatter: (cell: any, row: any) => stageFormater(cell, row),
      align: 'center',
      headerAlign: 'center',
      sort: true,
    },
    {
      dataField: "status",
      text: 'Status',
      formatter: (cell: any, row: any) => statusFormater(cell, row),
      align: 'center',
      headerAlign: 'center',
      sort: true,
    },
    {
      dataField: "isservicodigital",
      text: 'Tem SVA\'s?',
      formatter: (cell: any, row: any) => booleanFormater(cell, row, null),
      align: 'center',
      headerAlign: 'center',
      sort: true,
    },
    {
      dataField: "isdeezer",
      text: 'Deezer?',
      formatter: (cell: any, row: any) => booleanFormater(cell, row, row.deezer_item_id),
      align: 'center',
      headerAlign: 'center',
      sort: true,
    },
    {
      dataField: "iswatch",
      text: 'Watch?',
      formatter: (cell: any, row: any) => booleanFormater(cell, row, row.watch_item_id),
      align: 'center',
      headerAlign: 'center',
      sort: true,
    },
    {
      dataField: "ishbo",
      text: 'HBO?',
      formatter: (cell: any, row: any) => booleanFormater(cell, row, row.hbo_item_id),
      align: 'center',
      headerAlign: 'center',
      sort: true,
    },
    {
      dataField: "iswatchup",
      text: 'Watch Up+?',
      formatter: (cell: any, row: any) => booleanFormater(cell, row, row.watchup_item_id),
      align: 'center',
      headerAlign: 'center',
      sort: true,
    },
  ])

  const acoesFormatter = (cell: any, row: { contract_id: any; }) => {
    return (
      <MenuComportamento
        actions={[{
          label: 'Reexecutar Integração',
          icon: 'fa fa-share-alt',
          onClick: () => handleConfirmarAcao(row.contract_id, 'reexecutar')
        },
        {
          label: 'Forçar Cancelamento de SVA\'s',
          icon: 'fa fa-share-alt',
          onClick: () => handleConfirmarAcao(row.contract_id, 'cancelar')
        }]}
      />
    )
  }

  function handleConfirmarAcao(contract_id: any, tipoAcao: string) {

    if (contract_id && tipoAcao) {
      if (tipoAcao == 'reexecutar') {
        confirmAlert(`Deseja realmente REEXECUTAR a integração de SVA's para o contrato ${contract_id}?`,
          'warning',
          () => handleReexecutarIntegracao(contract_id))
      } else {
        if (tipoAcao == 'cancelar') {
          confirmAlert(`Deseja realmente CANCELAR os SVA's do contrato ${contract_id}?`,
            'warning',
            () => handleForcarCancelamento(contract_id))
        }
      }
    }
  }

  async function handleReexecutarIntegracao(_contract_id: any) {

    try {
      setAlert(null)
      setReexecutandoIntegracao(true)
      setPageProperties({
        ...pageProperties,
        loading: true
      })
      const response = await api.get(`voalle/reexecutarintegracao`, {
        params: {
          emp_id: empresaSelecionada?.id,
          contract_id: _contract_id
        }
      })

      console.log('RESPONSE REEXECUTAR INTEGRAÇÂO');
      console.log(response.data);

      if (response.data && response.data.length > 0) {
        notify('success', `Integração realizada: ${response.data.length} contrato executado`);
      } else {
        notify('success', `Nenhum Contrato a ser executado no momento.`);
      }

    } catch (err) {
      //@ts-ignore
      if (err && err.response && err.response.status && err.response.status == 400 && err.response.data) {
        //@ts-ignore
        notify('danger', err.response.data);
      } else {
        notify('danger', 'Houve um problema ao Executar as Reexecução de integração.');
        //@ts-ignore
        console.log(err);
        //@ts-ignore
        console.log(err.response)
      }
    } finally {
      setReexecutandoIntegracao(false)
      setPageProperties({
        ...pageProperties,
        loading: false
      })
    }

  }

  async function handleForcarCancelamento(_contract_id: any) {
    // notify('warning', 'Função ainda não implementda.');

    try {
      setAlert(null)
      setReexecutandoIntegracao(true)
      setPageProperties({
        ...pageProperties,
        loading: true
      })
      const response = await api.get(`voalle/executarcancelamentomanual`, {
        params: {
          emp_id: empresaSelecionada?.id,
          contract_id: _contract_id
        }
      })

      console.log('RESPONSE CANCELAMENTO MANUAL');
      console.log(response.data);

      if (response.data && response.data.length > 0) {
        notify('success', `Integração realizada: ${response.data.length} contrato executado`);
      } else {
        notify('success', `Nenhum Contrato a ser executado no momento.`);
      }

    } catch (err) {
      //@ts-ignore
      if (err && err.response && err.response.status && err.response.status == 400 && err.response.data) {
        //@ts-ignore
        notify('danger', err.response.data);
      } else {
        notify('danger', 'Houve um problema ao Executar o Cancelamento Manual.');
        //@ts-ignore
        console.log(err);
        //@ts-ignore
        console.log(err.response)
      }
    } finally {
      setReexecutandoIntegracao(false)
      setPageProperties({
        ...pageProperties,
        loading: false
      })
    }

  }

  function confirmAlert(message: any, alertColor: any, onConfirm: any) {
    setAlert(
      <Modal
        className={`modal-dialog-centered modal-${alertColor}`}
        contentClassName={`bg-gradient-${alertColor}`}
        size="md"
        isOpen={true}
        toggle={() => setAlert(null)}
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-notification">
            Atenção
          </h6>
        </div>
        <div className="modal-body">
          <div className="py-3 text-center">
            <i className="fas fa-question-circle ni-3x" />
            <h4 className="heading mt-4"></h4>
            <p>
              {message}
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <Button
            className="text-white ml-auto"
            color="link"
            data-dismiss="modal"
            type="button"
            onClick={() => setAlert(null)}
          >
            Fechar
          </Button>

          <Button
            onClick={onConfirm}
            className="btn-white"
            color="default"
            type="button">
            Sim
          </Button>
        </div>
      </Modal>
    )
  }

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

  const booleanFormater = (cell: any, row: any, title: any) => (
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
      // <>
      //   <span
      //     id={`evento-${row.id}`}
      //     title={title}
      //   >
      //     {value}
      //   </span>
      // </>

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
      {alert}
      <Table
        columns={columns}
        data={contratos}
        pageProperties={pageProperties}
        onTableChange={onTableChange}
        notify={undefined}
        rowEvents={undefined} />
    </>
  );
}

export default TableContratosByEventos;