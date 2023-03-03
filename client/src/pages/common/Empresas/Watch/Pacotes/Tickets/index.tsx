import React, { useState, useRef, useContext, useEffect } from 'react';
import EmpresaContext from "../../../../../../contexts/Empresa";
import { AxiosResponse } from 'axios';
import { useHistory, useParams } from "react-router-dom";
import api from "../../../../../../services/api";
//@ts-ignore
import NotificationAlert from "react-notification-alert";
import Filters from './Filters'

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
  Modal, Input
} from "reactstrap";
// core components
import SimpleHeader from '../../../../../../components/Headers/SimpleHeader'
import Pacote from '../../../../../../entities/Common/Watch/Pacote';
import Ticket from '../../../../../../entities/Common/Watch/Ticket';


const TicketsIndex: React.FC = ({ }) => {

  const history = useHistory()
  const { empresaSelecionada } = useContext(EmpresaContext)
  const { codigo } = useParams() as { codigo?: number }
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [pacote, setPacote] = useState({} as Pacote)
  const [tickets, setTickets] = useState(new Array<Ticket>())
  const [title, setTitle] = useState("Tickets")
  const [pageProperties, setPageProperties] = useState({
    total: "0",
    perPage: 10,
    page: 1,
    lastPage: 1,
    loading: false
  })
  const [lastSearch, setLastSearch] = useState({})
  const notificationAlert = useRef<NotificationAlert>(null);

  const [protocoloExterno, setProtocoloExterno] = useState<string>();
  const [newPhone, setNewPhone] = useState<string>();

  const [ticketUpdatePhone, setTicketUpdatePhone] = useState({} as Ticket)
  const [updatingPhone, setUpdatingPhone] = useState(false)
  const [showModalUpdatePhoneTicket, setShowModalUpdatePhoneTicket] = useState(false)

  const [ticketUpdateStatus, setTicketUpdateStatus] = useState({} as Ticket)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showModalUpdateStatusTicket, setShowModalUpdateStatusTicket] = useState(false)

  const [ticketDelete, setTicketDelete] = useState({} as Ticket)
  const [deleting, setDeleting] = useState(false)
  const [showModalDeleteTicket, setShowModalDeleteTicket] = useState(false)

  useEffect(() => {
    if (!pacote || !pacote.Pacote) loadPacote()
  }, [])


  useEffect(() => {
    if (pacote && pacote.Pacote) {
      setTitle(`Tickets - ${pacote.Tipo} (${pacote.Pacote})`);
    } else {
      setTitle('Tickets');
    }
    console.log({ pacote });
  }, [pacote])

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
    history.push(`/admin/watch/pacotes/${codigo}/tickets/new`)
  }

  function handleGoToBack(e: React.MouseEvent) {
    e.preventDefault();
    history.goBack();
  }

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

  async function loadPacote() {
    try {

      const response = await api.get(`/watch/v1/buscarpacote`, {
        params: {
          emp_id: empresaSelecionada?.id,
          pPacote: codigo         
        }
      })

      setPacote(response.data[0])
    } catch (err) {
      //@ts-ignore
      console.log(err.response)
      notify('danger', 'Houve um problema ao carregar o Pacote.');
    }
  }

  async function loadTickets(page = 1,
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
      const response = await api.get(`/watch/v1/buscarticket`, {
        params: {
          page,
          limit,
          sortField,
          sortOrder,
          ...filters,
          emp_id: empresaSelecionada?.id,
          pPacote: codigo
        }
      })

      // console.log('RESPONSE PACOTES');
      // console.log(response.data);      
      setTickets(await response.data)
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
      await loadTickets(
        sortProperties.page == 0 ? 1 : sortProperties.page,
        sortProperties.sizePerPage,
        sortProperties.sortField,
        sortProperties.sortOrder)
    } catch (error) {
      notify('danger', 'Houve um problema ao carregar os Pacotes.');
    }
  }

  function validarNewPhone() {
    var isValido = false;

    if (newPhone) {
      var phone = newPhone.replace(/\D/g, '');

      if (phone.length == 11) {
        var ddd = parseInt(phone.substring(0, 2));
        var prefixo = parseInt(phone.substring(2, 7));
        var sufixo = phone.substring(7, 11);

        console.log('DDD:' + ddd)
        console.log('Pre:' + prefixo)
        console.log('Suf:' + sufixo)

        if (ddd >= 10) {
          if (prefixo > 93999) {
            if (sufixo.length == 4) {
              isValido = true;
            }
          }
        }
      }
    }

    return isValido;
  }

  async function updatePhoneTicket() {
    console.log('Chegou no Index função updatePhoneTicket')
    console.log({ ticketUpdatePhone })
    setUpdatingPhone(true);

    if (!validarNewPhone()) {
      notify('warning', `Telefone inválido.`);
    } else {
      try {
        const response = await api.post(`/watch/v2/atualizartelefone`,
          {
            emp_id: empresaSelecionada?.id,
            pPacote: ticketUpdatePhone.Pacote,
            pTicket: ticketUpdatePhone.Ticket,
            pEmail: ticketUpdatePhone.EmailUsuario,
            IDIntegracaoAssinante: ticketUpdatePhone.IDIntegracaoAssinante,
            protocolo_externo_id: protocoloExterno,
            pPhone: newPhone ? parseInt(newPhone.replace(/\D/g, '')) : 0
          })

        console.log({ response })
        notify('success', response.data.menssage);
        setTicketUpdatePhone({} as Ticket);
        setProtocoloExterno(undefined);
        setNewPhone(undefined);
        setShowModalUpdatePhoneTicket(false)
        loadTickets();

      } catch (error) {
        //@ts-ignore
        console.log(error.response)
        //@ts-ignore
        console.log(error.response.data.menssage)


        //@ts-ignore
        if (error?.response?.data?.menssage) {
          //@ts-ignore
          var msg = error.response.data.menssage;
          msg = msg.split('_').join(' ');
          console.error(msg)
          notify('danger', msg)
        } else {
          notify('danger', `Houve um problema na tentativa de alterar o telefone deste Ticket.`);
        }

      }
    }
    setUpdatingPhone(false);
  }

  async function handleUpdatePhoneTicket(ticket: any) {
    console.log('Chegou no Index função handleUpdatePhoneTicket')
    console.log({ ticket })
    setTicketUpdatePhone(ticket);
    setShowModalUpdatePhoneTicket(true);
  }

  //-------------------

  async function updateStatusTicket() {
    console.log('Chegou no Index função changeStatusTicket')
    console.log({ ticketUpdateStatus })
    setUpdatingStatus(true);

    try {
      const response = await api.post(`/watch/v1/atualizarstatus`,
        {
          emp_id: empresaSelecionada?.id,
          pPacote: ticketUpdateStatus.Pacote,
          pTicket: ticketUpdateStatus.Ticket,
          pEmail: ticketUpdateStatus.EmailUsuario,
          IDIntegracaoAssinante: ticketUpdateStatus.IDIntegracaoAssinante,
          pStatus: !ticketUpdateStatus.Status,
          protocolo_externo_id: protocoloExterno
        })

      console.log({ response })
      notify('success', response.data.menssage);
      setTicketUpdateStatus({} as Ticket);
      setProtocoloExterno(undefined);
      setShowModalUpdateStatusTicket(false)
      loadTickets();

    } catch (err) {
      //@ts-ignore
      console.log(err.response)
      notify('danger', `Houve um problema na tentativa de ${ticketUpdateStatus.Status ? 'Inativar' : 'Ativar'} este Ticket.`);
    }
    setUpdatingStatus(false);
  }

  async function handleUpdateStatusTicket(ticket: any) {
    console.log('Chegou no Index função handleUpdateStatusTicket')
    console.log({ ticket })
    setTicketUpdateStatus(ticket);
    setShowModalUpdateStatusTicket(true);
  }

  //-------------------

  async function deleteTicket() {
    console.log('Chegou no deleteTicket')
    console.log({ ticketDelete })
    setDeleting(true);

    try {
      const response = await api.post(`/watch/v1/deletarticket`,
        {
          emp_id: empresaSelecionada?.id,
          pPacote: ticketDelete.Pacote,
          pTicket: ticketDelete.Ticket,
          pEmail: ticketDelete.EmailUsuario,
          IDIntegracaoAssinante: ticketDelete.IDIntegracaoAssinante,
          pStatus: ticketDelete.Status,
          protocolo_externo_id: protocoloExterno
        })

      console.log({ response })
      notify('success', response.data.menssage);
      setTicketDelete({} as Ticket);
      setProtocoloExterno(undefined);
      setShowModalDeleteTicket(false)
      loadTickets();

    } catch (err) {
      //@ts-ignore
      console.log(err.response)
      notify('danger', `Houve um problema na tentativa de Excluir o Ticket ${ticketUpdateStatus.Ticket}.`);
    }
    setDeleting(false);
  }


  async function handleDeleteTicket(ticket: any) {
    console.log('Chegou no Index função handleDeleteTicket')
    console.log({ ticket })
    setTicketDelete(ticket);
    setShowModalDeleteTicket(true);
  }

  async function maskerPhone(phone: string) {
    var maskaredPhone = ""

    if (phone) {
      var x = phone.replace(/\D/g, '');
      if (x && x != '0') {
        if (x.length > 11) {
          x = x.substring(0, 11)
        }
        x = parseInt(x).toString();

        if (x.length > 7) {
          maskaredPhone = `(${x.substring(0, 2)}) ${x.substring(2, 7)}-${x.substring(7, x.length)}`
        } else {
          if (x.length > 2) {
            maskaredPhone = `(${x.substring(0, 2)}) ${x.substring(2, x.length)}`
          } else {
            maskaredPhone = x;
          }
        }

      }
    }
    setNewPhone(maskaredPhone);
  }

  function fecharModals() {
    setProtocoloExterno(undefined);

    //modal phone
    setNewPhone(undefined);
    setTicketUpdatePhone({} as Ticket);
    setShowModalUpdatePhoneTicket(false);
    setUpdatingPhone(false)

    //modal status
    setTicketUpdateStatus({} as Ticket);
    setShowModalUpdateStatusTicket(false);
    setUpdatingStatus(false)

    //modal delete
    setTicketDelete({} as Ticket);
    setShowModalDeleteTicket(false);
    setDeleting(false)
  }


  return (
    <>
      {alert}
      <div className="rna-wrapper">
        <NotificationAlert ref={notificationAlert} />
      </div>

      <Modal
        className="modal-dialog-centered modal-success"
        size="md"
        isOpen={showModalUpdatePhoneTicket}
      // toggle={() => { fecharModals() }}
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-notification">
            Alterar Telefone do Assinante
          </h6>
        </div>
        <div className="modal-body">
          <div className="py-3 text-center">
            <i className="fas fa-exclamation-circle ni-3x" />
            <h4 className="heading mt-4"></h4>
            <p>
              Deseja realmente alterar o telefone deste assinante? Se sim, digite o protocolo referente a essa ação, o novo telefone e clique em continuar.
            </p>
          </div>
          <Input
            placeholder='Protocolo...'
            className="form-control"
            value={protocoloExterno}
            onChange={e => setProtocoloExterno(e.target.value)}
          />
          <br></br>
          <Input
            placeholder='Telefone...'
            className="form-control"
            value={newPhone}
            onChange={e => maskerPhone(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <Button
            className="text-white ml-auto"
            color="link"
            data-dismiss="modal"
            type="button"
            onClick={() => { fecharModals() }}
          >
            Fechar
          </Button>

          <Button
            disabled={updatingPhone || !ticketUpdatePhone || !protocoloExterno || !newPhone || newPhone.length != 15}
            onClick={updatePhoneTicket}
            className="btn-white"
            color="default"
            type="button">
            Continuar
          </Button>
        </div>
      </Modal>

      <Modal
        className="modal-dialog-centered modal-warning"
        size="md"
        isOpen={showModalUpdateStatusTicket}
      // toggle={() => { fecharModals() }}
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-notification">
            Alterar Status do Ticket
          </h6>
        </div>
        <div className="modal-body">
          <div className="py-3 text-center">
            <i className="fas fa-exclamation-circle ni-3x" />
            <h4 className="heading mt-4"></h4>
            <p>
              Deseja realmente alterar o status deste assinante? Se sim, digite o protocolo referente a essa ação e clique em continuar.
            </p>
          </div>
          <Input
            placeholder='Protocolo...'
            className="form-control"
            value={protocoloExterno}
            onChange={e => setProtocoloExterno(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <Button
            className="text-white ml-auto"
            color="link"
            data-dismiss="modal"
            type="button"
            onClick={() => { fecharModals() }}
          >
            Fechar
          </Button>

          <Button
            disabled={updatingStatus || !ticketUpdateStatus || !protocoloExterno}
            onClick={updateStatusTicket}
            className="btn-white"
            color="default"
            type="button">
            Continuar
          </Button>
        </div>
      </Modal>

      <Modal
        className="modal-dialog-centered modal-danger"
        size="md"
        isOpen={showModalDeleteTicket}
      // toggle={() => { fecharModals() }}
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-notification">
            Excluir Ticket
          </h6>
        </div>
        <div className="modal-body">
          <div className="py-3 text-center">
            <i className="fas fa-exclamation-circle ni-3x" />
            <h4 className="heading mt-4"></h4>
            <p>
              Deseja realmente excluir essa assinatyra? Se sim, digite o protocolo referente a essa ação e clique em continuar.
            </p>
          </div>
          <Input
            placeholder='Protocolo...'
            className="form-control"
            value={protocoloExterno}
            onChange={e => setProtocoloExterno(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <Button
            className="text-white ml-auto"
            color="link"
            data-dismiss="modal"
            type="button"
            onClick={() => { fecharModals() }}
          >
            Fechar
          </Button>

          <Button
            disabled={deleting || !ticketDelete || !protocoloExterno}
            onClick={deleteTicket}
            className="btn-white"
            color="default"
            type="button">
            Continuar
          </Button>
        </div>
      </Modal>


      <SimpleHeader name="Listagem de Tickets" parentName="Tickets" />
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
                  title={<h1>{title}</h1>}
                  data={tickets}
                  notify={notify}
                  load={(filters: object) => {
                    setLastSearch(filters)
                    loadTickets(
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
                            Novo Assinante
                          </Button>
                        </span>
                      </Col>
                      <Col xs='6' style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span >
                          {/* <Button
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
                          </Button> */}
                        </span>
                      </Col>
                    </Row>
                  </Col>

                  <Col xs='12'>
                    <Table
                      pacote={pacote}
                      tickets={tickets || []}
                      notify={notify}
                      onTableChange={handleTableChange}
                      onPhoneChange={handleUpdatePhoneTicket}
                      onStatusChange={handleUpdateStatusTicket}
                      onDeleteTicket={handleDeleteTicket}
                      pageProperties={pageProperties}
                      loading={loading}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <Button
                      className="ml-auto"
                      size="sm"
                      color="primary"
                      data-dismiss="modal"
                      type="button"
                      onClick={() => history.goBack()}
                    >
                      voltar
                    </Button>
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

export default TicketsIndex;