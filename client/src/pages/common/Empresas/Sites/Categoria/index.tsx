import React, { useState, useEffect } from 'react';
import api from "../../../../../services/api";
import { Empresa, SiteEmpresa } from "../../../../../entities/Common"

import Form from "./Form";

import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import { MenuComportamento } from "../../../../../components/Menus";
//@ts-ignore
import Select2 from "react-select2-wrapper";
import {
  Button,
  Input,
  Row,
  Col,
  FormGroup,
  Modal,
  Badge
} from "reactstrap";
import { AxiosResponse } from 'axios';

// import { Container } from './styles';

type Props = {
  notify(type: string, msg: string): void,
  empresa: Empresa,
  //A interrogação diz que o item é opicional
  site: SiteEmpresa,
  //O item que diz se está mostrando ou não
  show: boolean,
  //O item que é chamado quando queremos fechar o modal
  hide(): void,
  //Função para atualizar lista de tras
  success(): void
}

type Erro = {
  nome?: string,
  path?: string,
  situacao?: string
}

const Categoria: React.FC<Props> = ({
  notify,
  empresa,
  site,
  show,
  hide,
  success
}) => {

  const [saving, setSaving] = useState(false)
  const [erros, setErros] = useState<Erro>({} as Erro)

  const [categorias, setCategorias] = useState([])

  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)

  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // console.log(site)
    loadCategorias(site)
  }, [show, site])


  function hideForm() {
    setShowForm(false)
  }

  function handleNew() {
    setCategoriaSelecionada(null)
    setShowForm(true)
  }

  function onDeleted() {
    setCategoriaSelecionada(null)
    loadCategorias(site)
  }

  function edit(categoria: any) {
    setCategoriaSelecionada(categoria)
    setShowForm(true)
  }

  const [columns, setColumns] = useState([
    {
      dataField: 'acoes',
      formatter: (cell: any, row: any) => acoesFormatter(cell, row)
    },
    {
      dataField: 'nome',
      text: 'Nome',
      sort: true,
      formatter: (cell: any, row: any) => nomeDescricaoFormatter(cell, row)
    },
    {
      dataField: 'situacao',
      text: 'Situação',
      sort: true,
      //formatter: (cell, row) => row.situacao == 'A' ? 'Ativo' : 'Inativo',
      formatter: (cell: any, row: any) => situacaoFormatter(cell, row),
      align: 'center',
      headerAlign: 'center'
    }
  ])

  function nomeDescricaoFormatter(cell: any, row: any) {
    let nome = cell
    let descricao = row.descricao

    return (
      <div title={descricao}>
        {nome}
      </div>
    )
  }

  function acoesFormatter(cell: any, row: any) {
    return (<>
      <div className="btn-group" role="group" aria-label="Basic example">
        <Button
          className="btn-sm"
          color="secondary"
          onClick={() => edit(row)}
          outline>
          <i className="far fa-edit"></i>
        </Button>
      </div>
    </>)
  }

  function situacaoFormatter(cell: any, row: any) {
    let situacao = cell
    let color = 'secondary'
    switch (cell) {
      case 'A':
        situacao = 'Ativo'
        color = 'success'
        break;
      case 'I':
        situacao = 'Inativo'
        color = 'danger'
        break;
    }
    return (
      <>
        <Badge color={color} className="badge-lg" pill>
          {situacao}
        </Badge>
      </>
    )
  }

  async function loadCategorias(site: any) {

    try {
      if (site && site.id > 0) {
        const response = await api.get(`/common/empresas/${empresa.id}/sites-empresas/${site.id}/categorias`)
        if (response.data) {
          setCategorias(response.data)
        }

      } else {
        setCategorias([])
        notify('danger', 'Site não informado para carregar as Categorias')
      }
      setCategoriaSelecionada(null)
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível carregar as Categorias')
    }
  }


  return (<>
    <Modal
      className="modal-dialog-centered"
      isOpen={show}
      toggle={hide}
    >
      <div className="modal-header">
        <h5 className="modal-title" id="exampleModalLabel">
          {site.id ? 'Editar Categorias' : ''}
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

        {/* //parei aqui , tá dando pau quando descomenta*/}

        <Form
          empresa={empresa}
          hide={hideForm}
          notify={notify}
          show={showForm}
          site={site}
          categoria={categoriaSelecionada}
          success={onDeleted}
        />

        <Row style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            color="primary"
            type="button"
            className="btn-icon btn-3"
            onClick={() => handleNew()}
          >
            <span className="btn-inner--icon">
              <i className="ni ni-fat-add"></i>
            </span>
            <span className="btn-inner--text">Nova Categoria</span>
          </Button>
        </Row>

        <Row>
          <Col>
            <ToolkitProvider
              data={categorias}
              keyField="nome"
              //@ts-ignore
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
                onClick={hide}
              >
                Fechar
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  </>
  );
}

export default Categoria;