import React, { useState, useEffect } from 'react';
import api from "../../../services/api";

import InputMask from "react-input-mask";
import ReactQuill from "react-quill";
import Select2 from "react-select2-wrapper";
import {
    Spinner,
    FormGroup,
    Input,
    Button,
    Row,
    Col,
    UncontrolledPopover,
    PopoverBody,
    UncontrolledTooltip,
    Badge
} from "reactstrap";

export default ({ empresa,
    notify,
    history,
    onEmpresaChange,
    minhaEmpresa,
    ...props }) => {

    const [nome, setNome] = useState(null)
    const [cnpj, setCnpj] = useState(null)
    const [site, setSite] = useState(null)
    const [perfil_negocio_id, setPerfil_negocio_id] = useState(null)
    const [plano_id, setPlano_id] = useState(null)    
    const [periodo_cortesia, setPeriodo_cortesia] = useState(0)
    const [observacoes, setObservacoes] = useState('')
    const [cabecalho_publicacao, setCabecalho_publicacao] = useState('')
    const [rodape_publicacao, setRodape_publicacao] = useState('')

    const [perfisNegocio, setPerfisNegocio] = useState([])
    const [planos, setPlanos] = useState([])

    const [saving, setSaving] = useState(false)
    const [erros, setErros] = useState({})

    function throwError(text) {
        if (notify) notify('danger', text)
    }

    useEffect(() => {
        if (perfisNegocio.length === 0) loadPerfisNegocio()
        if (planos.length === 0) loadPlanos()
    }, [])

    useEffect(() => {
        setNome(empresa.nome)
        setCnpj(empresa.cnpj)
        setSite(empresa.site)
        setPerfil_negocio_id(empresa.perfil_negocio_id)
        setPlano_id(empresa.plano_id)
        setPeriodo_cortesia(empresa.periodo_cortesia)
        setObservacoes(empresa.observacoes)        
        setCabecalho_publicacao(empresa.cabecalho_publicacao)
        setRodape_publicacao(empresa.rodape_publicacao)
    }, [empresa])

    async function loadPerfisNegocio() {
        try {
            const response = await api.get(`/common/perfis_negocio`)
            setPerfisNegocio(response.data)
        } catch (error) {
            console.log(error)
            throwError('Não foi possível carregar Perfis Negócio')
        }
    }

    async function loadPlanos() {
        try {
            const response = await api.get(`/common/planos`)
            setPlanos(response.data)
        } catch (error) {
            console.log(error)
            throwError('Não foi possível carregar Planos')
        }
    }

    async function handleSave() {
        setSaving(true)
        if (empresa && empresa.id) {
            await update()
        } else {
            await insert()
        }
        setSaving(false)
    }

    async function insert() {
        try {
            const response = await api.post('/common/empresas', {
                nome,
                cnpj,
                site,
                perfil_negocio_id,
                plano_id,
                periodo_cortesia,
                observacoes,
                cabecalho_publicacao: cabecalho_publicacao && cabecalho_publicacao.replace(/<[^>]*>?/gm, '').length > 0 ? cabecalho_publicacao : null,
                rodape_publicacao: rodape_publicacao && rodape_publicacao.replace(/<[^>]*>?/gm, '').length > 0 ? rodape_publicacao : null
            })
            updateErros(null)
            notify('success', 'Empresa adicionada com sucesso')
            if (onEmpresaChange) onEmpresaChange(response.data)
        } catch (error) {
            console.log(error)
            throwError('Não foi possível salvar empresa')
            updateErros(error.response.data)
        }
    }

    async function update() {
        try {
            const response = await api.put(`/common/empresas/${empresa.id}`, {
                nome,
                cnpj,
                site,
                perfil_negocio_id,
                plano_id,
                periodo_cortesia,
                observacoes,
                cabecalho_publicacao: cabecalho_publicacao && cabecalho_publicacao.replace(/<[^>]*>?/gm, '').length > 0 ? cabecalho_publicacao : null,
                rodape_publicacao: rodape_publicacao && rodape_publicacao.replace(/<[^>]*>?/gm, '').length > 0 ? rodape_publicacao : null
            })
            updateErros(null)
            notify('success', 'Empresa alterada com sucesso')
            if (onEmpresaChange) onEmpresaChange(response.data)
        } catch (error) {
            console.log({ error })
            throwError('Não foi possível salvar empresa')
            if (error.response && error.response.data) {
                updateErros(error.response.data)
            }
        }
    }

    function updateErros(error) {
        try {
            if (error) {
                const errors = {}
                for (let e of error) {
                    errors[e.field] = e.message
                }
                setErros(errors)
            } else {
                setErros({})
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <Row>
                <Col lg={4} md={4}>
                    <FormGroup>
                        <label
                            className="form-control-label"
                        >
                            Nome*
                        </label>
                        <Input
                            className="form-control"
                            placeholder="Nome da empresa..."
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                        <small class="text-danger">
                            {erros.nome ? erros.nome : ''}
                        </small>
                    </FormGroup>
                </Col>
                <Col lg={4} md={4}>
                    <FormGroup>
                        <label className="form-control-label">
                            CNPJ
                        </label>
                        <InputMask
                            placeholder='Informe o CNPJ...'
                            className="form-control"
                            maskPlaceholder={null}
                            mask="99.999.999/9999-99"
                            value={cnpj}
                            onChange={e => setCnpj(e.target.value)}
                        />
                        <small class="text-danger">
                            {erros.cnpj ? erros.cnpj : ''}
                        </small>
                    </FormGroup>
                </Col>
                <Col lg={4} md={4}>
                    <FormGroup>
                        <label
                            className="form-control-label"
                            htmlFor="example-number-input"
                        >
                            Site
                        </label>
                        <Input
                            className="form-control"
                            placeholder="https://exemplo.com.br"
                            type="text"
                            value={site}
                            onChange={({ target }) => setSite(target.value)}
                        />
                        <small class="text-danger">
                            {erros.site || ''}
                        </small>
                    </FormGroup>
                </Col>
            </Row>
            {/* Campo período cortesia só fica visível quando a empresa esta sendo editada pelo menu Empresas (Adiministrador) */}
            {!minhaEmpresa &&
                <Row>
                    <Col lg={4} md={4}>
                        <FormGroup>
                            <label
                                className="form-control-label">
                                Perfil Negocio*
                            </label>
                            <Select2
                                className="form-control"
                                value={perfil_negocio_id}
                                options={{
                                    placeholder: "Selecione o perfil do negócio..."
                                }}
                                onSelect={e => setPerfil_negocio_id(parseInt(e.target.value))}
                                data={perfisNegocio.map(item => ({ id: item.id, text: item.nome }))}
                            />
                            <small class="text-danger">
                                {erros.perfil_negocio_id || ''}
                            </small>
                        </FormGroup>
                    </Col>

                    <Col lg={4} md={4}>
                        <FormGroup>
                            <label
                                className="form-control-label">
                                Plano*
                            </label>
                            <Select2
                                className="form-control"
                                value={plano_id}
                                options={{
                                    placeholder: "Selecione o plano..."
                                }}
                                onSelect={e => setPlano_id(parseInt(e.target.value))}
                                data={planos.map(item => ({ id: item.id, text: item.nome }))}
                                disabled={true}
                            />
                            <small class="text-danger">
                                {erros.plano_id || ''}
                            </small>
                        </FormGroup>
                    </Col>

                    <Col lg={4} md={4}>
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="example-number-input"
                            >
                                Período de Cortesia
                            </label>
                            <Button
                                className='p-0 ml-2 mb-1'
                                color="link"
                                id="tooltipPeriodoCortesia"
                                type="button">
                                ?
                            </Button>
                            <UncontrolledPopover placement="top" target="tooltipPeriodoCortesia">
                                <PopoverBody>
                                    Infome o valor, em dias, referente ao período de cortesia desta empresa. Para período indeterminado, informe o valor -1.
                                </PopoverBody>
                            </UncontrolledPopover>
                            <Input
                                className="form-control"
                                placeholder="valor em dias..."
                                type="number"
                                value={periodo_cortesia}
                                min={-1}
                                max={731}
                                onChange={({ target }) => setPeriodo_cortesia(target.value)}
                            />
                            <small class="text-danger">
                                {erros.periodo_cortesia || ''}
                            </small>
                        </FormGroup>
                    </Col>
                </Row>
            }
            <Row>
                <Col>
                    <FormGroup>
                        <label
                            className="form-control-label"
                            htmlFor="example-number-input"
                        >
                            Observações
                        </label>
                        <Input
                            className="form-control"
                            type="textarea"
                            style={{ height: 250 }}
                            value={observacoes}
                            onChange={({ target }) => setObservacoes(target.value)}
                        />
                        <small class="text-danger">
                            {erros.corpo_texto || ''}
                        </small>
                    </FormGroup>
                </Col>
            </Row>


            <Row>
                <Col lg="12" sm="12" md="12">
                    <FormGroup>
                        <div className="d-flex justify-content-between">
                            <label className="form-control-label d-flex justify-content-between">
                                <div>
                                    Cabeçalho Padrão para Publicação
                                    <Button
                                        color="secondary"
                                        id="tooltipCabecalho"
                                        outline
                                        size="sm"
                                        type="button">
                                        ?
                                    </Button>
                                    <UncontrolledPopover placement="top" target="tooltipCabecalho">
                                        <PopoverBody>
                                            Informe o texto que será apresentado como cabeçalho padrão de uma publicação.
                                        </PopoverBody>
                                    </UncontrolledPopover>
                                </div>
                            </label>
                            <Badge
                                style={{ marginLeft: 10 }}
                                size='sm'
                                color="secondary"
                                title={`${cabecalho_publicacao?.replace(/<[^>]*>/g, '').length || 0} caracteres no cabeçalho`}
                                className="badge-md badge-circle badge-floating border-white">
                                {cabecalho_publicacao?.replace(/<[^>]*>/g, '')?.length || 0}
                            </Badge>
                        </div>
                        <ReactQuill
                            value={cabecalho_publicacao || ""}
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
                            onChange={v => setCabecalho_publicacao(v)}
                        />
                        <small class="text-danger">
                            {erros.cabecalho_publicacao || ''}
                        </small>

                    </FormGroup>
                </Col>
                <Col lg="12" sm="12" md="12">
                    <FormGroup>
                        <label className="form-control-label d-flex justify-content-between">
                            <div>
                                Rodapé Padrão para Publicação
                                <Button
                                    color="secondary"
                                    id="tooltipRodape"
                                    outline
                                    size="sm"
                                    type="button">
                                    ?
                                </Button>
                                <UncontrolledPopover placement="top" target="tooltipRodape">
                                    <PopoverBody>
                                        Informe o texto que será apresentado como rodapé padrão de uma publicação.
                                    </PopoverBody>
                                </UncontrolledPopover>
                            </div>
                            <Badge
                                size='sm'
                                color="secondary"
                                title={`${rodape_publicacao?.replace(/<[^>]*>/g, '')?.length || 0} caracteres `}
                                className="badge-md badge-circle badge-floating border-white">
                                {rodape_publicacao?.replace(/<[^>]*>/g, '')?.length || 0}
                            </Badge>
                        </label>
                        <ReactQuill
                            value={rodape_publicacao || ""}
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
                            onChange={v => setRodape_publicacao(v)}
                        />
                        <small class="text-danger">
                            {erros.rodape_publicacao || ''}
                        </small>
                    </FormGroup>
                </Col>
            </Row>

            <Row>
                <Col>
                    <div className="float-right ">
                        <Button
                            className="ml-auto"
                            color="link"
                            data-dismiss="modal"
                            type="button"
                            onClick={() => history.goBack()}
                        >
                            Voltar
                        </Button>
                        <Button
                            color="primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {
                                saving &&
                                <Spinner size='sm' />
                            }
                            Salvar
                        </Button>
                    </div>
                </Col>
            </Row>
        </>
    );
}
