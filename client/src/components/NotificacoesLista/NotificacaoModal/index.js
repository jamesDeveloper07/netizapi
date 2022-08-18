import React, { useEffect, useState } from 'react';
import moment from 'moment'

import classnames from "classnames";
import {
    Button,
    Row,
    Col,
    Modal,
} from "reactstrap";


export default ({ show, onHidden, notificacao, onConferir, onMarcarComoLida }) => {

    useEffect(() => {

    }, [show])

    function handleConfirm() {
        onConferir()
    }

    function handleMarcar() {
        onMarcarComoLida()
    }

    function formartDate(dt) {
        // var options = { year: "numeric", month: "long", day: "numeric" };
        // const date = dt ? new Date(dt) : null;
        // return date ? date.toLocaleDateString("pt-br", options) : '';
        return dt ? moment(dt).format('DD/MM/YYYY HH:mm') : null;        
    }

    return (
        <>
            <Modal
                className="modal-dialog-centered"
                isOpen={show}
                toggle={onHidden}
            >
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                        {/* {notificacao?.titulo} */}
                        <i className='fas fa-bullhorn'></i>
                        {`  Notificação`}
                    </h5>
                    <button
                        aria-label="Close"
                        className="close"
                        data-dismiss="modal"
                        type="button"
                        onClick={onHidden}
                    >
                        <span aria-hidden={true}>×</span>
                    </button>
                </div>

                <div className="modal-body">
                    <h4>
                        {notificacao?.titulo}
                    </h4>

                    <div
                        style={{
                            textAlign: 'left'
                        }}
                        className='mb-4'>
                        <br></br>
                        {notificacao?.mensagem}
                    </div>

                    {/* <div
                        style={{
                            textAlign: 'center',
                            fontSize: 'small'
                        }}
                        className='text-muted mb-4'>
                        {notificacao?.titulo}
                    </div> */}

                    <div style={{
                        textAlign: 'right',
                        fontSize: '10px',
                        marginBottom: '-25px'
                    }}
                        >
                        <br></br>
                        Enviada em: {formartDate(notificacao?.sended_at)}
                        {notificacao?.readed_at ?
                            <>
                                <br></br>
                                Lida em: {formartDate(notificacao.readed_at)}
                            </>
                            :
                            <></>
                        }

                    </div>
                </div>

                <div className="modal-footer">
                    <Button
                        color="link"
                        data-dismiss="modal"
                        type="button"
                        onClick={onHidden}
                    >
                        Fechar
                        </Button>
                    <Button
                        hidden={notificacao?.acao_clique_url ? false : true}
                        color="primary"
                        onClick={handleConfirm}
                        type="button">
                        Conferir
                    </Button>
                    <Button
                        hidden={notificacao?.readed_at ? true : false}
                        color="primary"
                        onClick={handleMarcar}
                        type="button">
                        Marcar como lida
                    </Button>
                </div>
            </Modal>
        </>
    );
}
