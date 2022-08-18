import React, { useState, useEffect, useContext, createContext } from 'react';
import api from '../services/api'
import ws, { AdonisSocket, Subscription, SocketMessage } from '../services/socket'

import EmpresaContext from './Empresa'
import { Empresa } from "../entities/Common"
import { Mensagem } from "../entities/Marketing"

export interface IChat {
    contato: string,
    needUpdated: boolean,
    canal: string,
    cliente_id: number,
    page: number,
    lastPage: number,
    mensagens: Array<Mensagem>,
}

interface IMensagemContextData {
    newChat(canal: string, contato: string, cliente_id: number): Promise<void>,
    chats: Map<string, IChat>,
    isConnected: boolean,
    loadings: Array<String>,
    createKey(canal: string, contato: string): string,
    findChat(key: string): IChat | undefined,
    sendMessage(texto: string, canal: string, contato: string, cliente_id: number,): Promise<void>,
}

interface IMensagemProvider {

}

const MensagemContext = createContext<IMensagemContextData>({} as IMensagemContextData)


export const MensagemProvider: React.FC<IMensagemProvider> = ({ children }) => {

    const { empresaSelecionada } = useContext(EmpresaContext)
    const [chats, setChats] = useState(new Map<string, IChat>())
    const [isConnected, setConnected] = useState(false)
    const [loadings, setLoadings] = useState(new Array<string>())
    const [socketMessage, setSocketMessage] = useState({} as SocketMessage)

    useEffect(() => {
        connectSocket()
    }, [])

    useEffect(() => {
        updateChats()
    }, [chats])


    useEffect(() => {
        if (socketMessage.obj) {
            onMessage(socketMessage)
        }
    }, [socketMessage])

    function connectSocket() {
        ws.connect()
    }


    function findChat(key: string): IChat | undefined {
        return chats.get(key)
    }

    function createKey(canal: string, contato: string): string {
        return `${canal}:${contato}`
    }

    async function updateChats() {
        for (let chat of Array.from(chats.values())) {
            if (chat.needUpdated) {
                chat.needUpdated = false
                await updateChatMessage(chat.canal, chat.contato, chat.cliente_id)
            }
        }
    }

    async function updateChatMessage(canal: string, contato: string, cliente_id: number) {
        const key = createKey(canal, contato)
        startLoading(key)
        try {
            const response = await api.get(`common/empresas/${empresaSelecionada?.id}/clientes/${cliente_id}/contato/${contato}/mensagens`,
                {
                    params: {
                        canal
                    }
                })
            const data = await response.data
            updateMensagens(key, data.data)
        } catch (error) {
            console.error(error)
        } finally {
            stopLoading(key)
        }
    }

    function startLoading(key: string) {
        if (!loadings.includes(key)) {
            setLoadings([
                ...loadings,
                key
            ])
        }
    }

    function stopLoading(key: string) {
        if (loadings.includes(key)) {
            setLoadings(loadings.filter(item => item != key))
        }
    }

    function updateMensagens(key: string, list: Array<Mensagem>) {
        for (let msg of list) {
            pushMensagem(key, msg)
        }
    }

    /*
     * Adiciona uma nova mensagem ao chat da key informada no parametro
     * 
     * @param key 
     * @param mensagem 
     */
    function pushMensagem(key: string, mensagem: Mensagem) {
        if (!mensagem) return
        const chat = findChat(key)
        if (chat) {
            const mensagemNochat = findMensagem(mensagem.id, key)
            if (mensagemNochat) {
                mensagemNochat.data_confirmacao_envio = mensagem.data_confirmacao_envio
                mensagemNochat.data_falha = mensagem.data_falha
                mensagemNochat.data_leitura = mensagem.data_leitura
                mensagemNochat.data_recebimento = mensagem.data_recebimento
            } else {
                chat.mensagens.push(mensagem)
            }
            updateChat(key, chat)
        }
    }

    function findMensagem(mensagem_id: number, key: string): Mensagem | undefined {
        const chat = findChat(key)
        if (chat) {
            return chat.mensagens.find(item => item.id === mensagem_id)
        }
    }

    function updateChat(key: string, chat: IChat) {
        const chatsClone = new Map(chats)
        chatsClone.set(key, chat)
        setChats(chatsClone)
    }

    function getSubscription(key: string): Subscription | undefined {
        return ws.getSubscription(`empresa:${empresaSelecionada?.id}:mensagem:${key}`)
    }

    async function newChat(canal: string, contato: string, cliente_id: number): Promise<void> {
        if (!ws.ws) {
            setTimeout(() => newChat(canal, contato, cliente_id), 2000)
            return
        }
        const key = createKey(canal, contato)
        const subscription = getSubscription(key)
        if (!subscription) {
            const topic = `empresa:${empresaSelecionada?.id}:mensagem:${key}`
            const newSubscription = ws.subscribe(topic, setSocketMessage)

            //@ts-ignore
            newSubscription?.on('ready', async (e) => {
                console.log('Subscription done ', key);
                const chatClone = new Map(chats)
                chatClone.set(key, {
                    contato,
                    canal,
                    needUpdated: true,
                    page: 0,
                    lastPage: 0,
                    cliente_id,
                    mensagens: new Array<Mensagem>()
                })
                setChats(chatClone)
            })
        }
    }

    function onMessage(socketMessage: SocketMessage) {
        if (socketMessage.obj) {
            const obj = socketMessage.obj
            const key = `${obj.canal}:${obj.origem === 'in' ? obj.remetente : obj.destinatario}`
            pushMensagem(key, obj)
        }
    }

    async function sendMessage(texto: string, canal: string, contato: string, cliente_id: number,): Promise<void> {
        const key = createKey(canal, contato)
        const subscription = getSubscription(key)
        if (subscription) {
            subscription.on('message', onMessage)
            subscription.eventsSeted = true
        }
        await api.post(`/common/empresas/${empresaSelecionada?.id}/clientes/${cliente_id}/contato/${contato}/mensagens`,
            {
                texto,
                canal,
                tipo: 'text'
            })
    }


    return (
        <MensagemContext.Provider
            value={{
                chats,
                isConnected,
                loadings,
                newChat,
                createKey,
                findChat,
                sendMessage
            }}
        >
            {
                children
            }
        </MensagemContext.Provider>
    )
}

export default MensagemContext