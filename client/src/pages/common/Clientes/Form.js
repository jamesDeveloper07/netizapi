import React, { useState, useRef, useEffect, useContext } from 'react';
import EmpresaContext from "../../../contexts/Empresa";
import api from "../../../services/api";

import TagsInput from "react-tagsinput";
import Select2 from "react-select2-wrapper";
import ReactDatetime from "react-datetime";
import NotificationAlert from "react-notification-alert";
import ReactBSAlert from "react-bootstrap-sweetalert";
import Telefones from './Telefones';
import RedesSocias from "./RedesSocias";
import InputMask from "react-input-mask";
import LinksModal from "./Links";
import EnviarEmailModal from "./EmailAvulso";
import { EmailInputContainer } from "./styles";
// reactstrap components
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Container,
    Row,
    Col,
    FormGroup,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Spinner
} from "reactstrap";

export default ({
    history,
    clienteId,
    onSuccess,
    goBack,
    showHeader = true,
    onTelefonesChange,
    oportunidadeId = null
}, ...props) => {


    const { empresaSelecionada } = useContext(EmpresaContext)
    const [cliente, setCliente] = useState({})
    const [nome, setNome] = useState(null)
    const [cpfCnpj, setCpfCnpj] = useState(null)
    const [dataNascimento, setDataNascimento] = useState(null)
    const [tipoPessoa, setTipoPessoa] = useState('F')
    const [tags, setTags] = useState([])
    const [sexo, setSexo] = useState(null)
    const [email, setEmail] = useState(null)
    const [telefones, setTelefones] = useState([])
    const [pessoaContato, setPessoaContato] = useState(null)
    const [redesSociais, setRedesSociais] = useState([])

    const [tiposPessoas] = useState([
        { id: 'F', text: 'Pessoa Física' },
        { id: 'J', text: 'Pessoa Jurídica' }
    ])
    const [sexos] = useState([
        { id: 'F', text: 'Feminino' },
        { id: 'M', text: 'Masculino' },
        { id: 'O', text: 'Outro' }])

    const [showLinks, setShowLinks] = useState(false)
    const [showEmailAvulso, setShowEmailAvulso] = useState(false)

    const [alert, setAlert] = useState(null)
    const [erros, setErros] = useState({})
    const [saving, setSaving] = useState(false)

    const notificationAlert = useRef()
    const mainContainer = useRef()

    useEffect(() => {
        if (clienteId) loadCliente(clienteId)
    }, [clienteId])

    useEffect(() => {
        if (onTelefonesChange && clienteId) onTelefonesChange(clienteId)
    }, [telefones])


    useEffect(() => {
        if (tipoPessoa === 'J') {
            setSexo(null)
        }
    }, [tipoPessoa])

    useEffect(() => {
        setNome(cliente.nome)
        setCpfCnpj(cliente.cpf_cnpj)
        setDataNascimento(cliente.data_nascimento ? new Date(cliente.data_nascimento) : null)
        setTipoPessoa(cliente.tipo_pessoa ? cliente.tipo_pessoa : 'F')
        setSexo(cliente.sexo)
        setEmail(cliente.email)
        setTags(cliente.tags_array || [])
        setPessoaContato(cliente.pessoa_contato)
    }, [cliente])

    useEffect(() => {
        if (cpfCnpj) {
            if (((tipoPessoa == 'F' && cpfCnpj.length == 14)
                || (tipoPessoa == 'J' && cpfCnpj.length == 18)) && cpfCnpj != cliente.cpf_cnpj
            ) {
                //Se for um cpf/cnpj valido e se o cpfCnpj for diferente do cliente caregadona tela...
                findCliente(cpfCnpj)
            }
        }
    }, [cpfCnpj])

    async function findCliente(cpfCnpj) {
        try {
            const response = await api.get(`common/empresas/${empresaSelecionada?.id}/clientes/`, {
                params: { cpfCnpj }
            })
            if (response.data.data.length > 0) {
                askToChangeCliente(response.data.data[0])
            }
        } catch (error) {
            console.error(error)
        }
    }

    function askToChangeCliente(cliente) {
        setAlert(
            <ReactBSAlert
                custom
                style={{ display: "block" }}
                title="Já existe um cliente com esse CPF/CNPJ"
                customIcon={
                    <div
                        className="swal2-icon swal2-question swal2-animate-question-icon"
                        style={{ display: "flex" }}
                    >
                        <span className="swal2-icon-text">?</span>
                    </div>
                }
                onConfirm={() => {
                    setAlert(null)
                    setCliente(cliente)
                }}
                onCancel={() => {
                    setCpfCnpj('')
                    setAlert(null)
                }}
                showCancel={true}
                confirmBtnBsStyle="default"
                confirmBtnText="Sim"
                reverseButtons={true}
                btnSize=""
            >
                Encontramos um cliente com esse mesmo CPF/CNPJ. Deseja carrega-lo?
            </ReactBSAlert>
        )
    }

    function handleShowLinks() {
        setShowLinks(true)
    }

    function handleHiddeLinks() {
        setShowLinks(false)
    }


    function handleShowEmailAvulso() {
        setShowEmailAvulso(true)
    }

    function handleHiddeEmailAvulso() {
        setShowEmailAvulso(false)
    }

    async function loadCliente(clienteId) {
        try {
            const response = await api.get(`/common/empresas/${empresaSelecionada?.id}/clientes/${clienteId}`)
            setCliente(response.data)
        } catch (error) {
            notify('danger', 'Não foi possível carregar cliente')
        }
    }

    const handleTags = tagsinput => {
        if (!tagsinput) return
        const newTags = tagsinput
            .map(tag => tag.trim().toLowerCase())
        let unique = [...new Set(newTags)];
        setTags(unique)
    };

    async function handleSave() {
        setSaving(true)
        try {
            setErros({})
            const formData = {
                ...cliente,
                data_nascimento: dataNascimento,
                cpf_cnpj: cpfCnpj,
                nome,
                tipo_pessoa: tipoPessoa,
                sexo,
                email,
                telefones,
                redes_sociais: redesSociais,
                tags: tags.join(),
                pessoa_contato: pessoaContato,
            }
            const url = !cliente.id ?
                `/common/empresas/${empresaSelecionada?.id}/clientes`
                :
                `/common/empresas/${empresaSelecionada?.id}/clientes/${cliente.id}`
            let msg = ''
            let response = null;
            if (!cliente.id) {
                response = await api.post(url, formData)
                msg = 'Cliente adicionado'
            } else {
                response = await api.put(url, formData)
                msg = 'Cliente alterado'
            }
            successAlert(msg, response.data)
        } catch (error) {
            console.error(error)
            if (error.response && error.response.status == 400) {
                const response = error.response
                notify('danger', 'Alguns campos estão inválidos')
                if (response.data.length) {
                    const responseError = {}
                    for (let e of response.data) {
                        responseError[e.field] = e.message
                    }
                    setErros(responseError)
                }
            } else {
                notify('danger', 'Não foi possível salvar cliente.')
            }
        }
        setSaving(false)
    }


    const successAlert = (msg, cliente = {}) => {
        setAlert(
            <ReactBSAlert
                success
                style={{ display: "block", marginTop: "-100px", maxWidth: "500px" }}
                title={msg}
                onConfirm={() => onSuccess ? onSuccess(cliente) : history.goBack()}
                confirmBtnBsStyle="success"
                showConfirm={false}
                btnSize=""
            />
        )
        setTimeout(e => { onSuccess ? onSuccess(cliente) : history.goBack() }, 2000);
    };

    const notify = (type, msg) => {
        let options = {
            place: "tc",
            message: (
                <div className="alert-text">
                    <span data-notify="message">
                        {msg}
                    </span>
                </div>
            ),
            type: type,
            icon: "ni ni-bell-55",
            autoDismiss: 3
        };
        if (notificationAlert.current) notificationAlert.current.notificationAlert(options);
    };

    const EmailInputGoup = () => {
        return <>
            {
                <InputGroupAddon addonType="append">
                    <Button
                        title={"Enviar E-mail"}
                        color="primary"
                        disabled={email && clienteId ? false : true}
                        onClick={() => setShowEmailAvulso(true)}
                        outline>
                        <span className="btn-inner--icon">
                            <i className={"fas fa-envelope"}></i>
                        </span>
                    </Button>
                </InputGroupAddon>
            }
        </>
    }

    return (
        <>
            <div className="rna-wrapper">
                <NotificationAlert ref={notificationAlert} />
            </div>
            {alert}
            <Container
                ref={mainContainer}
                className={showHeader ? "mt--6" : 'm-0 p-0'}
                fluid={showHeader}
            >
                <LinksModal
                    show={showLinks}
                    hidde={handleHiddeLinks}
                    cliente_id={cliente.id}
                />

                <EnviarEmailModal
                    show={showEmailAvulso}
                    hidde={handleHiddeEmailAvulso}
                    cliente_id={cliente.id}
                    cliente_nome={cliente.nome}
                    cliente_email={email}
                    oportunidade_id={oportunidadeId}
                    notify={notify}
                />

                <Card>
                    {
                        showHeader &&
                        <CardHeader
                            style={{
                                position: 'sticky',
                                top: 0,
                                zIndex: 2,
                            }}>
                            <h1>{cliente.id ? 'Alterar Cliente' : 'Novo Cliente'}</h1>
                        </CardHeader>
                    }
                    <CardBody>
                        {
                            cliente.id &&
                            <Button
                                color="primary"
                                type="button"
                                size='sm'
                                className="btn-icon btn-3"
                                onClick={handleShowLinks}
                            >
                                <span className="btn-inner--icon">
                                    <i className="fas fa-link"></i>
                                </span>
                                <span className="btn-inner--text">Gerar afiliação</span>
                            </Button>
                        }
                        <Row>
                            <Col sm="12" md="12" lg="6">
                                <Row>
                                    <Col sm="12" md="12" lg="12" >
                                        <FormGroup>
                                            <legend class="w-auto" style={{ margin: 0 }}>
                                                <label className="form-control-label" >
                                                    Tipo de pessoa*
                                                </label>
                                            </legend>
                                            <Select2
                                                className="form-control"
                                                onSelect={(e) => setTipoPessoa(e.target.value)}
                                                value={tipoPessoa}
                                                data={tiposPessoas}
                                            />
                                            <small class="text-danger">
                                                {erros.tipo_pessoa || ""}
                                            </small>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm='12' md="12" lg="6" >
                                        <FormGroup>
                                            <legend class="w-auto" style={{ margin: 0 }}>
                                                <label className="form-control-label" >
                                                    {tipoPessoa == 'F' ? 'CPF' : 'CNPJ'}
                                                </label>
                                            </legend>
                                            <InputMask
                                                placeholder={tipoPessoa == 'F' ? 'Informe o CPF...' : 'Informe o CNPJ...'}
                                                className="form-control"
                                                maskPlaceholder={null}
                                                mask={tipoPessoa == 'F' ? "999.999.999-99" : "99.999.999/9999-99"}
                                                value={cpfCnpj}
                                                onChange={e => setCpfCnpj(e.target.value)}
                                            />
                                            <small class="text-danger">
                                                {erros.cpf_cnpj || ""}
                                            </small>
                                        </FormGroup>
                                    </Col>
                                    <Col sm='12' md="12" lg="6" >
                                        <FormGroup>
                                            <legend className="w-auto" style={{ margin: 0 }}>
                                                <label className="form-control-label" >
                                                    {tipoPessoa == 'F' ? 'Data de nascimento' : 'Data da fundação'}
                                                </label>
                                            </legend>
                                            <ReactDatetime
                                                value={dataNascimento}
                                                inputProps={{
                                                    placeholder: tipoPessoa == 'F' ? 'Data de nascimento...' : 'Data da fundação...'
                                                }}
                                                isValidDate={current => {
                                                    return current.isBefore(new Date(new Date().setDate(new Date().getDate())));
                                                }}
                                                locale={'pt-br'}
                                                dateFormat='DD/MM/YYYY'
                                                timeFormat={false}
                                                onChange={e => setDataNascimento(e)}
                                            />
                                            <small className="text-danger">
                                                {erros.data_nascimento || ""}
                                            </small>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm="12" md="12" lg="12">
                                        <FormGroup>
                                            <legend className="w-auto" style={{ margin: 0 }}>
                                                <label className="form-control-label" >
                                                    {tipoPessoa == 'F' ? 'Nome*' : 'Razão social*'}
                                                </label>
                                            </legend>
                                            <Input
                                                placeholder={tipoPessoa == 'F' ? 'Informe o nome da pessoa...' : 'Informe a razão social...'}
                                                className="form-control"
                                                value={nome}
                                                onChange={e => setNome(e.target.value)}
                                            />
                                            <small className="text-danger">
                                                {erros.nome || ""}
                                            </small>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm='12' md="12" lg="12" >
                                        <FormGroup>
                                            <legend className="w-auto" style={{ margin: 0 }}>
                                                <label className="form-control-label" >
                                                    Email
                                                </label>
                                            </legend>
                                            <InputGroup >
                                                <EmailInputContainer>
                                                    <Input
                                                        placeholder={'Email...'}
                                                        className="form-control"
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                    />
                                                </EmailInputContainer>
                                                <EmailInputGoup />
                                            </InputGroup>
                                            <small className="text-danger">
                                                {erros.email || ""}
                                            </small>
                                        </FormGroup>
                                    </Col>

                                </Row>
                                <Row>
                                    {
                                        tipoPessoa == 'F' ?
                                            <Col sm="12" md="12" lg="12">
                                                <FormGroup>
                                                    <legend className="w-auto" style={{ margin: 0 }}>
                                                        <label className="form-control-label" >
                                                            Sexo*
                                                        </label>
                                                    </legend>
                                                    <Select2
                                                        className="form-control"
                                                        onSelect={(e) => setSexo(e.target.value)}
                                                        value={sexo}
                                                        data={sexos}
                                                    />
                                                    <small className="text-danger">
                                                        {erros.sexo || ""}
                                                    </small>
                                                </FormGroup>
                                            </Col>
                                            :
                                            <Col sm="12" md="12" lg="12">
                                                <FormGroup>
                                                    <legend className="w-auto" style={{ margin: 0 }}>
                                                        <label className="form-control-label" >
                                                            Contato
                                                        </label>
                                                    </legend>
                                                    <Input
                                                        placeholder='Nome do contato na empresa...'
                                                        className="form-control"
                                                        value={pessoaContato}
                                                        onChange={e => setPessoaContato(e.target.value)}
                                                    />
                                                    <small className="text-danger">
                                                        {erros.pessoa_contato || ""}
                                                    </small>
                                                </FormGroup>
                                            </Col>
                                    }
                                </Row>
                                <Row>
                                    <Col sm="12" md="12" lg="12">
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
                                                    className="bootstrap-tagsinput"
                                                    onChange={handleTags}
                                                    tagProps={{ className: "tag badge badge-primary mr-1" }}
                                                    value={tags}
                                                    inputProps={{
                                                        className: "",
                                                        placeholder: "Adicionar tags..."
                                                    }}
                                                />
                                            </div>
                                            <small className="text-danger">
                                                {erros.tags || ""}
                                            </small>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm="12" md="12" lg="6">
                                <Row>
                                    <Col sm="12" md="12" lg="12">
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <h3>Telefones</h3>
                                        </div>
                                        <Telefones
                                            notify={notify}
                                            clienteId={cliente.id}
                                            onTelefonesChange={setTelefones}
                                            alert={setAlert}
                                        />
                                        <small className="text-danger">
                                            {erros.telefones || ""}
                                        </small>
                                    </Col>
                                    <Col sm="12" md="12" lg="12">
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <h3>Redes Sociais</h3>
                                        </div>
                                        <RedesSocias
                                            notify={notify}
                                            clienteId={cliente.id}
                                            onRedesSociaisChanged={setRedesSociais}
                                            alert={setAlert}
                                        />
                                        <small className="text-danger">
                                            {erros.enderecos_eletronicos || ""}
                                        </small>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </CardBody>
                    <CardFooter
                        style={showHeader ? {
                            position: "sticky",
                            bottom: 0,
                            border: "2 solid",
                            boxShadow: "0px 0px 2px 2px #f5f5f5",
                            zIndex: "9"
                        } : {}}
                    >
                        <Row>
                            <Col>
                                <div className="float-right ">
                                    {
                                        <>
                                            <Button
                                                className="ml-auto"
                                                color="link"
                                                data-dismiss="modal"
                                                type="button"
                                                onClick={() => goBack ? goBack() : history.goBack()}
                                            >
                                                Voltar
                                            </Button>
                                            <Button
                                                color="primary"
                                                type="submit"
                                                disabled={saving}
                                                onClick={handleSave}>
                                                {
                                                    saving &&
                                                    <Spinner
                                                        size='sm'
                                                        color='secondary'
                                                        className='mr-2'
                                                    />
                                                }
                                                Salvar
                                            </Button>
                                        </>
                                    }
                                </div>
                            </Col>
                        </Row>
                    </CardFooter>
                </Card>
            </Container>
        </>
    );
}
