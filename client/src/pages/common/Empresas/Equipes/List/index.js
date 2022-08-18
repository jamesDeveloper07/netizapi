import React from 'react';
import api from "../../../../../services/api";

import {
    Button,
    ListGroupItem,
    ListGroup,
    Row,
} from "reactstrap";

function List({
    itens = [],
    empresa,
    onSelected = () => { },
    reload = () => { },
    showMembros,
    notify }) {

    function handleSelectEquipe(equipe) {
        onSelected(equipe)
    }

    function handleShowMembros(equipe) {
        showMembros(equipe)
    }

    async function handleDelete(equipe) {
        if (window.confirm(`Deseja remover a equipe  ${equipe.nome}?`)) {
            try {
                await api.delete(`/common/empresas/${empresa.id}/equipes/${equipe.id}`);
                notify("success", "Equipe removida");
                reload()
            } catch (error) {
                console.error(error)
                notify("danger", "Não foi possível remover Equipe");
            }
        }
    }

    return (
        <>
            <ListGroup className="list mt-4" flush>
                {
                    itens.map((equipe, key) => (
                        <ListGroupItem
                            className="list-group-item-action px-0"
                            style={{ flexDirection: 'row', display: 'flex', flex: 1, alignItems: 'center' }}
                            key={key}>
                            <div className="col-auto">
                                <Button
                                    className="btn-sm"
                                    color="danger"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handleDelete(equipe)
                                    }}
                                >
                                    <i class="fas fa-trash"></i>
                                </Button>
                            </div>
                            <Row
                                style={{ flex: 1 }}
                                onClick={(e) => {
                                    e.preventDefault()
                                    handleSelectEquipe(equipe)
                                }}
                                className="align-items-center">
                                <div className="col">
                                    <h4 className="mb-0">
                                        <a href="#" onClick={e => e.preventDefault()}>
                                            {equipe.nome}
                                        </a>
                                    </h4>
                                    <small>{`${equipe.__meta__.membros_count} colaboradores`}</small><br />
                                    {
                                        equipe.captadora === 'A' &&
                                        <>
                                            <span className="text-success mr-2">●</span>
                                            <small>Captadora</small>
                                        </>
                                    }
                                </div>

                            </Row>
                            <Button
                                className="btn-sm"
                                color="primary"
                                onClick={() => handleShowMembros(equipe)}
                            >
                                Adicionar colaboradores
                                    </Button>

                        </ListGroupItem>
                    ))
                }
            </ListGroup>
        </>
    )
}

export default List;