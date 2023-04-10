import React, { useState, useRef, useContext } from 'react';
import EmpresaContext from "../../../../contexts/Empresa";
import AuthContext from "../../../../contexts/Auth";
import { AxiosResponse } from 'axios';
import { useHistory } from "react-router-dom";
import api from "../../../../services/api";
//@ts-ignore
import NotificationAlert from "react-notification-alert";
import Filters from './Filters'

import { LogEvento } from '../../../../entities/Common';

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

const LogEventoIndex: React.FC = ({ }) => {

  const history = useHistory()
  const { empresaSelecionada } = useContext(EmpresaContext)
  const { hasPermission, hasRole } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [logs, setLogs] = useState(new Array<LogEvento>())
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
    sortField = "name",
    sortOrder = "asc",
    filters = lastSearch) {
    try {
      setPageProperties({
        ...pageProperties,
        loading: true
      })
      const response = await api.get(`common/log_evento/`, {
        params: {
          page,
          limit,
          sortField,
          sortOrder,
          ...filters,
          emp_id: empresaSelecionada?.id
        }
      })

      setLogs(response.data.data)
      await updatePageProperties(response)
    } catch (err) {
      //@ts-ignore
      console.log(err.response)
      notify('danger', 'Houve um problema ao carregar os Logs de Eventos.');
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
      notify('danger', 'Houve um problema ao carregar os Logs de Eventos.');
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
                  title={<h1>Logs de Evento </h1>}
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
                      <Col xs='12'>
                        <span >
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

export default LogEventoIndex;