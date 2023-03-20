import React, { useState, useRef, useContext } from 'react';
import EmpresaContext from "../../../../contexts/Empresa";
import AuthContext from "../../../../contexts/Auth";
import { AxiosResponse } from 'axios';
import { useHistory } from "react-router-dom";
import api from "../../../../services/api";
//@ts-ignore
import NotificationAlert from "react-notification-alert";
import Filters from './Filters'

import { LogIntegracao } from '../../../../entities/Common';

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

const LogIntegracaoIndex: React.FC = ({ }) => {

  const history = useHistory()
  const { empresaSelecionada } = useContext(EmpresaContext)
  const { hasPermission, hasRole } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [logs, setLogs] = useState(new Array<LogIntegracao>())
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


  async function handleExecutarPendentes(e: React.MouseEvent) {
    e.preventDefault();

    try {
      setExecutandoPendente(true)
      const response = await api.get(`voalle/processareventos`, {
        params: {
          emp_id: empresaSelecionada?.id
        }
      })

      console.log('RESPONSE EXECUTAR SOLICITACOES PENDETES');
      console.log(response.data);

      if (response.data && response.data.length > 0) {
        notify('success', `Integração realizada: ${response.data.length} contratos executados`);
      } else {
        notify('success', `Nenhum Contrato a ser executado no momento.`);
      }

      loadLogs();
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

  async function loadLogs(page = 1,
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
      const response = await api.get(`common/log_integracao/`, {
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

      setLogs(response.data.data)
      await updatePageProperties(response)
    } catch (err) {
      //@ts-ignore
      console.log(err.response)
      notify('danger', 'Houve um problema ao carregar os Logs de Integração.');
    }
  }

  async function handleTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void> {
    try {
      await loadLogs(
        sortProperties.page == 0 ? 1 : sortProperties.page,
        sortProperties.sizePerPage,
        sortProperties.sortField,
        sortProperties.sortOrder)
    } catch (error) {
      notify('danger', 'Houve um problema ao carregar os Logs de Integração.');
    }
  }


  return (
    <>
      {alert}
      <div className="rna-wrapper">
        <NotificationAlert ref={notificationAlert} />
      </div>
      <SimpleHeader name="Listagem de Logs" parentName="Logs" />
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
                  title={<h1>Logs de Integração </h1>}
                  data={logs}
                  notify={notify}
                  load={(filters: object) => {
                    setLastSearch(filters)
                    loadLogs(
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
                        </span>
                      </Col>
                      <Col xs='6' style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span >
                          {hasRole('administrador') &&
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
                              Executar
                            </Button>
                          }

                        </span>
                      </Col>
                    </Row>
                  </Col>

                  <Col>
                    <Table
                      logs={logs || []}
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

export default LogIntegracaoIndex;