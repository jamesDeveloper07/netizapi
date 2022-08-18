import React, { useState, useEffect } from 'react';

import api from "../../../../../services/api";

import Select2 from "react-select2-wrapper";
import {
  Button,
  Row,
  Col,
  InputGroup,
  InputGroupAddon,
  FormGroup,
  Modal,
  Input
} from "reactstrap";

export default ({ notify, empresa, show, hide, loadColaboradores, ...props }) => {

  const [user, setUser] = useState(null)

  const [email, setEmail] = useState(null)
  const [nome, setNome] = useState(null)
  const [situacao, setSituacao] = useState(1)

  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erros, setErros] = useState({})

  const [buscaRealizada, setBuscaRealizada] = useState(false)

  const [alert, setAlert] = useState(null)

  useEffect(() => {
    if (!empresa) {
      console.log('EMPRESA INVÁLIDA')
      notify('danger', 'Empresa inválida')
      setUser(null)
    }

  }, [empresa])

  useEffect(() => {
    if (user) {
      setNome(user.name)
      setEmail(user.email)
      setSituacao(user.status ? 1 : 0)
      setBuscaRealizada(true)
    } else {
      setNome(null)
      setSituacao(1)
      setBuscaRealizada(false)
    }
  }, [user])


  useEffect(() => {
    if (!user) {
      setBuscaRealizada(false)
    }
  }, [email])

  function handleSave() {
    setSaving(true)
    if (user && user.id) {
      confirmAlert(`Deseja realmente adicionar o usuário ${user.name} como colaborador da ${empresa?.nome}?`,
        'warning',
        () => addColaborador(user))
    } else {
      confirmAlert(`Deseja realmente criar o usuário ${nome} e adicioná-lo como colaborador da ${empresa?.nome}?`,
        'warning',
        () => criarAndAdicionar())
    }
    setSaving(false)
  }

  async function criarAndAdicionar() {
    try {
      const response = await api.post('/security/usuarios', {
        name: nome,
        email: email ? email.trim().toLowerCase() : email,
        password: email ? email.trim().toLowerCase() : email,
        status: situacao,
      })
      updateErros(null)
      const newUser = response.data
      setUser(newUser)
      notify('success', 'Usuário adicionado com sucesso')
      addColaborador(newUser)
    } catch (error) {
      console.log(error)
      if (notify) notify('danger', 'Não foi possível salvar usuário')
      updateErros(error.response.data)
    }
  }

  async function addColaborador(user) {
    setSaving(true)
    try {
      if (user && user.id) {
        await api.post(`/common/empresas/${empresa.id}/colaboradores/`, {
          id: user.id
        })
        setUser(null)
        //loadColaboradores()
        notify('success', 'Colaborador adicionado')
        loadColaboradores()
        handleHideModal()
      } else {
        notify('danger', 'Usuário não carregado')
      }
    } catch (error) {
      if (error?.response?.status && error.response.status == 400 && error.response.data.erroSlug) {
        notify('danger', error.response.data.message)
      } else {
        console.log(error)
        notify('danger', 'Não foi possível adicionar colaborador')
      }

    }
    setAlert(null)
    setSaving(false)
  }

  function updateErros(error) {
    if (error) {
      const errors = {}
      for (let e of error) {
        errors[e.field] = e.message
      }
      setErros(errors)
    } else {
      setErros({})
    }
  }


  function confirmAlert(message, alertColor, onConfirm) {
    setAlert(<Modal
      className={`modal-dialog-centered modal-${alertColor}`}
      contentClassName={`bg-gradient-${alertColor}`}
      isOpen={true}
      toggle={() => setAlert(null)}
    >
      <div className="modal-header">
        <h6 className="modal-title" id="modal-title-notification">
          Atenção
        </h6>
        <button
          aria-label="Close"
          className="close"
          data-dismiss="modal"
          type="button"
          onClick={setAlert(false)}
        >
          <span aria-hidden={true}>×</span>
        </button>
      </div>
      <div className="modal-body">
        <div className="py-3 text-center">
          <i className="fas fa-question-circle ni-3x" />
          <br />
          <br />
          <p>
            {message}
          </p>
        </div>
      </div>
      <div className="modal-footer">
        <Button
          className="btn-white"
          color="default"
          type="button"
          onClick={onConfirm}
        >
          Sim
        </Button>
        <Button
          className="text-white ml-auto"
          color="link"
          data-dismiss="modal"
          type="button"
          onClick={() => setAlert(null)}
        >
          Fechar
        </Button>
      </div>
    </Modal>
    )
  }


  function handleHideModal() {
    setUser(null)
    setErros({})
    setNome(null)
    setEmail(null)
    setSituacao(1)
    setBuscaRealizada(false)
    hide()
  }

  async function handleSearchUser() {
    setBuscaRealizada(false)
    try {
      if (email) {
        const response = await api.post(`/security/usuariobyemail`, {
          email: email
        })
        setUser(response.data)
        notify('success', 'Usuário encontrado com sucesso')
      } else {
        notify('danger', 'Email não informado')
      }

    } catch (error) {

      if (error?.response?.status && error.response.status == 400 && error.response.data.erroSlug) {
        if (error.response.data.erroSlug == 'userNotFound') {
          notify('warning', 'Usuário ainda não existe em nossa base. Complete os dados para criá-lo')
        } else {
          notify('warning', error.response.data.message)
        }
        setBuscaRealizada(true)
      } else {
        console.log(error)
        notify('danger', 'Não foi possível buscar o usuário')
        setBuscaRealizada(false)
      }
    }
  }


  return (
    <>
      {alert}
      <Modal
        className="modal-dialog-centered"
        isOpen={show}
        toggle={handleHideModal}
      >
        <div className="modal-header">
          <h5 className="modal-title" id="exampleModalLabel">
            {/* {user.id && empresa?.id ? `Perfis ${user.name}/${empresa.nome}` : ''} */}
            {empresa?.id ? `Adicionar Colaborador` : ''}
          </h5>
          <button
            aria-label="Close"
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={handleHideModal}
          >
            <span aria-hidden={true}>×</span>
          </button>
        </div>

        <div className="modal-body">
          <Row>

            <Col sm="12" md="12" lg="12">
              <FormGroup>
                <legend class="w-auto" style={{ margin: 0 }}>
                  <label
                    className="form-control-label"
                  >
                    Email*
                  </label>
                </legend>
                <InputGroup >
                  <Input
                    disabled={user?.id}
                    className="form-control"
                    placeholder="Email do usuário..."
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <InputGroupAddon addonType="append">
                    <Button
                      disabled={buscaRealizada}
                      color="primary"
                      type="button"
                      outline
                      onClick={handleSearchUser}
                      className="btn-icon btn-3"
                      title='Buscar Usuário'
                    >
                      <span className="btn-inner--icon">
                        <i className="fa fa-search" />
                      </span>
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                <small class="text-muted">
                  {user?.id ? '' : buscaRealizada ? 'Vamos enviar um email para o usuário ativar sua conta.' : ''}
                </small>
                <small class="text-danger">
                  {erros.email ? erros.email : ''}
                </small>
              </FormGroup>
            </Col>

            <Col lg={12} md={12}>
              <FormGroup>
                <label
                  className="form-control-label"
                >
                  Nome*
                </label>
                <Input
                  disabled={user?.id}
                  className="form-control"
                  placeholder="Nome do usuário..."
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                <small class="text-danger">
                  {erros.name ? erros.name : ''}
                </small>
              </FormGroup>
            </Col>

            <Col lg={12} md={12}>
              <FormGroup>
                <label
                  className="form-control-label"
                  htmlFor="example-number-input"
                >
                  Situação*
                </label>

                <Select2
                  disabled={user?.id}
                  onSelect={(e) => { setSituacao(e.target.value) }}
                  options={{
                    placeholder: "Selecione a situação do usuário..."
                  }}
                  value={situacao}
                  data={
                    [{ id: 1, text: 'Ativo' }, { id: 0, text: 'Inativo' }]
                  }
                />
                <small class="text-danger">
                  {erros.status ? erros.status : ''}
                </small>
              </FormGroup>
            </Col>
          </Row>
        </div>
        <div className="modal-footer">
          <Row>
            <Col>
              <div className="float-right ">
                <Button
                  className="ml-auto"
                  color="link"
                  data-dismiss="modal"
                  type="button"
                  onClick={handleHideModal}
                >
                  Fechar
                </Button>
                <Button
                  disabled={saving || !buscaRealizada}
                  color="primary"
                  onClick={handleSave}
                >
                  {user?.id ? 'Adicionar' : 'Criar e Adicionar'}
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
}
