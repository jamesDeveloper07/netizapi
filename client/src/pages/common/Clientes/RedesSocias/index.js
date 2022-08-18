import React, { useState, useEffect, useContext } from 'react';
import EmpresaContext from "../../../../contexts/Empresa";

import api from "../../../../services/api";

import InputMask from "react-input-mask";
import Form from './Form'
import {
  Button,
  ListGroupItem,
  ListGroup,
  Row,
  Col,
  Modal
} from "reactstrap";

export default ({ clienteId, notify, alert, onRedesSociaisChanged }, ...props) => {

  const { empresaSelecionada } = useContext(EmpresaContext)
  const [redesSociais, setRedesSociais] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [redeSocialToEdit, setRedeSocialToEdit] = useState({})

  const [tipos] = useState([
    { id: 'facebook', text: 'Facebook' },
    { id: 'instagram', text: 'Instagram' },
    { id: 'twitter', text: 'Twitter' },
    { id: 'linkedin', text: 'Linkedin' },
    { id: 'youtube', text: 'YouTube' },
    { id: 'site', text: 'Site' },
  ])

  useEffect(() => {
    if (clienteId) {
      loadRedesSociais()
    }
  }, [clienteId])

  async function loadRedesSociais() {
    try {
      const response = await api.get(`/common/empresas/${empresaSelecionada?.id}/clientes/${clienteId}/redes-sociais`)
      setRedesSociais(await response.data)
    } catch (error) {
      console.error(error)
      notify('danger', 'Não foi possivel carregar redes sociais')
    }
  }


  function removeLocal(endereco) {
    const array = redesSociais.filter(item => item.endereco !== endereco)
    setRedesSociais(array)

    if (onRedesSociaisChanged) {
      onRedesSociaisChanged(array)
    }
  }

  const remove = async (redeSocial) => {
    if (window.confirm("Deseja remover esta rede social?")) {
      try {
        if (!clienteId) {
          //Se não estiver salvo, remove localmente
          removeLocal(redeSocial.endereco)
          return
        }
        await api.delete(`/common/empresas/${empresaSelecionada?.id}/clientes/${clienteId}/redes-sociais/${redeSocial.id}`)
        notify("success", "Rede social removida");
        loadRedesSociais()
      } catch (error) {
        console.error(error)
        if (error.response && error.response.status === 400) {
          notify("danger", error.response.data.message);
        }
        else {
          notify("danger", "Não foi possível remover rede social");
        }
      }
    }
  }

  function handleEditRedeSocial(redeSocial) {
    if (clienteId) {
      setRedeSocialToEdit(redeSocial)
      setShowModal(true)
    }
  }

  function onSaved(redeSocial) {
    notify('success', 'Rede social salva')

    if (clienteId) {
      loadRedesSociais()
      setRedeSocialToEdit({})
    }

    if (!clienteId && redeSocial) {
      const array = [...redesSociais]
      array.push(redeSocial);
      setRedesSociais(array)
      if (onRedesSociaisChanged) onRedesSociaisChanged([...array])
    }
    setShowModal(false)
  }

  const RedeSocialPreview = ({ redeSocial, key }) => (
    <>
      <ListGroupItem
        key={key}
        className="list-group-item-action flex-column align-items-start py-4 px-4"
        href="#"
      >
        <Row>
          <Col
            lg={1}
            sm={2}
            md={1}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Button
              className="btn-sm"
              color="danger"
              onClick={() => remove(redeSocial)}
            >
              <i class="fas fa-trash"></i>
            </Button>
          </Col>
          <Col
          >
            <div className="d-flex w-100 justify-content-between">
              <div>
                <div className="d-flex w-100 align-items-center">
                  <h5 className="mb-1">
                    <a
                      href={redeSocial.endereco}
                      target='_blank'
                    >
                      {redeSocial.endereco}
                    </a>
                  </h5>
                </div>
              </div>
              <small></small>
            </div>
            <p className="text-sm mb-0" style={{ textTransform: 'capitalize' }}>
              {
                redeSocial.tipo
              }
            </p>
          </Col>
        </Row>
      </ListGroupItem>
    </>
  )

  return (
    <>
      <div
        style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center'
        }}
      >
        <Button
          color="primary"
          type="button"
          size='sm'
          className="btn-icon btn-3"
          onClick={() => setShowModal(!showModal)}
        >
          <span className="btn-inner--icon">
            <i className="ni ni-fat-add"></i>
          </span>
          <span className="btn-inner--text">Novo</span>
        </Button>
        <Modal
          className="modal-dialog-centered"
          isOpen={showModal}
          toggle={() => setShowModal(!showModal)}
        >
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              Adicionar Rede Social
                  </h5>
            <button
              aria-label="Close"
              className="close"
              data-dismiss="modal"
              type="button"
              onClick={() => setShowModal(!showModal)}
            >
              <span aria-hidden={true}>×</span>
            </button>
          </div>
          <div className="modal-body">
            <Form
              notify={notify}
              clienteId={clienteId}
              onSuccess={onSaved}
              redesAdicionadas={redesSociais}
              tiposRedesSociais={tipos}
              redeSocial={redeSocialToEdit}
              close={() => setShowModal(false)}
            />
          </div>
        </Modal>
      </div>
      <ListGroup flush className=' py-4 px-4'>
        {redesSociais.map((item, key) => (
          <>
            <RedeSocialPreview
              key={key}
              redeSocial={item}
            />
          </>
        ))}
      </ListGroup>
    </>
  );
}
