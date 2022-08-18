import React, { useState, useEffect } from 'react';
import api from "../../../../../services/api";
import { Empresa, SiteEmpresa } from "../../../../../entities/Common"


//@ts-ignore
import Select2 from "react-select2-wrapper";
import {
  Button,
  Input,
  Row,
  Col,
  FormGroup,
  Modal
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

const Form: React.FC<Props> = ({
  notify,
  empresa,
  site,
  show,
  hide,
  success
}) => {

  const [nome, setNome] = useState('')
  const [path, setPath] = useState('')
  const [situacao, setSituacao] = useState('A')

  const [saving, setSaving] = useState(false)
  const [erros, setErros] = useState<Erro>({} as Erro)

  useEffect(() => {

    setNome(site.nome)
    setPath(site.path)
    setSituacao(site.situacao || 'A')
  }, [show, site])

  async function handleSave() {
    try {
      setErros({})
      setSaving(true)

      if (site.id) {
        await update()
      } else {
        await insert()
      }
      //escondo o modal
      hide()
      //recarrego a listagem por trás
      success()
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível adicionar site')
      //@ts-ignore
      if (error.response) updateErros(error.response.data)
    } finally {
      setSaving(false)
    }
  }

  async function insert() {
    //Chamo o endpoint para cadastro de sites na empresa
    await api.post(`/common/empresas/${empresa.id}/sites-empresas`,
      {
        //passo os campos do site que irei salvar
        nome,
        path,
        situacao
      })

  }

  async function update() {
    await api.put(`/common/empresas/${empresa.id}/sites-empresas/${site.id}`,
      {
        nome,
        path,
        situacao
      })
  }

  //@ts-ignore
  function updateErros(error) {
    if (error) {
      const errors = {}
      for (let e of error) {
        //@ts-ignore
        errors[e.field] = e.message
      }
      setErros(errors)
    } else {
      setErros({})
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
          {site.id ? 'Alterar Site' : 'Novo Site'}
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
          <Col>
            <FormGroup>
              <label
                className="form-control-label"
              >
                Nome*
              </label>
              <Input
                className="form-control"
                placeholder="Nome..."
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <small className="text-danger">
                {erros.nome || ''}
              </small>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup>
              <label
                className="form-control-label"
              >
                URL*
              </label>
              <Input
                className="form-control"
                placeholder="URL..."
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
              <small className="text-danger">
                {erros.path || ''}
              </small>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup>
              <label
                className='form-control-label'
              >
                Situação*
              </label>
              <Select2
                defaultValue="A"
                options={{
                  placeholder: "Selecione uma situação..."
                }}
                //@ts-ignore
                onSelect={(e) => {
                  setSituacao(e.target.value)
                  console.log(e.target)
                }}
                value={situacao}
                data={[{
                  id: 'A',
                  text: 'Ativo'
                }, {
                  id: 'I',
                  text: 'Inativo'
                }]}
              />
              <small className="text-danger">
                {erros.situacao || ''}
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
                onClick={hide}
              >
                Fechar
              </Button>
              <Button
                disabled={saving}
                color="primary"
                onClick={handleSave}
              >
                Salvar
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  </>
  );
}

export default Form;