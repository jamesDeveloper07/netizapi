import React, { useState, useContext, useEffect, useRef } from 'react';
import EmpresaContext from "../../../../../contexts/Empresa";
import api from '../../../../../services/api'
import { AxiosResponse } from 'axios';
import {
  useParams,
  useHistory,
} from "react-router-dom";
import { TermosUso } from '../../../../../entities/Common';
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

export type FormError = {
  nome?: string,
  descricao?: string,
  versao?: string,
  link_url?: string,
  data_inicio_vigencia: Date,
  data_fim_vigencia: Date
}

const Form: React.FC = ({ }) => {

  const { id: termos_uso_id } = useParams() as { id?: number }
  const history = useHistory()
  const { empresaSelecionada } = useContext(EmpresaContext)

  const [termosUso, setTermosUso] = useState({} as TermosUso)
  const [nome, setNome] = useState<string>('')
  const [descricao, setDescricao] = useState<string>('')
  const [versao, setVersao] = useState<string>('')
  const [link_url, setLink_url] = useState<string>('')
  const [dataInicioVigencia, setDataInicioVigencia] = useState<any>()
  const [dataFimVigencia, setDataFimVigencia] = useState<any>()

  const [alert, setAlert] = useState<any>(undefined)
  const [erros, setErros] = useState<FormError>({} as FormError)
  const [saving, setSaving] = useState(false)

  const [showModalInsertTermosUso, setShowModalInsertTermosUso] = useState(false)

  const notificationAlert = useRef<NotificationAlert>(null)

  useEffect(() => {
    if (termos_uso_id) loadTermosUso()
  }, [termos_uso_id])

  useEffect(() => {
    setNome(termosUso.nome)
    setDescricao(termosUso.descricao)
    setVersao(termosUso.versao)
    setLink_url(termosUso.link_url)
    setDataInicioVigencia(termosUso.data_inicio_vigencia ? new Date(termosUso.data_inicio_vigencia) : new Date())
    setDataFimVigencia(termosUso.data_fim_vigencia ? new Date(termosUso.data_fim_vigencia) : null)
  }, [termosUso])

  async function loadTermosUso() {
    try {
      const response = await api.get(`common/empresas/${empresaSelecionada?.id}/termos-uso/${termos_uso_id}`)
      const data = await response.data
      setTermosUso(data)
    } catch (error) {
      notify('error', 'Não foi possível carregar Termos de Uso')
      console.error(error)
    }
  }

  async function handleSave() {
    setErros({} as FormError)
    setSaving(true)
    if (termosUso.id) {
      await update()
    } else {
      //await insert()
      setShowModalInsertTermosUso(true)
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
    setShowModalInsertTermosUso(false);
    try {
      const newTermo = bind()
      const response = await api.post(`common/empresas/${empresaSelecionada?.id}/termos-uso`,
        {
          ...newTermo
        })
      const data = await response.data
      setTermosUso(data)
      afterSave('Termos de Uso Salvos');
    } catch (error) {
      console.error(error)
      notify('danger', 'Não foi possível salvar Termos de Uso')
      //@ts-ignore
      throwError(error.response)
    } finally {
      setSaving(false)
    }
  }

  async function update() {
    try {
      const newTermos = bind()
      const response = await api.put(`common/empresas/${empresaSelecionada?.id}/termos-uso/${termosUso.id}`,
        {
          ...newTermos,
        })
      const data = await response.data
      setTermosUso(data)
      afterSave('Termos de Uso Alterados');
    } catch (error) {
      console.error(error)
      notify('danger', 'Não foi possível alterar Termos de Uso')
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

  function bind(): TermosUso {
    const termos = {} as TermosUso;

    termos.nome = nome;
    termos.descricao = descricao;
    termos.versao = versao;
    termos.link_url = link_url;
    termos.data_inicio_vigencia = dataInicioVigencia as Date;
    termos.data_fim_vigencia = dataFimVigencia as Date;
    
    return termos;
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
        className="modal-dialog-centered modal-danger"
        size="md"
        isOpen={showModalInsertTermosUso}
        toggle={() => { setShowModalInsertTermosUso(false); setSaving(false) }}
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-notification">
            Criar Termos de Uso
          </h6>
        </div>
        <div className="modal-body">
          <div className="py-3 text-center">
            <i className="fas fa-exclamation-circle ni-3x" />
            <h4 className="heading mt-4"></h4>
            <p>
              Ao criar uma nova versão de termos de uso, os termos atualmente em vigência serão finalizados, dando lugar a esta nova versão. Deseja realmente criar esta nova versão?
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <Button
            className="text-white ml-auto"
            color="link"
            data-dismiss="modal"
            type="button"
            onClick={() => { setShowModalInsertTermosUso(false); setSaving(false) }}
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
            <h1>{termosUso.id ? 'Alterar Termos de Uso' : 'Novos Termos de Uso'}</h1>
          </CardHeader>
          <CardBody>
            <Row>
              <Col sm={12} md={6} lg={6}
              >
                <FormGroup>
                  <label className="form-control-label" >
                    Nome*
                  </label>
                  <Input
                    placeholder='Nome...'
                    className="form-control"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                  />
                  <small className="text-danger">
                    {erros.nome || ""}
                  </small>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col sm={12} md={6} lg={6}
              >
                <FormGroup>
                  <label className="form-control-label" >
                    Versão*
                  </label>
                  <Input
                    placeholder='Versão...'
                    className="form-control"
                    value={versao}
                    onChange={e => setVersao(e.target.value)}
                  />
                  <small className="text-danger">
                    {erros.versao || ""}
                  </small>
                </FormGroup>
              </Col>
              <Col sm={12} md={6} lg={6}
              >
                <FormGroup>
                  <label className="form-control-label" >
                    Link Url*
                  </label>
                  <Input
                    placeholder='Link Url...'
                    className="form-control"
                    value={link_url}
                    onChange={e => setLink_url(e.target.value)}
                  />
                  <small className="text-danger">
                    {erros.link_url || ""}
                  </small>
                </FormGroup>
              </Col>
            </Row>


            <Row>
              <Col sm={12} md={6} lg={6}>
                <FormGroup>
                  <label
                    className="form-control-label"
                  >
                    Data Início Vigência*
                  </label>
                  <ReactDatetime
                    inputProps={{
                      placeholder: "Selecione data início de vigência...",
                      disabled: true
                    }}
                    value={dataInicioVigencia}
                    dateFormat="DD/MM/YYYY"
                    timeFormat='HH:mm'
                    renderDay={(props, currentDate, selectedDate) => {
                      let classes = props.className;
                      if (
                        dataInicioVigencia &&
                        dataFimVigencia &&
                        dataInicioVigencia._d + "" === currentDate._d + ""
                      ) {
                        classes += " start-date";
                      } else if (
                        dataInicioVigencia &&
                        dataFimVigencia &&
                        new Date(dataInicioVigencia._d + "") <
                        new Date(currentDate._d + "") &&
                        new Date(dataFimVigencia._d + "") >
                        new Date(currentDate._d + "")
                      ) {
                        classes += " middle-date";
                      } else if (
                        dataFimVigencia &&
                        dataFimVigencia._d + "" === currentDate._d + ""
                      ) {
                        classes += " end-date";
                      }
                      return (
                        <td {...props} className={classes}>
                          {currentDate.date()}
                        </td>
                      );
                    }}
                    onChange={e => setDataInicioVigencia(e)}
                  />
                  {/* @ts-ignore */}
                  <small class="text-danger">
                    {erros.data_inicio_vigencia || ''}
                  </small>
                </FormGroup>
              </Col>
              {(termosUso && termosUso.id > 0 && termosUso.data_fim_vigencia) &&
                <Col sm={12} md={6} lg={6}>
                  <FormGroup>
                    <label
                      className="form-control-label"
                    >
                      Data Fim Vigência*
                    </label>
                    <ReactDatetime
                      inputProps={{
                        placeholder: "Selecione a data fim da vigência...",
                        disabled: true
                      }}
                      value={dataFimVigencia}
                      dateFormat="DD/MM/YYYY"
                      timeFormat='HH:mm'
                      renderDay={(props, currentDate, selectedDate) => {
                        let classes = props.className;
                        if (
                          dataInicioVigencia &&
                          dataFimVigencia &&
                          dataInicioVigencia._d + "" === currentDate._d + ""
                        ) {
                          classes += " start-date";
                        } else if (
                          dataInicioVigencia &&
                          dataFimVigencia &&
                          new Date(dataInicioVigencia._d + "") <
                          new Date(currentDate._d + "") &&
                          new Date(dataFimVigencia._d + "") >
                          new Date(currentDate._d + "")
                        ) {
                          classes += " middle-date";
                        } else if (
                          dataFimVigencia &&
                          dataFimVigencia._d + "" === currentDate._d + ""
                        ) {
                          classes += " end-date";
                        }
                        return (
                          <td {...props} className={classes}>
                            {currentDate.date()}
                          </td>
                        );
                      }}
                      onChange={e => setDataFimVigencia(e)}
                    />
                    {/* @ts-ignore */}
                    <small class="text-danger">
                      {erros.data_fim_vigencia || ''}
                    </small>
                  </FormGroup>
                </Col>
              }
            </Row>

            <Row>
              <Col>
                <FormGroup>
                  <label
                    className="form-control-label"
                  >
                    Descrição*
                  </label>
                  <ReactQuill
                    theme="snow"
                    modules={{
                      toolbar: [
                        ["bold", "italic"],
                        ["link", "blockquote"],
                        [
                          {
                            list: "ordered"
                          },
                          {
                            list: "bullet"
                          }
                        ]
                      ]
                    }}
                    value={descricao || ''}
                    onChange={e => setDescricao(e)}
                  />
                  {/* @ts-ignore */}
                  <small class="text-danger">
                    {erros.descricao || ''}
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
                  <Button
                    disabled={saving || (termosUso && termosUso.id > 0 && termosUso.data_fim_vigencia != null)}
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