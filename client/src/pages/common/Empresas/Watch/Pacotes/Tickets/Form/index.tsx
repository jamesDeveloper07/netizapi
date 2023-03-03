import React, { useState, useContext, useEffect, useRef } from 'react';
import EmpresaContext from "../../../../../../../contexts/Empresa";
import api from '../../../../../../../services/api'
import { AxiosResponse } from 'axios';
import {
  useParams,
  useHistory,
} from "react-router-dom";
import { Solicitacao, ClienteSolicitacao, AcaoServicoSolicitacao } from '../../../../../../../entities/Common';
import { } from './styles';
//@ts-ignore
import Select2 from "react-select2-wrapper";
import ReactDatetime from "react-datetime";
import ReactQuill from "react-quill";
//@ts-ignore
import NotificationAlert from "react-notification-alert";
//@ts-ignore
import ReactBSAlert from "react-bootstrap-sweetalert";
import {
  Spinner,
  Container,
  Card,
  CardBody,
  Col,
  Row,
  FormGroup,
  Input,
  CardHeader,
  Button,
  Modal
} from "reactstrap";
import { string } from 'prop-types';
import Clientes from '../../../../../Clientes';

export type FormError = {
  cliente?: string,
  acaoServico?: string
}

type Props = {
  tipo?: string
}

