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
  Modal
} from "reactstrap";

import Table from './Table';

export default ({ notify, user, empresa, show, hide, naoMostrarInvisiveis, loadColaboradores, loadEmpresas, ...props }) => {

  const [perfis, setPerfis] = useState([])
  const [perfil, setPerfil] = useState(null)
  const [alert, setAlert] = useState(null)

  const [allPerfis, setAllPerfis] = useState([])

  useEffect(() => {
    // console.log('USE EFFECT EMPRESA EM PERFIS')

    if (user) {
      if (empresa) {
        // console.log('LOAD PERFIS e ALL PERFIS ')
        if (perfis.length === 0) loadPerfis()
        if (allPerfis.length === 0) loadAllPerfis()
      } else {
        // console.log('EMPRESA INVALIDA')
        setPerfis([])
        setAllPerfis([])
        setPerfil(null)
      }
    } else {
      // console.log('USUARIO INVALIDO')
      setPerfis([])
      setAllPerfis([])
      setPerfil(null)
      //notify('danger', 'Não foi possível carregar combo de perfisUsuarioEmpresa (Usuário não carregado)')
    }
  }, [empresa, user])

  const perfisNaoSelecionados = () => {
    //Remove do combo as empresas já adicionadas
    if (perfis && perfis.length > 0) {
      const ids = perfis?.map((item) => item.id)
      if (allPerfis && allPerfis.length > 0) {
        const filters = allPerfis?.filter((item) => !ids.includes(item.id))
        return filters
      } else {
        return []
      }
    } else {
      if (allPerfis && allPerfis.length > 0) {
        return allPerfis
      } else {
        return []
      }
    }
  }

  async function loadAllPerfis() {
    try {
      const response = await api.get(`/security/perfis/?limit=120&naoMostrarInvisiveis=${naoMostrarInvisiveis ? 'true' : 'false'}`)
      if (await response.data) {
        setAllPerfis(await response.data.data)
      }
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível carregar combo de perfis')
    }
  }

  function handleAddPerfil() {
    if (!perfil) {
      return
    }

    console.log('handleAddPerfil')
    console.log({ perfil })
    console.log({ empresa })

    confirmAlert(`Deseja realmente adicionar este perfil ao usuário ${user?.name}?`,
      'warning',
      () => addPerfil())
  }

  async function addPerfil() {
    try {
      await api.post(`/security/usuarios/${user?.id}/empresas/${empresa?.id}/perfis/`, {
        id: perfil
      })
      loadPerfis()
      setPerfil(null)
      notify('success', 'Perfil Usuário/Empresa adicionada')
      if (loadColaboradores) {
        loadColaboradores()
      }
      if (loadEmpresas) {
        loadEmpresas()
      }
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível adicionar Perfil Usuário/Empresa')
    }
    setAlert(null)
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


  async function loadPerfis() {
    try {
      const response = await api.get(`/security/usuarios/${user?.id}/empresas/${empresa?.id}/perfis?`)
      if (response.data) {
        const perfis = response.data
        setPerfis(perfis)
      }
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível carregar os perfisUsuárioEmpresa')
    }
  }

  function handleHideModal() {
    setPerfil(null)
    setPerfis([])
    setAllPerfis([])
    hide()
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
            {user?.id && empresa?.id ? `Editar Perfis Usuário/Empresa` : ''}
          </h5>
          <button
            aria-label="Close"
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={hide}
          >
            <span aria-hidden={true}>×</span>
          </button>
        </div>

        <div className="modal-body">
          <Row>
            <Col lg={12} md={12}>
              <FormGroup>
                <label
                  className="form-control-label"
                  htmlFor="example-number-input"
                >
                  Perfil
                </label>
                <InputGroup className="mb-3">
                  <div
                    style={{
                      width: '300px'
                    }}
                  >
                    <Select2
                      className="form-control"
                      onSelect={(e) => setPerfil(e.target.value)}
                      options={{
                        placeholder: "Selecione uma perfil..."
                      }}
                      value={perfil}
                      data={perfisNaoSelecionados().map((item) => ({ id: item.id, text: item.name }))}
                    />
                  </div>
                  <InputGroupAddon addonType="append">
                    <Button
                      color="primary"
                      type="button"
                      outline
                      onClick={handleAddPerfil}
                      className="btn-icon btn-3"
                    >
                      <span className="btn-inner--icon">
                        <i className="ni ni-fat-add"></i>
                      </span>
                      <span className="btn-inner--text">Adicionar</span>
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col lg={12} md={12}>
              <Table
                perfis={perfis ? perfis : []}
                empresa={empresa}
                user={user}
                loadPerfis={loadPerfis}
                confirmAlert={confirmAlert}
                setAlert={setAlert}
                notify={notify}
                history={props.history}
                loadColaboradores={loadColaboradores}
                loadEmpresas={loadEmpresas}
              />
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
}
