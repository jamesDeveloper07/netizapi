import React, { useState, useRef, useContext } from 'react';
import { usePersistedState } from '../../../../hooks'
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

//@ts-ignore
let cancelApi = undefined

const ContratosByEventosIndex: React.FC = ({ }) => {

  const history = useHistory()
  const { empresaSelecionada } = useContext(EmpresaContext)
  const { hasPermission, hasRole } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [contratos, setContratos] = useState(new Array<LogEvento>())

  const [lastSearch, setLastSearch] = usePersistedState('lastSearchContratosByEventos', {})
  const [currentPage, setCurrentPage] = usePersistedState('pageContratosByEventos', 1)
  const [currentPerPage, setCurrentPerPage] = usePersistedState('perPageContratosByEventos', 10)
  const [currentSortField, setCurrentSortField] = usePersistedState('sortFieldContratosByEventos', 'contract_id')
  const [currentSortOrder, setCurrentSortOrder] = usePersistedState('sortOrderContratosByEventos', 'desc')
  const [pageProperties, setPageProperties] = useState({
    total: "0",
    perPage: 10,
    page: 1,
    lastPage: 1,
    loading: false,
    sort: new Map([])
  })

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
      ...pageProperties,
      total,
      perPage,
      page,
      lastPage,
      loading: false,
    })
  }

  async function loadContratos(page = 1,
    limit = 10,
    sortField = "contract_id",
    sortOrder = "desc",
    filters = lastSearch) {

    setLoading(true)
    setCurrentPage(page)
    setCurrentPerPage(limit)
    setCurrentSortField(sortField)
    setCurrentSortOrder(sortOrder)

    try {
      setPageProperties({
        ...pageProperties,
        loading: true
      })
      const response = await api.get(`voalle/getcontratosbyeventos/`, {
        params: {
          page,
          limit,
          sortField,
          sortOrder,
          ...filters,
          emp_id: empresaSelecionada?.id
        }
      })

      setContratos(response.data.data)
      await updatePageProperties(response)
    } catch (err) {
      //@ts-ignore
      console.log(err.response)
      notify('danger', 'Houve um problema ao carregar Contratos.');
    }
  }

  async function handleTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void> {
    try {

      if (type == 'sort') {
        sortProperties.sortField = sortProperties.sortField.replace('__meta__.', '')
        const value = pageProperties.sort.get(sortProperties.sortField)
        const newOrder = (value || 'asc') == 'desc' ? 'asc' : 'desc'
        const map = pageProperties.sort
        map.set(sortProperties.sortField, newOrder)
        sortProperties.sortOrder = newOrder
        setCurrentSortField(sortProperties.sortField)
        setCurrentSortOrder(sortProperties.sortOrder)
      } else if (type == 'pagination') {
        sortProperties.sortField = currentSortField
        sortProperties.sortOrder = currentSortOrder
      }

      //@ts-ignore
      if (cancelApi) {
        try {
          //@ts-ignore
          cancelApi.cancel('Request canceled')
        } catch (error) {
        }
      }

      await loadContratos(
        sortProperties.page == 0 ? 1 : sortProperties.page,
        sortProperties.sizePerPage,
        sortProperties.sortField,
        sortProperties.sortOrder)
    } catch (error) {
      console.log(error);
      notify('danger', 'Houve um problema ao carregar os Contratos TeSTe.');
    }


  }


  return (
    <>
      {alert}
      <div className="rna-wrapper">
        <NotificationAlert ref={notificationAlert} />
      </div>
      <SimpleHeader name="Listagem de Contratos" parentName="Contratos" />
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
                  title={<h1>Contratos com Último Evento</h1>}
                  data={contratos}
                  notify={notify}
                  load={async (filters: object, clearPagination: boolean, clearSort: boolean) => {
                    setLastSearch(filters)
                    loadContratos(
                      clearPagination ? 1 : currentPage,
                      clearPagination ? 10 : currentPerPage,
                      clearSort ? "contract_id" : currentSortField,
                      clearSort ? "desc" : currentSortOrder,
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
                      contratos={contratos || []}
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

export default ContratosByEventosIndex;