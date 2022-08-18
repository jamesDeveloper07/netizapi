import React, { useState, useEffect, useContext, useRef } from 'react';
import SiteEmpresa from '../../../../entities/Common/SiteEmpresa';
import { Anuncio } from '../../../../entities/Marketing';
import api from '../../../../services/api';
import EmpresaContext from "../../../../contexts/Empresa";
import { bindErrors } from '../../../../utils'

import LinkForm from "./Form";
import List from "./List";
// @ts-ignore
import Select2 from "react-select2-wrapper";
import ReactQuill from "react-quill";
import ReactDatetime from "react-datetime";
import moment from 'moment';
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Modal,
    Row,
    Col,
    Spinner,
    PopoverBody,
    UncontrolledPopover
} from "reactstrap";
// @ts-ignore
import NotificationAlert from "react-notification-alert";


// import { Container } from './styles';
type Props = {
    show: boolean,
    hidde(): void,
    cliente_id: number,
    cliente_nome?: string,
    cliente_email?: string,
    oportunidade_id: number,
    notify(tipo: any, msg: any): void,
    emailAvulso: any,
}

const EmailAvulso: React.FC<Props> = ({ show, hidde, cliente_id, cliente_nome, cliente_email, oportunidade_id, notify, emailAvulso}) => {

    const { empresaSelecionada } = useContext(EmpresaContext)

    const [emailsEmpresa, setEmailsEmpresa] = useState([]);

    const [data_agendamento, setData_agendamento] = useState();
    const [data_envio, setData_envio] = useState();
    const [sender, setSender] = useState(null);
    const [subject, setSubject] = useState('');
    const [bodyText, setBodyText] = useState('');
    const [erros, setErros] = useState({});

    const [readOnly, setReadOnly] = useState(false)

    const [saving, setSaving] = useState(false)

    const notificationAlert = useRef()

    useEffect(() => {
        if (!cliente_id) return
        load()
    }, [cliente_id])

    useEffect(() => {
        if (!emailAvulso) return
        setReadOnly(true)
        setData_agendamento(emailAvulso.data_agendamento);
        setData_envio(emailAvulso.data_envio);
        setSender(emailAvulso.remetente_id);
        setSubject(emailAvulso.assunto);
        setBodyText(emailAvulso.conteudo);
    }, [emailAvulso])

    function handleHiddeModal() {
        hidde()
        setSaving(false)
    }

    function handleSave() {
        insert();
    }

    async function load() {
        await loadEmailsEmpresa()
    }

    async function loadEmailsEmpresa() {
        try {
            const response = await api.get(`/common/empresas/${empresaSelecionada?.id}/emails?situacao=A`);
            setEmailsEmpresa(response.data)
        } catch (error) {
            notifyHere('danger', 'Houve um problema ao carregar lista de emails da empresa.');
            throw error
        }
    }


    const notifyHere = (type: any, msg: any) => {
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
        // @ts-ignore
        if (notificationAlert.current) notificationAlert.current.notificationAlert(options);
    };

    async function insert() {
        setSaving(true)
        try {
            await api.post(`marketing/empresas/${empresaSelecionada?.id}/emails_avulsos`, {
                remetente_id: sender,
                destinatario: cliente_email,
                assunto: subject,
                conteudo: bodyText,
                origem: oportunidade_id && oportunidade_id > 0 ? 'oportunidade' : 'cliente',
                origem_id: oportunidade_id && oportunidade_id > 0 ? oportunidade_id : cliente_id,
                situacao: 'A',
                data_agendamento
            })

            notify('success', 'E-mail preparado para o envio com sucesso')
            handleHiddeModal()
        } catch (error) {
            console.error(error)
            // @ts-ignore
            if (error.response) {
                // @ts-ignore
                const errorMessage = bindErrors(error.response.data)
                if (errorMessage) {
                    errorMessage instanceof String
                        ? notifyHere('danger', errorMessage)
                        : setErros(errorMessage)
                } else {
                    notifyHere('danger', 'Não foi possível enviar e-mail')
                }
            }
        } finally {
            setSaving(false)
        }
    }


    return (
        <>
            <Modal
                className="modal-dialog-centered"
                isOpen={show}
                size='lg'
                toggle={handleHiddeModal}
            >
                <div className="rna-wrapper">
                    <NotificationAlert ref={notificationAlert} />
                </div>

                <div className="modal-header" style={{ paddingBottom: 10 }}>
                    <h5 className="modal-title" id="exampleModalLabel">
                        {emailAvulso ? 'Detalhes Email' : 'Enviar Email'}
                    </h5>
                    <button
                        aria-label="Close"
                        className="close"
                        data-dismiss="modal"
                        type="button"
                        onClick={handleHiddeModal}
                    >
                        <span aria-hidden={true}>×</span>
                    </button>
                </div>
                <div className="modal-body" style={{ paddingTop: 0 }}>
                    {/* <div className="text-center mb-2"></div> */}

                    <div style={{ paddingTop: 0 }}>
                        {oportunidade_id &&
                            <h5 style={{ marginBottom: 0 }}>
                                {/* {`Grupo Estratégico: ${grupoEstrategico ? grupoEstrategico.nome : ''}`} */}
                                {`Oportunidade: #${oportunidade_id}`}
                            </h5>
                        }

                        <h5 style={{ marginBottom: 0 }}>
                            {/* {`Estratégia: ${estrategia ? estrategia.nome : ''}`} */}
                            {`Cliente: ${cliente_nome}`}
                        </h5>

                        {/* @ts-ignore */}
                        <h5 style={{ marginBottom: 20 }}>
                            {`E-mail: ${cliente_email}`}
                        </h5>
                    </div>

                    <Row>
                        <Col lg="6" sm="12" md="12">
                            <FormGroup>
                                <legend className="w-auto" style={{ margin: 0 }}>
                                    <label
                                        className="form-control-label"
                                    >
                                        Data de agendamento*
                                    </label>
                                </legend>
                                <InputGroup className="input-group" >
                                    {/* @ts-ignore    */}
                                    <ReactDatetime
                                        closeOnSelect={true}
                                        isValidDate={current => {
                                            return current.isAfter(new Date(new Date().setDate(new Date().getDate() - 1)));
                                        }}
                                        locale={'pt-br'}
                                        value={
                                            data_agendamento
                                                ? moment(data_agendamento)
                                                : null
                                        }
                                        inputProps={{
                                            placeholder: "Data de agendamento...",
                                            name: "data_agendamento",
                                            id: "data_agendamento",
                                            autocomplete: "off",
                                            disabled: readOnly
                                        }}
                                        dateFormat="DD/MM/YYYY"
                                        timeFormat='HH:mm'
                                        // @ts-ignore
                                        onChange={e => setData_agendamento(e)}
                                    />
                                    {
                                        !readOnly &&
                                        <InputGroupAddon addonType="append"  >
                                            <InputGroupText
                                                style={{
                                                    padding: '10px'
                                                }}>
                                                <i className="far fa-calendar-alt" />
                                            </InputGroupText>
                                        </InputGroupAddon>
                                    }

                                </InputGroup>
                                <small className="text-danger">
                                    {/* @ts-ignore */}
                                    {erros.data_agendamento || ""}
                                </small>
                            </FormGroup>
                        </Col>
                        <Col lg="6" sm="12" md="12">
                            <FormGroup>
                                <label className="form-control-label">
                                    Remetente*
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
                                            Informe o email que vai ser usado como remetente...
                                        </PopoverBody>
                                    </UncontrolledPopover>
                                </label>
                                <Select2
                                    className="form-control"
                                    value={sender}
                                    options={{
                                        placeholder: "Remetente..."
                                    }}
                                    disabled={readOnly}
                                    // @ts-ignore
                                    onSelect={e => setSender(e.target.value)}
                                    // @ts-ignore
                                    data={emailsEmpresa.map(email => ({ text: email.email, id: email.id }))}
                                />
                                <small className="text-danger">
                                    {/* @ts-ignore */}
                                    {erros.email_remetente_id || ''}
                                </small>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col sm="12" md="12" lg="12">
                            <FormGroup>
                                <label className="form-control-label" >
                                    Assunto*
                                </label>
                                <Input
                                    placeholder='Informe o assunto do email...'
                                    className="form-control"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    disabled={readOnly}
                                />
                                <small className="text-danger">
                                    {/* @ts-ignore */}
                                    {erros.email_assunto || ""}
                                </small>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg="12" sm="12" md="12">
                            <FormGroup>
                                <label className="form-control-label">
                                    Conteúdo*
                                    <Button
                                        color="secondary"
                                        id="tooltipConteudoEmail"
                                        outline
                                        size="sm"
                                        type="button">
                                        ?
                                    </Button>
                                    <UncontrolledPopover placement="top" target="tooltipConteudoEmail">
                                        <PopoverBody>
                                            Informe o texto que será enviado no corpo do email...
                                        </PopoverBody>
                                    </UncontrolledPopover>
                                </label>

                                <ReactQuill
                                    value={bodyText || ""}
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
                                    onChange={v => setBodyText(v)}
                                    readOnly={readOnly}
                                />
                                <small className="text-danger">
                                    {/* @ts-ignore */}
                                    {erros.email_conteudo || ''}
                                </small>
                            </FormGroup>
                        </Col>
                    </Row>

                </div>
                <div className="modal-footer">
                    <Button
                        color="link"
                        data-dismiss="modal"
                        type="button"
                        onClick={handleHiddeModal}
                    >
                        Fechar
                    </Button>

                    {!readOnly &&
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
                    }

                </div>
            </Modal>
        </>
    );
}

export default EmailAvulso;