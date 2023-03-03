import React, { useState, useEffect, useRef, useContext } from 'react';
import EmpresaContext from "../../../../../../contexts/Empresa";
import { AxiosResponse } from 'axios';
import { useHistory } from "react-router-dom";
import api from "../../../../../../services/api";
import AuthContext from "../../../../../../contexts/Auth";

import { Empresa, TermosUso } from '../../../../../../entities/Common';
import Table from './Table';
import {
  Button,
  Modal,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
} from "reactstrap";
// core components

//Definindo as propriedades desse componente 
type Props = {
  onEmpresaChange(empresa: Empresa): void,
  notify(type: string, msg: string): void,
  empresa: Empresa,
  minhaEmpresa?: boolean
}

const TermosUsoIndex: React.FC<Props> = ({
  onEmpresaChange,
  notify,
  empresa,
  minhaEmpresa
}) => {

  const history = useHistory()
  const { hasRole } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [termosUso, setTermosUso] = useState(new Array<TermosUso>())
  const [showModalAceitarTermos, setShowModalAceitarTermos] = useState(false)
  const [termosVigentesAceitos, setTermosVigentesAceitos] = useState(false)
  const [termosUsoVigente, setTermosUsoVigente] = useState<TermosUso | undefined>()
  const [pageProperties, setPageProperties] = useState({
    total: "0",
    perPage: 10,
    page: 1,
    lastPage: 1,
    loading: false
  })
  // const [lastSearch, setLastSearch] = useState({})

  useEffect(() => {
    if (empresa.id) {
      loadTermosUso()
      loadTermosUsoVigente()
    }
  }, [empresa])

  async function loadTermosUsoVigente() {
    try {
      const response = await api.get(`common/empresas/${empresa?.id}/termos-uso-vigente`)
      setTermosUsoVigente(response.data)
    } catch (err) {
      console.log(err)
      notify('danger', 'Houve um problema ao carregar os Termos de Uso Vigentes.');
    }
  }

  async function loadEmpresa() {
    try {
      const response = await api.get(`/common/empresas/${empresa?.id}`)
      onEmpresaChange(response?.data)
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível carregar empresa')
    }
  }

  async function updatePageProperties(response: AxiosResponse) {
    const { total, perPage, page, lastPage } = await response.data
    setPageProperties({
      total,
      perPage,
      page,
      lastPage,
      loading: false,
    })
  }

  async function loadTermosUso(page = 1,
    limit = 10,
    sortField = "dt_assinatura",
    sortOrder = "desc") {
    try {
      setPageProperties({
        ...pageProperties,
        loading: true
      })
      const response = await api.get(`common/empresas/${empresa?.id}/termos-uso-empresa/`, {
        params: {
          page,
          limit,
          sortField,
          sortOrder
        }
      })
      setTermosUso(response.data.data)
      await updatePageProperties(response)
    } catch (err) {
      //@ts-ignore
      console.log(err.response)
      notify('danger', 'Houve um problema ao carregar os Termos de Uso.');
    }
  }

  async function handleTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void> {
    try {
      await loadTermosUso(
        sortProperties.page == 0 ? 1 : sortProperties.page,
        sortProperties.sizePerPage,
        sortProperties.sortField,
        sortProperties.sortOrder)
    } catch (error) {
      notify('danger', 'Houve um problema ao carregar os Termos de Uso.');
    }
  }

  function handlerShowModalAssinatura() {
    setShowModalAceitarTermos(true);
  }

  function handlerVerTermos(e: React.MouseEvent) {
    try {
      window.open(termosUsoVigente?.link_url, '_blank');
    } catch (error) {
      console.log(error)
      if (notify) notify('danger', 'Não foi possível Imprimir Politica de Privacidade')
    }
  }


  async function handlerAceitarTermos(e: React.MouseEvent) {
    e.preventDefault()
    try {
      await api.post(`/common/empresas/${empresa?.id}/termos-uso/${termosUsoVigente?.id}/assinar-termos-uso`)

      if (notify) notify('success', 'Termos de Uso Vigentes Aceitos')
      setShowModalAceitarTermos(false)
      loadTermosUso();
      loadEmpresa()
    } catch (error) {
      console.log(error)
      if (notify) notify('danger', 'Não foi possível Aceitar Termos de Uso Vigentes')
    }
  }


  function verBotaoAceitarTermos() {

    if (termosUsoVigente && empresa) {
      if (termosUsoVigente.id && empresa.termos_uso_id && (termosUsoVigente.id == empresa.termos_uso_id)) {
        return false
      } else {
        return minhaEmpresa
      }
    }

    return false
  }

  return (
    <>
      <div
        style={{
          display: verBotaoAceitarTermos() ? 'flex' : 'none',
          flex: 1,
          justifyContent: 'center'
        }}
      >
        <Button
          color="danger"
          type="button"
          className="btn-icon btn-3"
          onClick={handlerShowModalAssinatura}
        >
          <span className="btn-inner--icon">
            <i className="fas fa-file-signature"></i>
          </span>
          <span className="btn-inner--text">Aceitar Termos Vigentes</span>
        </Button>
      </div>

      <Modal
        className={"modal-dialog-centered modal-danger"}
        size="md"
        isOpen={showModalAceitarTermos}
      // toggle={() => setShowModalAceitarTermos(false)}
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-notification">
            Assinatura de Política de Privacidade
          </h6>
        </div>
        <div className="modal-body">
          <div className="py-3 text-center">
            {/* <i className="fas fa-question-circle ni-3x" /> */}
            <i className={"fas fa-file-signature ni-3x"}></i>
            <h4 className="heading mt-4"></h4>
            <>
              <p>
                ATENÇÃO
              </p>
              <p>
                A empresa ainda não aceitou os Termos de Uso vigentes. Acesse os Termos de Uso, leia atentamente e, após isso, registre a aceitação.
              </p>
              <p>
                {termosUsoVigente?.nome}
              </p>
            </>
            <div className="custom-control custom-checkbox mr-4">
              <input
                className="custom-control-input"
                id="check-sms"
                type="checkbox"
                checked={termosVigentesAceitos}
                onChange={({ target }) => setTermosVigentesAceitos(target.checked)}
              />
              <label className="custom-control-label" htmlFor="check-sms">
                Aceito os Termos Vigentes
              </label>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <div>
            <Button
              className="text-white ml-auto"
              color="link"
              data-dismiss="modal"
              type="button"
              onClick={() => setShowModalAceitarTermos(false)}
            >
              Fechar
            </Button>
            <Button
              onClick={handlerVerTermos}
              className="btn-white"
              color="default"
              type="button">
              Ver Termos
            </Button>

            <Button
              onClick={handlerAceitarTermos}
              className="btn-white"
              color="default"
              type="button"
              disabled={!termosVigentesAceitos}>
              Aceitar
            </Button>

          </div>
        </div>
      </Modal>



      <Row>
        <Col>
          <Table
            termosUso={termosUso || []}
            notify={notify}
            onTableChange={handleTableChange}
            pageProperties={pageProperties}
            loading={loading}
          />
        </Col>
      </Row>
    </>
  )
}

export default TermosUsoIndex;