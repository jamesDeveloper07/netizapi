import React from 'react';

import { IChat } from '../index'

import Chat from '../index'
import {
    Modal,
} from "reactstrap";


type ChatModalProps = IChat & {
    show: boolean,
}

const ChatModal: React.FC<ChatModalProps> = ({
    show,
    close,
    canal,
    contato,
    cliente_id,
}) => {
    return (
        <Modal
            className="modal-dialog-centered"
            isOpen={show}
            toggle={close}
        >
            <div className="modal-body">
                <Chat
                    close={close}
                    canal={canal}
                    contato={contato}
                    cliente_id={cliente_id}
                />
            </div>
        </Modal>
    )
}

export default ChatModal;