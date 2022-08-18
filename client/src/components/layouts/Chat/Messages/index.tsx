import React, { useContext, } from 'react';
import EmpresaContext from '../../../../contexts/Empresa'
import moment from "moment";
import {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
    Marker
} from "react-google-maps";

import { Mensagem } from "../../../../entities/Marketing";

import {
    BalaoMensagem,
    BalaoContainer,
    BalaoMensagemCol,
    BalaoMensagemRow
} from './styles';

interface IMessage {
    mensagens?: Array<Mensagem>,
}

const Message: React.FC<IMessage> = ({ mensagens }) => {

    const { empresaSelecionada } = useContext(EmpresaContext)

    return (
        <>
            {
                mensagens?.map((item, key) => (
                    <BalaoContainer
                        key={key}
                        origem={item.origem}
                    >
                        <>
                            {
                                <a
                                    className="avatar rounded-circle ml-2 mr-2 avatar-sm"
                                    style={{ cursor: 'default' }}
                                    href="#pablo"
                                    onClick={e => e.preventDefault()}
                                >
                                    {
                                        item.origem === 'out' && empresaSelecionada?.logo ?
                                            <img alt="..." src={empresaSelecionada?.logo_url} />
                                            :
                                            <i className="ni ni-single-02"></i>
                                    }
                                </a>
                            }
                        </>
                        <BalaoMensagem
                            origem={item.origem}
                        >
                            <BalaoMensagemRow className='mb-2'>
                                <BalaoMensagemCol>
                                    <small
                                        title='Data de envio'
                                        className={`text-muted ${item.origem === 'out' ? 'text-white' : 'text-black'}`}>
                                        {
                                            item.origem === 'out' && item.data_confirmacao_envio ?
                                                `${moment(item.data_confirmacao_envio).format('DD MMM YYYY, hh:mm')}`
                                                :
                                                `${moment(item.created_at).format('DD MMM YYYY, hh:mm')}`
                                        }
                                    </small>
                                </BalaoMensagemCol>
                            </BalaoMensagemRow>
                            {
                                (item.tipo === 'file' && item.file_mime_type?.includes('image'))
                                    ?
                                    <img
                                        alt={item.texto}
                                        src={item.file_url}
                                        width={'100%'}
                                    />
                                    :
                                    (item.tipo === 'file' && item.file_mime_type?.includes('audio'))
                                        ?
                                        <audio autoPlay={false} controls={true}>
                                            <source src={item.file_url} type="audio/mp3" />
                                        </audio>
                                        :
                                        (item.tipo === 'file' && item.file_mime_type?.includes('video'))
                                            ?
                                            < video width="320" height="240" controls={true}>
                                                <source src={item.file_url} type={item.file_mime_type}>
                                                </source>
                                            </video>
                                            :
                                            item.texto
                            }
                            <BalaoMensagemRow className='mt-2'>
                                <BalaoMensagemCol>
                                    {
                                        item.origem === 'out' &&
                                        <i
                                            title={item.descricao_falha}
                                            style={{ fontSize: 11 }}
                                            className={
                                                item.data_leitura ?
                                                    'fas fa-check-double'
                                                    :
                                                    (item.data_recebimento || item.data_confirmacao_envio) ?
                                                        'fas fa-check'
                                                        :
                                                        item.data_falha ?
                                                            'fas fa-exclamation-circle'
                                                            :
                                                            "far fa-clock"
                                            }
                                        ></i>
                                    }
                                </BalaoMensagemCol>
                            </BalaoMensagemRow>
                        </BalaoMensagem>
                    </BalaoContainer>
                ))
            }
        </>
    )
}

export default Message;