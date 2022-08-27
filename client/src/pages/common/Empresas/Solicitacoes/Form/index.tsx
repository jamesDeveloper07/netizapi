import React, { useState, useContext, useEffect, useRef } from 'react';
import EmpresaContext from "../../../../../contexts/Empresa";
import api from '../../../../../services/api'
import { AxiosResponse } from 'axios';
import {
  useParams,
  useHistory,
} from "react-router-dom";
import { Solicitacao, ClienteSolicitacao, AcaoServicoSolicitacao } from '../../../../../entities/Common';
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
import Clientes from '../../../Clientes';

export type FormError = {
  cliente?: string,
  acaoServico?: string
}

type Props = {
  tipo?: string
}

const Form: React.FC<Props> = ({ tipo }) => {

  const { id: solicitacao_id } = useParams() as { id?: number }
  const history = useHistory()
  const { empresaSelecionada } = useContext(EmpresaContext)

  const [solicitacao, setSolicitacao] = useState({} as Solicitacao)
  const [clienteSolicitacao, setClienteSolicitacao] = useState({} as ClienteSolicitacao);

  const [acao_servico_id, setAcao_servico_id] = useState<number>();

  const [protocoloExterno, setProtocoloExterno] = useState<string>();
  const [nomeCliente, setNomeCliente] = useState<string>();
  const [documentoCliente, setDocumentoCliente] = useState<string>();
  const [telefoneCliente, setTelefoneCliente] = useState<string>();
  const [externoIdCliente, setExternoIdCliente] = useState<number>();

  const [acoesServicos, setAcoesServicos] = useState<any>([])

  const [alert, setAlert] = useState<any>(undefined)
  const [erros, setErros] = useState<FormError>({} as FormError)
  const [saving, setSaving] = useState(false)

  const [showModalInsertSolicitacao, setShowModalInsertSolicitacao] = useState(false)

  const notificationAlert = useRef<NotificationAlert>(null)


  useEffect(() => {
    if (acoesServicos.length === 0) loadAcoesServicos()
  }, [])

  useEffect(() => {
    if (solicitacao_id) loadSolicitacao()
  }, [solicitacao_id])



  useEffect(() => {

    if (solicitacao && solicitacao.id) {
      clienteSolicitacao.id = solicitacao.cliente_id;
      clienteSolicitacao.nome = solicitacao.cliente?.nome;

      setAcao_servico_id(solicitacao.acao_servico_id);
      setNomeCliente(solicitacao.cliente?.nome);
      setDocumentoCliente(solicitacao.cliente?.documento);
      setTelefoneCliente(solicitacao.cliente?.telefone);
      setProtocoloExterno(solicitacao.protocolo_externo_id);
    }

  }, [solicitacao])

  async function loadAcoesServicos() {
    try {
      const response = await api.get(`/common/acao_servico`,
        {
          params: {
            servico_id: 1
          }
        })
      setAcoesServicos(response.data)
    } catch (error) {
      console.log(error)
      notify('error', 'Não foi possível carregar Serviços')
    }
  }

  async function loadSolicitacao() {
    try {
      // const response = await api.get(`common/empresas/${empresaSelecionada?.id}/termos-uso/${solicitacao_id}`)
      const response = await api.get(`common/solicitacao/${solicitacao_id}`)
      const data = await response.data
      setSolicitacao(data)
    } catch (error) {
      notify('error', 'Não foi possível carregar a Solicitação')
      console.error(error)
    }
  }

  async function loadClienteByDocumento(documento: any) {
    try {
      setNomeCliente('');
      setTelefoneCliente('');
      setExternoIdCliente(0);

      const response = await api.get(`common/findClienteErpByDocumento/${documento}`)
      const data = await response.data
      // setSolicitacao(data)
      console.log("LOAD CLIENTE")
      console.log({ data })

      setNomeCliente(data.client_name);
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
    setTelefoneCliente('');
    setProtocoloExterno('');
    setAcao_servico_id(undefined);
  }

  async function handleSave() {
    setErros({} as FormError)
    setSaving(true)
    if (externoIdCliente && externoIdCliente > 0) {
      if (solicitacao.id) {
        await update()
      } else {
        //await insert()
        setShowModalInsertSolicitacao(true)
      }
    } else {
      notify('danger', 'Cliente não informado!')
      setSaving(false)
    }
    //setSaving(false)
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
    setShowModalInsertSolicitacao(false);
    try {
      const newSolicitacao = bind()
      // const response = await api.post(`common/empresas/${empresaSelecionada?.id}/termos-uso`,
      const response = await api.post(`common/solicitacao`,
        {
          ...newSolicitacao
        })
      const data = await response.data
      setSolicitacao(data)
      afterSave('Solicitação Salva');
    } catch (error) {
      console.error(error)
      notify('danger', 'Não foi possível salvar a Solicitação')
      //@ts-ignore
      throwError(error.response)
    } finally {
      setSaving(false)
    }
  }

  async function update() {
    try {
      const newSolicitacao = bind()
      const response = await api.put(`common/solicitacao/${solicitacao.id}`,
        {
          ...newSolicitacao,
        })
      const data = await response.data
      setSolicitacao(data)
      afterSave('Solicitação Alterada');
    } catch (error) {
      console.error(error)
      notify('danger', 'Não foi possível alterar a Solicitação')
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

  function bind(): Solicitacao {
    const solicitacao = {} as Solicitacao;

    if (clienteSolicitacao && clienteSolicitacao.id && clienteSolicitacao.id > 0) {
      solicitacao.cliente_id = clienteSolicitacao.id;
      solicitacao.cliente = clienteSolicitacao;
    } else {
      var newCliente = {} as ClienteSolicitacao;
      newCliente.nome = nomeCliente;
      newCliente.documento = documentoCliente;
      newCliente.telefone = telefoneCliente;
      newCliente.externo_id = externoIdCliente ? externoIdCliente : 0;
      solicitacao.cliente = newCliente;
    }

    console.log("ACAO SERVIÇO SOLICITAÇÃO")
    console.log({ acaoServicoSolicitacao: acao_servico_id })

    if (acao_servico_id && acao_servico_id > 0) {
      solicitacao.acao_servico_id = acao_servico_id;
    }

    if (!solicitacao.status) {
      solicitacao.status = 'pendente';
    }

    solicitacao.protocolo_externo_id = protocoloExterno;

    return solicitacao;
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

  return (
    <>
      <div className="rna-wrapper">
        <NotificationAlert ref={notificationAlert} />
      </div>
      {alert}

      <Modal
        className="modal-dialog-centered modal-warning"
        size="md"
        isOpen={showModalInsertSolicitacao}
        toggle={() => { setShowModalInsertSolicitacao(false); setSaving(false) }}
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-notification">
            Criar Solicitação
          </h6>
        </div>
        <div className="modal-body">
          <div className="py-3 text-center">
            <i className="fas fa-exclamation-circle ni-3x" />
            <h4 className="heading mt-4"></h4>
            <p>
              Ao criar uma solicitação, ela será adicionada a lista de solicitações pendentes a serem realizadas. Deseja realmente criar esta solicitação?
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <Button
            className="text-white ml-auto"
            color="link"
            data-dismiss="modal"
            type="button"
            onClick={() => { setShowModalInsertSolicitacao(false); setSaving(false) }}
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
            <h1>{solicitacao.id ? 'Alterar Solicitação' : 'Nova Solicitação'}</h1>
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
                    disabled={( (tipo && tipo == 'Edit') || (externoIdCliente && externoIdCliente > 0) )}
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
                    Telefone*
                  </label>
                  <Input
                    placeholder='Telefone...'
                    className="form-control"
                    value={telefoneCliente}
                    onChange={e => setTelefoneCliente(e.target.value)}
                    disabled={true}
                  />
                  <small className="text-danger">
                    {/* {erros.link_url || ""} */}
                  </small>
                </FormGroup>
              </Col>

              <Col sm={12} md={6} lg={6}>
                <FormGroup>
                  <label
                    className="form-control-label">
                    Serviço*
                  </label>
                  <Select2
                    className="form-control"
                    value={acao_servico_id}
                    options={{
                      placeholder: "Selecione um Serviço..."
                    }}
                    // @ts-ignore
                    onSelect={e => setAcao_servico_id(e.target.value)}
                    // @ts-ignore
                    data={acoesServicos.map(item => ({ id: item.id, text: `${item.servico.nome} - ${item.acao.nome}` }))}
                  />
                  <small className="text-danger">
                    {erros.acaoServico || ''}
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