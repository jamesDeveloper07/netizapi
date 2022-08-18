import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../../contexts/Auth'

import api from "../../../../services/api";

import RestricaoEquipe from "./RestricaoEquipe";
import { MenuComportamento } from "../../../../components/Menus";
import Select2 from "react-select2-wrapper";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import {
  Badge,
  Button,
  Row,
  Col,
  InputGroup,
  InputGroupAddon,
  FormGroup,
  Modal
} from "reactstrap";

import Users from "./Users";
import Perfis from "../../../security/Users/empresas/perfis";

export default ({ notify, empresa, ...props }) => {

  const { auth } = useContext(AuthContext)
  const [colaboradores, setColaboradores] = useState([])
  const [colaborador, setColaborador] = useState(null)
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null)

  const [showRestricaoEquipe, setShowRestricaoEquipe] = useState(undefined)
  const [showUsers, setShowUsers] = useState(false)
  const [showPerfis, setShowPerfis] = useState(false)

  const [columns,] = useState([
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
      dataField: 'email',
      text: 'Email',
      sort: true,
    },
    {
      dataField: 'roles',
      text: 'Perfis',
      align: 'center',
      headerAlign: 'center',
      formatter: (cell, row) => rolesFormaters(cell, row)
    },
  ])

  useEffect(() => {
    if (colaboradores.length === 0) loadColaboradores()
  }, [])

  function rolesFormaters(cell, row) {
    return (
      <>
        {row.roles.map((item, key) =>
          <>
            <Badge key={key} className="badge-default" pill>
              {item.name}
            </Badge>
          </>)}
      </>
    )
  }

  async function removeColaborador(userId) {
    setLoading(true)
    try {
      await api.delete(`/common/empresas/${empresa.id}/colaboradores/${userId}`)
      loadColaboradores()
      notify('success', 'Colaborador removido')
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível remover colaborador')
    }
    setLoading(false)
    setAlert(null)
  }

  function handleRemoverColaborador(colaborador) {
    confirmAlert(`Deseja realmente remover ${colaborador.name} da empresa ${empresa.nome}?`,
      'danger',
      () => removeColaborador(colaborador.id))
  }

  function handleEditPerfil(colaborador) {
    setColaboradorSelecionado(colaborador)
    setShowPerfis(true)
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
      <MenuComportamento
        direction='right'
        actions={[
          {
            label: 'Editar Perfis',
            icon: 'fas fa-user-tag',
            onClick: () => handleEditPerfil(row)
          },
          {
            label: 'Restrição de equipes',
            icon: 'fas fa-times',
            onClick: () => setShowRestricaoEquipe(row)
          },
          {
            label: 'Remover',
            icon: 'fas fa-trash',
            onClick: () => handleRemoverColaborador(row)
          },]}
      />
    </>)
  }


  async function loadColaboradores() {
    try {
      const response = await api.get(`/common/empresas/${empresa.id}/colaboradores?`)
      if (response.data) {
        setColaboradores(response.data)
      }
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível carregar os colaboradores')
    }
  }

  function clienteOptions() {
    const option = {
      placeholder: "Selecione um usuário para ser um colaborador...",
      width: 300
    }
    option['ajax'] = {
      url: `${process.env.REACT_APP_API_URL}/common/empresas/${empresa.id}/colaboradores?withNotEmpresa=true`,
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      processResults: function (data) {
        return {
          results: data.map((item) => ({ id: item.id, text: `${item.name}, ${item.email}` }))
        };
      }
    }
    return option
  }


  function openAddUsers() {
    setShowUsers(true)
  }

  function hideUsers() {
    setShowUsers(false)
  }

  function hidePerfis() {
    setColaboradorSelecionado(null)
    setShowPerfis(false)
  }

  return (
    <>
      <RestricaoEquipe
        notify={notify}
        empresa={empresa}
        show={!!showRestricaoEquipe}
        hidde={() => setShowRestricaoEquipe(undefined)}
        user={showRestricaoEquipe}
      />

      <Users
        empresa={empresa}
        hide={hideUsers}
        notify={notify}
        show={showUsers}
        loadColaboradores={loadColaboradores}
      />

      <Perfis
        empresa={empresa}
        hide={hidePerfis}
        notify={notify}
        show={showPerfis}
        user={colaboradorSelecionado}
        naoMostrarInvisiveis={true}
        loadColaboradores={loadColaboradores}
      />

      {alert}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Row>
          <Col lg={12} md={12}>
            <Button
              color="primary"
              type="button"
              outline
              // onClick={showUsers(true)}
              onClick={openAddUsers}
              className="btn-icon btn-3"
            >
              <span className="btn-inner--icon">
                <i className="ni ni-fat-add"></i>
              </span>
              <span className="btn-inner--text">Adicionar colaborador</span>
            </Button>
          </Col>
        </Row>


      </div>
      <Row>
        <Col className='col-12'>
          <ToolkitProvider
            data={colaboradores}
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
