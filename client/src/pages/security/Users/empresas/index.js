import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../../contexts/Auth'

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
  Modal,
  Badge
} from "reactstrap";

import Perfis from "./perfis";

export default ({ notify, user, ...props }) => {

  const authData = useContext(AuthContext)
  const [empresas, setEmpresas] = useState([])
  const [empresa, setEmpresa] = useState(null)
  const [alert, setAlert] = useState(null)

  const [empresaSelecionada, setEmpresaSelecionada] = useState(null)

  const [allEmpresas, setAllEmpresas] = useState([])

  const [showPerfis, setShowPerfis] = useState(false)

  const [columns, setColumns] = useState([
    {
      dataField: 'acoes',
      formatter: (cell, row) => acoesFormatter(cell, row)
    },
    {
      dataField: 'nome',
      text: 'Nome',
      sort: true
    },
    {
      dataField: 'cnpj',
      text: 'CNPJ',
      sort: true,
      align: 'center',
      headerAlign: 'center',
    },
    {
      dataField: 'roles',
      text: 'perfis',
      align: 'center',
      headerAlign: 'center',
      formatter: (cell, row) => rolesFormaters(cell, row)
    }

  ])

  function rolesFormaters(cell, row) {
    return (
      <>
        {row.roles.map((item, key) =>
          <>
            <Badge key={key} className="badge-default" pill>
              {item.role.name}
            </Badge>
          </>)}
      </>
    )
  }

  useEffect(() => {
    if (empresas.length === 0) loadEmpresas()
    if (allEmpresas.length === 0) loadAllEmpresas()
  }, [])

  const empresasNaoSelecionadas = () => {
    //Remove do combo as empresas já adicionadas
    const ids = empresas.map((item) => item.id)
    const filters = allEmpresas.filter((item) => !ids.includes(item.id))
    return filters
  }

  async function loadAllEmpresas() {
    try {
      const response = await api.get(`/common/empresas/?limit=300`)
      if (response.data) {
        setAllEmpresas(response.data.data)
      }
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível carregar combo de empresas')
    }
  }

  async function removeEmpresa(empresaId) {
    try {
      await api.delete(`/security/usuarios/${user.id}/empresas/${empresaId}`)
      loadEmpresas()
      notify('success', 'Empresa removida')
      checkReload()
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível remover empresa')
    }
    setAlert(null)
  }

  function handleRemoverEmpresa(empresa) {
    confirmAlert(`Deseja realmente remover à ${empresa.nome} do acesso de ${user.name}?`,
      'danger',
      () => removeEmpresa(empresa.id))
  }

  function handleAddEmpresa() {
    if (!empresa) {
      return
    }
    confirmAlert(`Deseja realmente adicionar esta empresa ao acesso de ${user.name}?`,
      'warning',
      () => addEmpresa())
  }

  async function addEmpresa() {
    try {
      await api.post(`/security/usuarios/${user.id}/empresas/`, {
        id: empresa
      })
      loadEmpresas()
      setEmpresa(null)
      notify('success', 'Empresa adicionada')
      checkReload()
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível adicionar empresa')
    }
    setAlert(null)
  }

  function handleEditarPerfil(empresa) {
    setEmpresaSelecionada(empresa)
    setShowPerfis(true)
  }

  function hidePerfis() {
    setEmpresaSelecionada(null)
    setShowPerfis(false)
  }

  function checkReload() {
    setTimeout(() => {
      if (authData.user.id == user.id) {
        document.location.reload(true);
      }
    }, 1000)
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
      <div className="col-auto">
        <Button
          className="btn-sm"
          color="info"
          title="Editar Perfis"
          onClick={() => handleEditarPerfil(row)}
          outline>
          <i class="fas fa-user-tag"></i>
        </Button>

        <Button
          className="btn-sm"
          color="danger"
          title="Remover"
          onClick={() => handleRemoverEmpresa(row)}
          outline>
          <i className="fas fa-trash"></i>
        </Button>
      </div>


    </>)
  }


  async function loadEmpresas() {
    try {
      const response = await api.get(`/security/usuarios/${user.id}/empresas?`)
      if (response.data) {
        setEmpresas(response.data)
      }
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível carregar as empresas')
    }
  }


  return (
    <>
      {alert}

      <Perfis
        empresa={empresaSelecionada}
        hide={hidePerfis}
        notify={notify}
        show={showPerfis}
        user={user}
        naoMostrarInvisiveis={false}
        loadEmpresas={loadEmpresas}
      />

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
                Empresa
              </label>
              <InputGroup className="mb-3">
                <div
                  style={{
                    width: '400px'
                  }}
                >
                  <Select2
                    className="form-control"
                    onSelect={(e) => setEmpresa(e.target.value)}
                    options={{
                      placeholder: "Selecione uma empresa..."
                    }}
                    value={empresa}
                    data={empresasNaoSelecionadas().map((item) => ({ id: item.id, text: item.nome }))}
                  />
                </div>
                <InputGroupAddon addonType="append">
                  <Button
                    color="primary"
                    type="button"
                    outline
                    onClick={handleAddEmpresa}
                    className="btn-icon btn-3"
                  >
                    <span className="btn-inner--icon">
                      <i className="ni ni-fat-add"></i>
                    </span>
                    <span className="btn-inner--text">Adicionar empresa</span>
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
            data={empresas}
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