const Form: React.FC<Props> = ({ tipo }) => {

  const { codigo } = useParams() as { codigo?: number }
  const history = useHistory()
  const { empresaSelecionada } = useContext(EmpresaContext)

  const [solicitacao, setSolicitacao] = useState({} as Solicitacao)

  const [acao_servico_id, setAcao_servico_id] = useState<number>();

  const [protocoloExterno, setProtocoloExterno] = useState<string>();
  const [nomeCliente, setNomeCliente] = useState<string>();
  const [documentoCliente, setDocumentoCliente] = useState<string>();
  const [emailCliente, setEmailCliente] = useState<string>();
  const [telefoneCliente, setTelefoneCliente] = useState<string>();
  const [externoIdCliente, setExternoIdCliente] = useState<number>();

  // const [acoesServicos, setAcoesServicos] = useState<any>([])

  const [alert, setAlert] = useState<any>(undefined)
  const [erros, setErros] = useState<FormError>({} as FormError)
  const [saving, setSaving] = useState(false)

  const [showModalInsertTicket, setShowModalInsertTicket] = useState(false)

  const notificationAlert = useRef<NotificationAlert>(null)

  async function loadClienteByDocumento(documento: any) {
    try {
      setNomeCliente('');
      setEmailCliente('');
      setTelefoneCliente('');
      setExternoIdCliente(0);

      const response = await api.get(`common/findClienteErpByDocumento/${documento}`)
      const data = await response.data
      // setSolicitacao(data)
      console.log("LOAD CLIENTE")
      console.log({ data })

      setNomeCliente(data.client_name);
      setEmailCliente(data.client_email);
      setTelefoneCliente(data.client_cell_phone);
      setExternoIdCliente(data.client_id)

    } catch (error) {
      //@ts-ignore
      if (error && error.response && error.response.status == 400) {
        //@ts-ignore
        console.log(error.response.data);
        //@ts-ignore
        notify('danger', error.response.data)
      } else {
        notify('error', 'Não foi possível carregar o Cliente')
        console.error(error)
      }
    }
  }

  async function limparDados() {
    setExternoIdCliente(0);
    setDocumentoCliente('');
    setNomeCliente('');
    setEmailCliente('');
    setTelefoneCliente('');
    setProtocoloExterno('');
  }

  async function handleSave() {
    setErros({} as FormError)
    setSaving(true)
    if (externoIdCliente && externoIdCliente > 0) {
      setShowModalInsertTicket(true)
    } else {
      notify('danger', 'Cliente não informado!')
      setSaving(false)
    }
  }

  function afterSave(msg: string) {
    setAlert(
      <ReactBSAlert
        success
        style={{ display: "block", marginTop: "-100px", maxWidth: "500px" }}
        title={msg}
        onConfirm={() => history.goBack()}
        confirmBtnBsStyle="success"
        showConfirm={false}
        btnSize=""
      />
    );
    setTimeout(history.goBack, 2000);
  };

  async function insert() {
    setShowModalInsertTicket(false);
    try {
      const response = await api.post(`/watch/v2/inserirticketnew`,
        {
          pPacote: codigo,
          pName: nomeCliente,
          documento: documentoCliente,
          pEmail: emailCliente,
          pPhone: telefoneCliente,
          cliente_erp_id: externoIdCliente ? externoIdCliente : 0,
          protocolo_externo_id: protocoloExterno
        })
      const data = await response.data
      // setSolicitacao(data)
      afterSave('Assinante cadastrado com sucesso!');
    } catch (error) {
      console.error(error)
      //@ts-ignore
      if (error?.response?.data?.message) {
        //@ts-ignore
        var msg = error.response.data.message;
        msg = msg.split('_').join(' ');
        console.error(msg)
        notify('danger', msg)
      } else {
        notify('danger', 'Não foi possível cadastrar este(a) Assinante')
      }
      //@ts-ignore
      throwError(error.response)
    } finally {
      setSaving(false)
    }
  }



  function throwError(response: AxiosResponse) {
    if (response && response.status == 400) {
      if (response.data.length) {
        const responseError = {} as FormError
        for (let e of response.data) {
          //@ts-ignore
          responseError[e.field] = e.message
        }
        setErros(responseError)
      }
    }
  }


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
      autoDismiss: 3
    };
    notificationAlert?.current?.notificationAlert(options);
  };

  function validarTelefone(phone: string){
    
  }
  
  return (
    <>
      <div className="rna-wrapper">
        <NotificationAlert ref={notificationAlert} />
      </div>
      {alert}

      <Modal
        className="modal-dialog-centered modal-warning"
        size="md"
        isOpen={showModalInsertTicket}
        toggle={() => { setShowModalInsertTicket(false); setSaving(false) }}
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-notification">
            Cadastrar Assinante
          </h6>
        </div>
        <div className="modal-body">
          <div className="py-3 text-center">
            <i className="fas fa-exclamation-circle ni-3x" />
            <h4 className="heading mt-4"></h4>
            <p>
              Ao cadastrar este cliente como assinante, ele será adicionado a lista de tickets ativos para este pacote. Deseja realmente cadastrar este cliente como assinante?
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <Button
            className="text-white ml-auto"
            color="link"
            data-dismiss="modal"
            type="button"
            onClick={() => { setShowModalInsertTicket(false); setSaving(false) }}
          >
            Fechar
          </Button>

          <Button
            onClick={insert}
            className="btn-white"
            color="default"
            type="button">
            Salvar
          </Button>
        </div>
      </Modal>


      <Container
        className='mt--6'
        fluid
      >
        <Card>
          <CardHeader
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}>
            <h1>Novo Assinante</h1>
          </CardHeader>
          <CardBody>

            <Row>

              <Col sm={12} md={6} lg={6}>
                <FormGroup>
                  <label className="form-control-label" >
                    CPF/CNPJ Cliente*
                  </label>
                  <Input
                    placeholder='Documento...'
                    className="form-control"
                    value={documentoCliente}
                    onChange={e => setDocumentoCliente(e.target.value)}
                    onBlur={e => loadClienteByDocumento(e.target.value)}
                    //@ts-ignore
                    disabled={((tipo && tipo == 'Edit') || (externoIdCliente && externoIdCliente > 0))}
                  />
                  <small className="text-danger">
                    {/* {erros.versao || ""} */}
                  </small>
                </FormGroup>
              </Col>

              <Col sm={12} md={6} lg={6}>
                <FormGroup>
                  <label className="form-control-label" >
                    Nome Cliente*
                  </label>
                  <Input
                    placeholder='Nome...'
                    className="form-control"
                    value={nomeCliente}
                    onChange={e => setNomeCliente(e.target.value)}
                    disabled={true}
                  />
                  <small className="text-danger">
                    {erros.cliente || ""}
                  </small>
                </FormGroup>
              </Col>

            </Row>

            <Row>

              <Col sm={12} md={6} lg={6}>
                <FormGroup>
                  <label className="form-control-label" >
                    E-mail*
                  </label>
                  <Input
                    placeholder='E-mail...'
                    className="form-control"
                    value={emailCliente}
                    onChange={e => setEmailCliente(e.target.value)}
                    disabled={true}
                  />
                  <small className="text-danger">
                    {/* {erros.link_url || ""} */}
                  </small>
                </FormGroup>
              </Col>

              <Col sm={12} md={6} lg={6}>
                <FormGroup>
                  <label className="form-control-label" >
                    Telefone*
                  </label>
                  <Input
                    placeholder='Telefone...'
                    className="form-control"
                    
                    value={telefoneCliente}
                    onBlur={e => validarTelefone(e.target.value)}
                    onChange={e => setTelefoneCliente(e.target.value)}
                    disabled={true}
                  />
                  <small className="text-danger">
                    {/* {erros.link_url || ""} */}
                  </small>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col sm={12} md={6} lg={6}
              >
                <FormGroup>
                  <label className="form-control-label" >
                    Protocolo Externo
                  </label>
                  <Input
                    placeholder='Protocolo Externo...'
                    className="form-control"
                    value={protocoloExterno}
                    onChange={e => setProtocoloExterno(e.target.value)}
                  />
                  <small className="text-danger">
                    {/* {erros.link_url || ""} */}
                  </small>
                </FormGroup>
              </Col>

            </Row>


            <Row>
              <Col>
                <div className="float-right ">
                  <Button
                    className="ml-auto"
                    color="link"
                    data-dismiss="modal"
                    type="button"
                    onClick={() => history.goBack()}
                  >
                    voltar
                  </Button>
                  {tipo && tipo == 'New' &&
                    <Button
                      className="ml-auto"
                      color="link"
                      data-dismiss="modal"
                      type="button"
                      onClick={() => limparDados()}
                    >
                      limpar
                    </Button>
                  }
                  <Button
                    disabled={saving || (!externoIdCliente || externoIdCliente <= 0) || (solicitacao && solicitacao.id > 0)}
                    color="primary"
                    onClick={handleSave}
                  >
                    {
                      <Spinner
                        hidden={!saving}
                        className="mr-2"
                        color="light"
                        size="sm"
                      />
                    }
                    Salvar
                  </Button>

                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container >
    </>
  )
}

export default Form;