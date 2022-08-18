import React, { useState, useEffect } from 'react';

import api from "../../../../services/api";

import Select2 from "react-select2-wrapper";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import {
  Button,
  Row,
  Col,
  InputGroup,
  InputGroupAddon,
  FormGroup,
  Modal
} from "reactstrap";

export default ({ notify, user, ...props }) => {

  const [perfis, setPerfis] = useState([])
  const [perfil, setPerfil] = useState(null)
  const [alert, setAlert] = useState(null)

  const [allPerfis, setAllPerfis] = useState([])

  const [columns] = useState([
    {
      dataField: 'acoes',
      formatter: (cell, row) => acoesFormatter(cell, row)
    },
    {
      dataField: 'name',
      text: 'Nome',
      sort: true
    },
    {
      dataField: 'description',
      text: 'Descrição',
      sort: true
    },
  ])

  useEffect(() => {
    if (perfis.length === 0) loadPerfis()
    if (allPerfis.length === 0) loadAllPerfis()
  }, [user])

  const perfisNaoSelecionados = () => {
    //Remove do combo as empresas já adicionadas
    const ids = perfis.map((item) => item.id)
    const filters = allPerfis.filter((item) => !ids.includes(item.id))
    return filters
  }

  async function loadAllPerfis() {
    try {
      const response = await api.get(`/security/perfis/?limit=120`)
      if (await response.data) {
        setAllPerfis(await response.data.data)
      }
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível carregar combo de perfis')
    }
  }

  async function removePerfil(perfilId) {
    try {
      await api.delete(`/security/usuarios/${user.id}/perfis/${perfilId}`)
      loadPerfis()
      notify('success', 'Perfil removido')
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível remover perfil')
    }
    setAlert(null)
  }

  function handleRemoverPerfil(perfil) {
    confirmAlert(`Deseja realmente remover o perfil ${perfil.name} do usuário ${user.name}?`,
      'danger',
      () => removePerfil(perfil.id))
  }

  function handleAddPerfil() {
    if (!perfil) {
      return
    }
    confirmAlert(`Deseja realmente adicionar este perfil ao usuário ${user.name}?`,
      'warning',
      () => addPerfil())
  }

  async function addPerfil() {
    try {
      await api.post(`/security/usuarios/${user.id}/perfis/`, {
        id: perfil
      })
      loadPerfis()
      setPerfil(null)
      notify('success', 'Perfil adicionada')
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível adicionar perfil')
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


  function acoesFormatter(cell, row) {
    return (<>
      <div class="btn-group" role="group" aria-label="Basic example">
        <Button
          className="btn-sm"
          color="danger"
          onClick={() => handleRemoverPerfil(row)}
          outline>
          <i class="fas fa-times"></i>
        </Button>
      </div>
    </>)
  }


  async function loadPerfis() {
    try {
      const response = await api.get(`/security/usuarios/${user.id}/perfis?`)
      if (response.data) {
        setPerfis(response.data)
      }
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível carregar os perfis')
    }
  }


  return (
    <>
      {alert}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
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
                    width: '400px'
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
                    <span className="btn-inner--text">Adicionar perfil</span>
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </FormGroup>
          </Col>
        </Row>


      </div>
      <Row>
        <Col>
          <ToolkitProvider
            data={perfis}
            keyField="name"
            columns={columns}
            search
          >
            {props => (
              <div className="py-4">
                <BootstrapTable
                  {...props.baseProps}
                  bootstrap4={true}
                  bordered={false}
                />
              </div>
            )}
          </ToolkitProvider>
        </Col>
      </Row>
    </>
  );
}
