import React, { useState, useEffect, useRef, useContext } from 'react';
import EmpresaContext from "../../../contexts/Empresa";
import MensagemContext, { IChat as MessageChat } from '../../../contexts/Mensagem'
import api from "../../../services/api";

import { Cliente } from "../../../entities/Common";
import { Mensagem } from "../../../entities/Marketing";
//@ts-ignore
import NotificationAlert from "react-notification-alert";
import Messages from "./Messages";
import {
    Input,
} from "reactstrap";
import {
    Container,
    MessageContainer,
    SendButton,
    ContentMessage,
    ConersationContainer,
    Header,
    ClienteDetailContainer
} from './styles';

export interface IChat {
    canal: string,
    contato: string,
    cliente_id: number
    close?(): void
}

interface IError {
    texto: string,
    tipo: string,
    template_id: string,
    template_fields: string,
    canal: string
}

const Chat: React.FC<IChat> = ({ canal, contato, cliente_id }) => {


    const { chats, isConnected, sendMessage, newChat, createKey, findChat } = useContext(MensagemContext)
    const { empresaSelecionada } = useContext(EmpresaContext)

    const [texto, setTexto] = useState('')
    const [chat, setChat] = useState<MessageChat | undefined>()
    const [cliente, setCliente] = useState({} as Cliente)
    const [sending, setSending] = useState(false)
    const [erros, setErros] = useState({} as IError)

    const notificationRef = useRef<NotificationAlert>(null)
    const conversationRef = useRef<HTMLDivElement>(null)


    useEffect(() => {
        loadCliente()
    }, [cliente_id])

    useEffect(() => {
        const chat = findChat(createKey(canal, contato))
        setChat(chat)
    }, [chats])


    useEffect(() => {
        if (canal && contato && cliente_id) newChat(canal, contato, cliente_id)
        scrollToBottom()
    }, [canal, contato, cliente_id, isConnected, chats])


    function scrollToBottom() {
        conversationRef.current?.scrollTo(0, conversationRef.current?.scrollHeight)
    }

    async function handleEnterSenMessage(event: React.KeyboardEvent) {
        if (event.key === 'Enter' && !sending) {
            await handleSendMessage(event as unknown as React.MouseEvent)
        }
    }

    async function handleSendMessage(event: React.MouseEvent) {
        event.preventDefault()
        setErros({} as IError)
        setSending(true)
        try {
            await sendMessage(texto, canal, contato, cliente_id)
            setTexto('')
        } catch (error) {
            console.error(error)
            notify('danger', 'Não conseguimos enviar sua mensagem')
            if (error.response) {
                const { response } = error
                if (response?.status === 500) {
                    const message = response?.data?.message
                    if (message) notify('danger', message)
                } else if (response?.status === 400) {
                    updateErrors(response.data)
                }
            }
        } finally {
            setSending(false)
        }
    }



    function updateErrors(reponseError: Array<Object>) {
        if (reponseError) {
            const responseError = {}
            for (let e of reponseError) {
                //@ts-ignore
                responseError[e.field] = e.message
            }
            setErros(responseError as IError)
        }
    }

    async function loadCliente() {
        if (!cliente_id) return
        try {
            const response = await api.get(`/common/empresas/${empresaSelecionada?.id}/clientes/${cliente_id}`)
            const data = await response.data
            setCliente(data)
        } catch (error) {
            console.error(error)
            notify('danger', 'Não conseguimos encontrar os dados do cliente')
        }
    }

    const notify = (type: 'danger' | 'success', msg: string) => {
        let options = {
            place: "tc",
            message: (
                <div className="alert-text" style={{ zIndex: 100 }}>
                    <span data-notify="message">
                        {msg}
                    </span>
                </div>
            ),
            type: type,
            autoDismiss: 3
        };
        if (notificationRef.current) notificationRef.current.notificationAlert(options);
    };

    return (
        <Container>
            <NotificationAlert ref={notificationRef} />
            <Header>
                <a
                    className="avatar rounded-circle ml-2 mr-2 avatar-sm "
                    style={{ cursor: 'default' }}
                    href="#pablo"
                    onClick={e => e.preventDefault()}
                >
                    <i className="ni ni-single-02"></i>
                </a>
                <ClienteDetailContainer>
                    <h5>
                        {cliente?.nome}
                    </h5>
                    <small
                        title={canal}
                        style={{ marginTop: -10 }}
                        className='text-muted'>
                        <i className={`mr-1 ${canal === 'whatsapp' ? 'fab fa-whatsapp' : 'far fa-comments'}`}></i>
                        {`${contato}`}
                    </small>
                </ClienteDetailContainer>
            </Header>
            <ConersationContainer
                ref={conversationRef}
            >
                <Messages
                    mensagens={chat?.mensagens}
                />
            </ConersationContainer>
            <MessageContainer>
                <ContentMessage>
                    <Input
                        readOnly={sending}
                        className="form-control-flush"
                        placeholder="Mensagem..."
                        onKeyDown={handleEnterSenMessage}
                        type="text"
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                    />
                    <SendButton
                        className="btn-icon-only rounded-circle"
                        color="twitter"
                        type='button'
                        disabled={sending}
                        onClick={handleSendMessage}
                    >
                        <span className="btn-inner--icon">
                            <i className="ni ni-send"></i>
                        </span>
                    </SendButton>
                </ContentMessage>
                <small className='text-danger'>
                    {erros.texto}
                </small>
            </MessageContainer>
        </Container>
    )
}
export default Chat;