import React, { useState } from 'react';
import {
    SiteEmpresa,
    Empresa
} from '../../../../../entities/Common';
import api from '../../../../../services/api';

import Form from "../Form";
import Categoria from "../Categoria";
import {
    Button,
    ListGroupItem,
    ListGroup,
    Row,
} from "reactstrap";


// import { Container } from './styles';

type Props = {
    site: SiteEmpresa,
    notify(type: string, msg: string): void,
    onDeleted(): void,
    empresa: Empresa
}

const Item: React.FC<Props> = ({
    site,
    notify,
    onDeleted,
    empresa
}) => {

    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [showCategoria, setShowCategoria] = useState(false)

    function hideForm() {
        setShowForm(false)
    }

    function hideCategoria() {
        setShowCategoria(false)
    }

    function handleShowForm(event: React.MouseEvent) {
        event.preventDefault()
        setShowForm(true)
    }

    function handleShowCategoria(event: React.MouseEvent) {
        event.preventDefault()
        setShowCategoria(true)
    }

    async function handleDelete() {
        // Exibindo uma mensagem para confirmação se quer deletar.
        const ok = window.confirm("Deseja realmente apagar esse site?")
        if (ok == false) return
        try {
            setLoading(true)
            await api.delete(`/Common/Empresas/${site.empresa_id}/sites-empresas/${site.id}`)
            await onDeleted()

        } catch (error) {
            console.log(error)
            notify('danger', 'Não foi possível remover o site')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Form
                empresa={empresa}
                hide={hideForm}
                notify={notify}
                show={showForm}
                site={site}
                success={onDeleted}
            />
            <Categoria
                empresa={empresa}
                hide={hideCategoria}
                notify={notify}
                show={showCategoria}
                site={site}
                success={onDeleted}
            />
            <ListGroupItem
                className="list-group-item-action px-0"
                style={{ flexDirection: 'row', display: 'flex', flex: 1, alignItems: 'center' }}
            >
                <div className="col-auto">
                    <Button
                        className="btn-sm"
                        title="Editar Categorias"
                        disabled={loading}
                        color="info"
                        onClick={(e) => {
                            e.preventDefault()
                            handleShowCategoria(e)
                        }}
                    >
                        <i className="fas fa-edit"></i>
                    </Button>
                    
                    <Button
                        className="btn-sm"
                        title="Excluir"
                        disabled={loading}
                        color="danger"
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                    >
                        <i className="fas fa-trash"></i>
                    </Button>
                </div>
                <Row
                    style={{ flex: 1 }}
                    className="align-items-center"
                    onClick={handleShowForm}
                >
                    <div className="col">
                        <h4 className="mb-0">
                            <a href="#" onClick={e => e.preventDefault()}>
                                {site.nome}
                            </a>
                        </h4>
                        <small>
                            <a
                                href={site.path}
                                target="_blank"
                            >
                                {site.path}
                            </a>
                        </small>
                        <br />
                        <span
                            className={`text-${site.situacao === 'A' ? 'success' : 'danger'} mr-2`}
                        >
                            ●
                        </span>
                        <small>{site.situacao === 'A' ? 'Ativo' : 'Inativo'}</small>
                    </div>

                </Row>
            </ListGroupItem>
        </>
    );
}

export default Item;