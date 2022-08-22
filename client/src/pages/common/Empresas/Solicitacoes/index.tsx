import React, { useState, useRef, useContext } from 'react';
import EmpresaContext from "../../../../contexts/Empresa";
import { AxiosResponse } from 'axios';
import { useHistory } from "react-router-dom";
import api from "../../../../services/api";
//@ts-ignore
import NotificationAlert from "react-notification-alert";
import Filters from './Filters'

import { Solicitacao } from '../../../../entities/Common';

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
import SimpleHeader from '../../../../components/Headers/SimpleHeader'

const SolicitacaoIndex: React.FC = ({ }) => {

  const history = useHistory()
  const { empresaSelecionada } = useContext(EmpresaContext)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [solicitacoes, setSolicitacoes] = useState(new Array<Solicitacao>())
  const [pageProperties, setPageProperties] = useState({
    total: "0",
    perPage: 10,
    page: 1,
    lastPage: 1,
    loading: false
  })
  const [lastSearch, setLastSearch] = useState({})
  const notificationAlert = useRef<NotificationAlert>(null);

  const [executandoPendente, setExecutandoPendente] = useState(false)

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

  async function handleExecutarPendentes(e: React.MouseEvent) {
    e.preventDefault();

    try {
      setExecutandoPendente(true)
      const response = await api.get(`common/executarSolicitacoesPendentes`, {
        params: {
          emp_id: empresaSelecionada?.id
        }
      })

      console.log('RESPONSE EXECUTAR SOLICITACOES PENDETES');
      console.log(response.data);

      notify('success', `${response.data.status} - ${response.data.mensagem}`);

      loadSolicitacoes();
    } catch (err) {
      //@ts-ignore
      console.log(err);
      //@ts-ignore
      console.log(err.response)
      notify('danger', 'Houve um problema ao Executar as Solicitações.');
    } finally {
      setExecutandoPendente(false)
    }

  }

  async function updatePageProperties(response: AxiosResponse) {
    const { total, perPage, page, lastPage } = await response.data
    setPageProperties({
      total,
      perPage,
      page,
      lastPage,
      loading: false,
    })
  }

  async function loadSolicitacoes(page = 1,
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
      const response = await api.get(`common/solicitacao/`, {
        params: {
          page,
          limit,
          sortField,
          sortOrder,
          ...filters,
          emp_id: empresaSelecionada?.id
        }
      })

      // console.log('RESPONSE SOLICITACOES');

      // console.log(response.data.data);

      setSolicitacoes(response.data.data)
      await updatePageProperties(response)
    } catch (err) {
      //@ts-ignore
      console.log(err.response)
      notify('danger', 'Houve um problema ao carregar as Solicitações.');
    }
  }

  async function handleTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void> {
    try {
      await loadSolicitacoes(
        sortProperties.page == 0 ? 1 : sortProperties.page,
        sortProperties.sizePerPage,
        sortProperties.sortField,
        sortProperties.sortOrder)
    } catch (error) {
      notify('danger', 'Houve um problema ao carregar as Solicitações.');
    }
  }


  return (
    <>
      {alert}
      <div className="rna-wrapper">
        <NotificationAlert ref={notificationAlert} />
      </div>
      <SimpleHeader name="Listagem de Solicitações" parentName="Solicitações" />
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
                <Filters
                  title={<h1>Solicitações</h1>}
                  data={solicitacoes}
                  notify={notify}
                  load={(filters: object) => {
                    setLastSearch(filters)
                    loadSolicitacoes(
                      1,
                      10,
                      "id",
                      "asc",
                      filters)
                  }}
                />
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs='12'>
                    <Row>
                      <Col xs='6'>
                        <span >
                          <Button
                            color="primary"
                            type="button"
                            onClick={handleNewSolicitacao}
                            size="sm">
                            <span className="btn-inner--icon">
                              <i className="ni ni-fat-add" />
                            </span>
                            Nova Solicitação
                          </Button>
                        </span>
                      </Col>
                      <Col xs='6' style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span >
                          <Button
                            disabled={executandoPendente}
                            color="primary"
                            type="button"
                            onClick={handleExecutarPendentes}
                            size="sm">
                            {
                              <Spinner
                                hidden={!executandoPendente}
                                className="mr-2"
                                color="light"
                                size="sm"
                              />
                            }
                            Executar Pendentes
                          </Button>
                        </span>
                      </Col>
                    </Row>
                  </Col>

                  <Col>
                    <Table
                      solicitacoes={solicitacoes || []}
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

export default SolicitacaoIndex;