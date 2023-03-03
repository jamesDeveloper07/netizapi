import React, { useEffect, useState, useRef, useContext } from 'react';
import EmpresaContext from "../../../../../contexts/Empresa";
import { AxiosResponse } from 'axios';
import { useHistory } from "react-router-dom";
import api from "../../../../../services/api";
//@ts-ignore
import NotificationAlert from "react-notification-alert";

//import { Pacote } from '../../../../entities/Common/Watch/Pacote';

import Table from './Table';
import {
  Spinner,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
} from "reactstrap";
// core components
import SimpleHeader from '../../../../../components/Headers/SimpleHeader'
import Pacote from '../../../../../entities/Common/Watch/Pacote';


const WatchIndex: React.FC = ({ }) => {

  const history = useHistory()
  const { empresaSelecionada } = useContext(EmpresaContext)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [pacotes, setPacotes] = useState(new Array<Pacote>())
  const [pageProperties, setPageProperties] = useState({
    total: "0",
    perPage: 10,
    page: 1,
    lastPage: 1,
    loading: false
  })
  const [lastSearch, setLastSearch] = useState({})
  const notificationAlert = useRef<NotificationAlert>(null);

  // const [executandoPendente, setExecutandoPendente] = useState(false)

  function notify(type: string, msg: string) {
    let options = {
      place: "tc",
      message: (
        <div className="alert-text">
          <span data-notify="message">
            {msg}
          </span>
        </div>
      ),
      type: type,
      icon: "ni ni-bell-55",
      autoDismiss: 7
    };
    notificationAlert?.current?.notificationAlert(options);
  };

  function handleNewSolicitacao(e: React.MouseEvent) {
    e.preventDefault();
    history.push('/admin/solicitacoes/new')
  }

  useEffect(() => {
    loadPacotes();
  }, [])


  // async function handleExecutarPendentes(e: React.MouseEvent) {
  //   e.preventDefault();

  //   try {
  //     setExecutandoPendente(true)
  //     const response = await api.get(`common/executarSolicitacoesPendentes`, {
  //       params: {
  //         emp_id: empresaSelecionada?.id
  //       }
  //     })

  //     console.log('RESPONSE EXECUTAR SOLICITACOES PENDETES');
  //     console.log(response.data);

  //     notify('success', `${response.data.status} - ${response.data.mensagem}`);

  //     loadPacotes();
  //   } catch (err) {
  //     //@ts-ignore
  //     console.log(err);
  //     //@ts-ignore
  //     console.log(err.response)
  //     notify('danger', 'Houve um problema ao Executar as Solicitações.');
  //   } finally {
  //     setExecutandoPendente(false)
  //   }

  // }

  async function updatePageProperties(response: AxiosResponse) {
    const { perPage, page, lastPage } = await response.data
    const total = await response.data.length

    setPageProperties({
      total,
      perPage,
      page,
      lastPage,
      loading: false,
    })
  }

  async function loadPacotes(page = 1,
    limit = 10,
    sortField = "nome",
    sortOrder = "asc",
    filters = lastSearch) {
    try {
      setPageProperties({
        ...pageProperties,
        loading: true
      })
      // const response = await api.get(`common/empresas/${empresaSelecionada?.id}/solicitacao/`, {
      const response = await api.get(`/watch/v1/buscarpacote`, {
        params: {
          page,
          limit,
          sortField,
          sortOrder,
          ...filters,
          emp_id: empresaSelecionada?.id,
          pPacote: null
        }
      })

      // console.log('RESPONSE PACOTES');
      // console.log(response.data);      
      setPacotes(response.data)
      // console.log({pacotes});      
      await updatePageProperties(response)
    } catch (err) {
      //@ts-ignore
      console.log(err.response)
      notify('danger', 'Houve um problema ao carregar os Pacotes.');
    }
  }

  async function handleTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void> {
    try {
      await loadPacotes(
        sortProperties.page == 0 ? 1 : sortProperties.page,
        sortProperties.sizePerPage,
        sortProperties.sortField,
        sortProperties.sortOrder)
    } catch (error) {
      notify('danger', 'Houve um problema ao carregar os Pacotes.');
    }
  }


  return (
    <>
      {alert}
      <div className="rna-wrapper">
        <NotificationAlert ref={notificationAlert} />
      </div>
      <SimpleHeader name="Listagem de Pacotes" parentName="Pacotes" />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <Card>
              <CardHeader
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}>
                <h1>Pacotes</h1>
              </CardHeader>

              <CardBody>
                <Row>
                  <Col>
                    <Table
                      pacotes={pacotes || []}
                      notify={notify}
                      onTableChange={handleTableChange}
                      pageProperties={pageProperties}
                      loading={loading}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default WatchIndex;