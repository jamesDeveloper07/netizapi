import React, { useState, useRef, useContext } from 'react';
import EmpresaContext from "../../../../contexts/Empresa";
import { AxiosResponse } from 'axios';
import { useHistory } from "react-router-dom";
import api from "../../../../services/api";
//@ts-ignore
import NotificationAlert from "react-notification-alert";
import Filters from './Filters'

import { TermosUso } from '../../../../entities/Common';

import Table from './Table';
import {
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

const TermosUsoIndex: React.FC = ({ }) => {

  const history = useHistory()
  const { empresaSelecionada } = useContext(EmpresaContext)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [termosUso, setTermosUso] = useState(new Array<TermosUso>())
  const [pageProperties, setPageProperties] = useState({
    total: "0",
    perPage: 10,
    page: 1,
    lastPage: 1,
    loading: false
  })
  const [lastSearch, setLastSearch] = useState({})
  const notificationAlert = useRef<NotificationAlert>(null);

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

  function handleNewPolitica(e: React.MouseEvent) {
    e.preventDefault();
    history.push('/admin/termos-uso/new')
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

  async function loadTermosUso(page = 1,
    limit = 10,
    sortField = "nome",
    sortOrder = "asc",
    filters = lastSearch) {
    try {
      setPageProperties({
        ...pageProperties,
        loading: true
      })
      const response = await api.get(`common/empresas/${empresaSelecionada?.id}/termos-uso/`, {
        params: {
          page,
          limit,
          sortField,
          sortOrder,
          ...filters
        }
      })
      setTermosUso(response.data.data)
      await updatePageProperties(response)
    } catch (err) {
      //@ts-ignore
      console.log(err.response)
      notify('danger', 'Houve um problema ao carregar os Termos de Uso.');
    }
  }

  async function handleTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void> {
    try {
      await loadTermosUso(
        sortProperties.page == 0 ? 1 : sortProperties.page,
        sortProperties.sizePerPage,
        sortProperties.sortField,
        sortProperties.sortOrder)
    } catch (error) {
      notify('danger', 'Houve um problema ao carregar os Termos de Uso.');
    }
  }


  return (
    <>
      {alert}
      <div className="rna-wrapper">
        <NotificationAlert ref={notificationAlert} />
      </div>
      <SimpleHeader name="Listagem de Termos de Uso" parentName="Termos de Uso" />
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
                  title={<h1>Termos de Uso</h1>}
                  data={termosUso}
                  notify={notify}
                  load={(filters: object) => {
                    setLastSearch(filters)
                    loadTermosUso(
                      1,
                      10,
                      "nome",
                      "asc",
                      filters)
                  }}
                />
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs='12'>
                    <span >
                      <Button
                        color="primary"
                        type="button"
                        onClick={handleNewPolitica}
                        size="sm">
                        <span className="btn-inner--icon">
                          <i className="ni ni-fat-add" />
                        </span>
                        Novos Termos
                        </Button>
                    </span>
                  </Col>

                  <Col>
                    <Table
                      termosUso={termosUso || []}
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

export default TermosUsoIndex;