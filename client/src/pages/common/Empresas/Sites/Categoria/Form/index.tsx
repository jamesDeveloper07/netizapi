import React, { useState, useEffect } from 'react';
import api from "../../../../../../services/api";
import { Empresa, SiteEmpresa } from "../../../../../../entities/Common"


//@ts-ignore
import Select2 from "react-select2-wrapper";
import ReactQuill from "react-quill";
//@ts-ignore
import TagsInput from "react-tagsinput";
import {
  Button,
  Input,
  Row,
  Col,
  FormGroup,
  Modal,
  PopoverBody,
  UncontrolledPopover,
  Badge
} from "reactstrap";
import { AxiosResponse } from 'axios';

// import { Container } from './styles';

type Props = {
  notify(type: string, msg: string): void,
  empresa: Empresa,
  //A interrogação diz que o item é opicional
  site: SiteEmpresa,
  categoria?: any,
  //O item que diz se está mostrando ou não
  show: boolean,
  //O item que é chamado quando queremos fechar o modal
  hide(): void,
  //Função para atualizar lista de tras
  success(): void
}

type Erro = {
  nome?: string,
  situacao?: string,
  descricao?: string,
  tags?: string,
}

const Form: React.FC<Props> = ({
  notify,
  empresa,
  site,
  categoria,
  show,
  hide,
  success
}) => {

  const [nome, setNome] = useState('')
  const [situacao, setSituacao] = useState('A')
  const [descricao, setDescricao] = useState(null)
  const [tags, setTags] = useState([])

  const [saving, setSaving] = useState(false)
  const [erros, setErros] = useState<Erro>({} as Erro)

  useEffect(() => {
    if (categoria && categoria.id) {
      setNome(categoria.nome)
      setSituacao(categoria.situacao || 'A')
      setDescricao(categoria.descricao)
      fillTags(categoria)
    } else {
      setNome('')
      setSituacao('A')
    }
  }, [show, categoria])

  function fillTags(categoria: any) {
    if (categoria && categoria.tags) {
      //@ts-ignore
      let tags = categoria.tags.replace(/\s/g, "").split(',').filter(item => item.trim() != '')
      //@ts-ignore
      tags.forEach(item => item.trim())
      setTags(tags)
    } else {
      setTags([])
    }
  }


  async function handleSave() {
    try {
      setErros({})
      setSaving(true)

      if (categoria && categoria.id) {
        await update()
      } else {
        await insert()
      }

      setNome('')
      setSituacao('A')
      setDescricao(null)
      setTags([])

      //escondo o modal
      hide()
      //recarrego a listagem por trás
      success()
    } catch (error) {
      console.log(error)
      notify('danger', 'Não foi possível adicionar categoria')
      // @ts-ignore
      if (error.response) updateErros(error.response.data)
    } finally {
      setSaving(false)
    }
  }

  async function insert() {
    await api.post(`/common/empresas/${empresa.id}/sites-empresas/${site.id}/categorias`,
      {
        nome,
        situacao,
        descricao,
        tags: tags.join(),
      })
  }

  async function update() {
    await api.put(`/common/empresas/${empresa.id}/sites-empresas/${site.id}/categorias/${categoria.id}`,
      {
        nome,
        situacao,
        descricao,
        tags: tags.join(),
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

  function handleHideModal() {
    setNome('')
    setSituacao('A')
    setDescricao(null)
    setTags([])
    hide()
  }

  //@ts-ignore
  const onTagsChange = tagsinput => {
    if (!tagsinput) return
    //@ts-ignore
    const newTags = tagsinput.map(tag => tag.trim().toLowerCase())
    //@ts-ignore
    let unique = [...new Set(newTags)];
    //@ts-ignore
    setTags(unique)
  };

  return (<>
    <Modal
      className="modal-dialog-centered"
      isOpen={show}
      toggle={handleHideModal}
    >
      <div className="modal-header">
        <h5 className="modal-title" id="exampleModalLabel">
          {categoria && categoria.id ? 'Alterar Categoria' : 'Nova Categoria'}
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
          <Col lg="12" sm="12" md="12">
            <FormGroup>
              <label className="form-control-label d-flex justify-content-between">
                <div>
                  Descrição
                  <Button
                    color="secondary"
                    id="tooltip87627934922"
                    outline
                    size="sm"
                    type="button">
                    ?
                  </Button>
                  <UncontrolledPopover placement="top" target="tooltip87627934922">
                    <PopoverBody>
                      Informe o texto que será apresentado como descrição da categoria...
                    </PopoverBody>
                  </UncontrolledPopover>
                </div>
                <Badge
                  size='sm'
                  color="secondary"
                  //@ts-ignore
                  title={`${descricao?.replace(/<[^>]*>/g, '')?.length || 0} caracteres `}
                  className="badge-md badge-circle badge-floating border-white">
                  {/* @ts-ignore */}
                  {descricao?.replace(/<[^>]*>/g, '')?.length || 0}
                </Badge>
              </label>
              <ReactQuill
                value={descricao || ""}
                theme="snow"
                modules={{
                  toolbar: [
                    ["bold", "italic"],
                    ["link", "blockquote", "code"],
                    [
                      {
                        list: "ordered"
                      },
                      {
                        list: "bullet"
                      }
                    ]
                  ]
                }}
                //@ts-ignore
                onChange={v => setDescricao(v)}
              />
              <small className="text-danger">
                {erros.descricao || ''}
              </small>
            </FormGroup>
          </Col>
        </Row>

        {/* <Row>
          <Col lg="12" sm="12" md="12">
            <FormGroup>
              <legend className="w-auto" style={{ margin: 0 }}>
                <label className="form-control-label" >
                  Tags
                </label>
              </legend>
              <div style={
                {
                  minHeight: 'calc(2.75rem + 2px)',
                  border: '1px solid #DEE2E6',
                  padding: 4,
                  borderRadius: 4,
                }}>

                <TagsInput
                  onlyUnique={true}
                  className="bootstrap-tagsinput"
                  onChange={onTagsChange}
                  tagProps={{ className: "tag badge mr-1 secondary" }}
                  value={tags || []}
                  inputProps={{
                    className: "secondary",
                    placeholder: "Tags...",
                    textTransform: "uppercase",
                    style: {

                    }
                  }}
                />
              </div>
              <small className="text-danger">
                {erros.tags || ''}
              </small>
            </FormGroup>
          </Col>
        </Row> */}

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
                onClick={handleHideModal}
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