import React, { useState, useRef, useContext } from 'react';
import { usePersistedState } from '../../../hooks'
import EmpresaContext from "../../../contexts/Empresa";
import { AxiosResponse } from 'axios';
import { useHistory } from "react-router-dom";
import api from "../../../services/api";
//@ts-ignore
import NotificationAlert from "react-notification-alert";
import Filters from './Filters'

import { Notificacao } from '../../../entities/Security';

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
import SimpleHeader from '../../../components/Headers/SimpleHeader'
//@ts-ignore
let cancelApi = undefined

const Notificacoes: React.FC = ({ }) => {

  const history = useHistory()
  const { empresaSelecionada } = useContext(EmpresaContext)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [notificacoes, setNotificacoes] = useState(new Array<Notificacao>())

  const [lastSearch, setLastSearch] = usePersistedState('lastSearchNotificacao', {})
  const [currentPage, setCurrentPage] = usePersistedState('page', 1)
  const [currentPerPage, setCurrentPerPage] = usePersistedState('perPage', 10)
  const [currentSortField, setCurrentSortField] = usePersistedState('sortFieldNotificacao', 'sended_at')
  const [currentSortOrder, setCurrentSortOrder] = usePersistedState('sortOrderNotificacao', 'desc')
  const [pageProperties, setPageProperties] = useState({
    total: "0",
    perPage: currentPerPage,
    page: currentPage,
    lastPage: 1,
    loading: false,
    sort: new Map([])
  })


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

  async function loadNotificacoes(page = 1,
    limit = 10,
    sortField = "sended_at",
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
      const response = await api.get(`/security/notificacoes/getByVarious`, {
        params: {
          page,
          limit,
          sortField,
          sortOrder,
          ...filters
        }
      })
      setNotificacoes(response.data.data)
      await updatePageProperties(response)
    } catch (err) {
      //@ts-ignore
      console.log(err.response)
      notify('danger', 'Houve um problema ao carregar as Notificações.');
    }
    setLoading(false)
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

      await loadNotificacoes(
        sortProperties.page == 0 ? 1 : sortProperties.page,
        sortProperties.sizePerPage,
        sortProperties.sortField,
        sortProperties.sortOrder)
    } catch (error) {
      notify('danger', 'Houve um problema ao carregar as Notificações.');
    }
  }

  async function reload() {
    loadNotificacoes(
      currentPage ? currentPage : 1,
      currentPerPage ? currentPerPage : 10,
      currentSortField ? currentSortField: "sended_at",
      currentSortOrder ? currentSortOrder : "desc",
      lastSearch)
  }

  return (
    <>
      {alert}
      <div className="rna-wrapper">
        <NotificationAlert ref={notificationAlert} />
      </div>
      <SimpleHeader name="Listagem de Notificações" parentName="Notificações" />
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
                  title={<h1>Notificações</h1>}
                  data={notificacoes}
                  notify={notify}
                  load={async (filters: object, clearPagination: boolean, clearSort: boolean) => {
                    setLastSearch(filters)
                    loadNotificacoes(
                      clearPagination ? 1 : currentPage,
                      clearPagination ? 10 : currentPerPage,
                      clearSort ? "sended_at" : currentSortField,
                      clearSort ? "desc" : currentSortOrder,
                      filters)
                  }}
                />
              </CardHeader>
              <CardBody>
                <Row>
                  <Col>
                    <Table
                      notificacoes={notificacoes || []}
                      notify={notify}
                      onTableChange={handleTableChange}
                      pageProperties={pageProperties}
                      loading={loading}
                      reload={reload}
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

export default Notificacoes;