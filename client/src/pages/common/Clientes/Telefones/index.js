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

export default ({ clienteId, notify, alert, onTelefonesChange }, ...props) => {

  const { empresaSelecionada } = useContext(EmpresaContext)
  const [telefones, setTelefones] = useState([])
  const [showModal, setShowModal] = useState(false)

  const [tiposTelefones] = useState([
    { id: 'celular', text: 'Celular' },
    { id: 'residencial', text: 'Residencial' },
    { id: 'comercial', text: 'Comercial' }
  ])

  useEffect(() => {
    if (onTelefonesChange) {
      onTelefonesChange(telefones)
    }
  }, [telefones])


  useEffect(() => {
    if (clienteId) {
      loadTelefones()
    }
  }, [clienteId])

  async function loadTelefones() {
    try {
      const response = await api.get(`/common/empresas/${empresaSelecionada?.id}/clientes/${clienteId}/telefones`)
      setTelefones(response.data)
    } catch (error) {
      console.error(error)
      notify('danger', 'Não foi possivel carregar telefones')
    }
  }

  function handleOpenWhatsapp({ ddd, numero }) {
    const telefone = `${ddd}${numero}`
    const win = window.open(`https://api.whatsapp.com/send?l=pt_BR&phone=55${telefone}`, '_blank');
    win.focus();
  }


  function removeLocal(ddd, numero) {
    const array = telefones.filter(item => {
      return (item.ddd != ddd) || (item.numero != numero);
    })
    telefones.splice(0, telefones.length);
    telefones.push(...array);
    setTelefones(telefones)

    if (onTelefonesChange) {
      onTelefonesChange(array)
    }
  }


  const remove = async (telefone) => {
    if (window.confirm("Deseja remover este telefone?")) {
      try {
        if (!clienteId) {
          //Se não estiver salvo, remove localmente
          removeLocal(telefone.ddd, telefone.numero)
          return
        }
        await api.delete(`/common/empresas/${empresaSelecionada?.id}/clientes/${clienteId}/telefones/${telefone.id}`)
        notify("success", "Telefone removido");
        loadTelefones()
      } catch (error) {
        console.error(error)
        if (error.response && error.response.status == 409) {
          notify("danger", error.response.data.message);
        }
        else {
          notify("danger", "Não foi possível remover telefone");
        }
      }
    }
  }


  function handleSave(telefone) {
    notify('success', 'Telefone salvo')
    //Caso exita oportunidade, carrega a lista de telefones
    if (clienteId) loadTelefones()

    if (!clienteId && telefone) {
      //Caso nao exista cliente, seta o telefone na lista de telefone locais
      telefones.push(telefone);
      setTelefones(telefones);
      if (onTelefonesChange) onTelefonesChange([...telefones])
    }
    setShowModal(false)
  }

  const createTelefonePreview = (item, key) => (
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
              onClick={() => remove(item)}
            >
              <i class="fas fa-trash"></i>
            </Button>
          </Col>
          <Col >
            <div className="d-flex w-100 justify-content-between">
              <div>
                <div className="d-flex w-100 align-items-center">
                  {
                    item.tipo_telefone.toLowerCase() == 'celular' &&
                    <a
                      title='Abrir whatsapp'
                      href="#"
                      onClick={() => handleOpenWhatsapp(item)}>
                      <i class="fab fa-whatsapp mr-2" style={{ color: '#2BB200' }}></i>
                    </a>

                  }
                  <h5 className="mb-1">
                    {`${item.ddd} ${item.numero}`}
                  </h5>
                </div>
              </div>
              <small></small>
            </div>
            <p className="text-sm mb-0" style={{ textTransform: 'capitalize' }}>
              {
                item.tipo_telefone
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
              Adicionar Telefone
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
              onSuccess={handleSave}
              telefonesAdicionados={telefones}
              close={() => setShowModal(false)}
            />
          </div>
        </Modal>
      </div>
      <ListGroup flush className=' py-4 px-4'>
        {telefones.map((item, key) => (
          <>
            {createTelefonePreview(item, key)}
          </>
        ))}
      </ListGroup>
    </>
  );
}
