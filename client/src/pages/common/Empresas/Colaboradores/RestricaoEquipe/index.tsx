import React, { useState, useEffect, useContext } from 'react';

import { RestricaoEquipe, User } from "../../../../../entities/Security";
import { Equipe, Empresa } from "../../../../../entities/Common";

import api from "../../../../../services/api";

//@ts-ignore
import Select2 from "react-select2-wrapper";
import BootstrapTable, { ColumnDescription } from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";

import {
    Button,
    Badge,
    Row,
    Col,
    InputGroup,
    InputGroupAddon,
    FormGroup,
    Modal
} from "reactstrap";

interface IRestricaoEquipe {
    notify(type: string, msg: string): void,
    user?: User,
    show: boolean,
    hidde(): void,
    empresa: Empresa
}

interface IError {
    equipe_id?: string
}

const RestricaoEquipeModal: React.FC<IRestricaoEquipe> = ({
    notify,
    user,
    show,
    hidde,
    empresa
}) => {

    const [equipe, setEquipe] = useState<number | undefined>()
    const [equipes, setEquipes] = useState(new Array<Equipe>())
    const [equipesRestringidas, setEquipesRestringidas] = useState(new Array<RestricaoEquipe>())
    const [equipesDisponiveis, setEquipesDisponiveis] = useState(new Array<Equipe>())
    const [perfisComRestricoes, setPerfisComRestricoes] = useState(new Array<String>())
    const [erros, setErros] = useState({} as IError)
    const [saving, setSaving] = useState(false)
    const [columns, setColumns] = useState<Array<ColumnDescription<RestricaoEquipe>>>(new Array<ColumnDescription<RestricaoEquipe>>())

    useEffect(() => {
        if (user) {
            loadEquipes()
            loadEquipesRestringidas()
            setColumns(
                [
                    {
                        dataField: 'acoes',
                        text: '',
                        formatter: (cell, row) => acoesFormatter(cell, row)
                    },
                    {
                        dataField: 'nome',
                        text: 'Nome',
                        sort: true
                    },
                    {
                        dataField: 'tipo',
                        text: 'Tipo',
                        formatter: (cell, row) => tipoFormatter(cell, row),
                        sort: true
                    },
                ]
            )
            loadPerfisComRejeicao()
        } else {
            setEquipes(new Array<Equipe>())
            setEquipesRestringidas(new Array<RestricaoEquipe>())
        }
    }, [user, show])

    useEffect(() => {
        setEquipesDisponiveis(equipes.filter(equipe => !equipesRestringidas.find(item => item.equipe_id === equipe.id)))
    }, [equipes, equipesRestringidas])


    function tipoFormatter(cell: any, row: any) {
        let tipoLabel = ''
        let color = 'secondary'

        if (cell == 'permissao') {
            color = 'success'
            tipoLabel = 'Permissão'
        } else {
            color = 'danger'
            tipoLabel = 'Restrição'
        }

        return (

            <>
                <Badge color={color} className="badge-lg" pill>
                    {tipoLabel}
                </Badge>
            </>
        )
    }

    function canReceiveRestricao(): boolean {
        const perfis = user?.roles
        const exist = perfis?.filter(item => perfisComRestricoes.includes(item.slug))
        return exist ? exist.length > 0 : false
    }

    async function loadPerfisComRejeicao() {
        try {
            const response = await api.get(`security/perfis-restricoes-equipes`)
            const data = await response.data
            setPerfisComRestricoes(data)
        } catch (error) {
            console.error(error)
            notify('danger', 'Não foi possível carregar perfis com rejeição')
        }
    }

    async function loadEquipes() {
        try {
            const response = await api.get(`/common/empresas/${empresa.id}/equipes`)
            const data = await response.data
            setEquipes(data)
        } catch (error) {
            console.error(error)
            notify('danger', 'Não foi possível carregar equipes restringidas')
        }
    }

    async function loadEquipesRestringidas() {
        try {
            const response = await api.get(`/common/empresas/${empresa.id}/colaboradores/${user?.id}/restricoes-equipes`)
            const data = await response.data
            setEquipesRestringidas([...data])
        } catch (error) {
            console.error(error)
            notify('danger', 'Não foi possível carregar equipes restringidas')
        }
    }

    async function handleAddEquipe(tipo:string, event: React.MouseEvent) {
        event.preventDefault()
        if (!equipe) return
        setSaving(true)
        setErros({})
        try {
            await api.post(`/common/empresas/${empresa.id}/colaboradores/${user?.id}/restricoes-equipes`,
                {
                    equipe_id: equipe,
                    tipo: tipo
                })
            await loadEquipesRestringidas()
            setEquipe(undefined)
        } catch (error) {
            console.error(error)
            notify('danger', 'Não foi possível carregar equipes restringidas')
            const response = error.response
            if (response && response.status === 400 && response.data) {
                const messages = await response.data
                const errorMessage = {} as any
                for (let msg of messages) {
                    errorMessage[msg.field as string] = msg.message
                }
                setErros(errorMessage)

            }
        } finally {
            setSaving(false)
        }

    }

    async function handleRemoverEquipe(restricaoEquipe: RestricaoEquipe, user: User) {
        try {
            //console.log(user)
            await api.delete(`/common/empresas/${empresa.id}/colaboradores/${user?.id}/restricoes-equipes/${restricaoEquipe.equipe_id}`)
            await loadEquipesRestringidas()
        } catch (error) {
            console.error(error)
            notify('danger', 'Não foi possível remover equipe')
        }
    }

    function acoesFormatter(cell: string, row: RestricaoEquipe) {
        return (<>
            <div className="btn-group" role="group" aria-label="Basic example">
                <Button
                    className="btn-sm"
                    color="danger"
                    onClick={() => handleRemoverEquipe(row, user as User)}
                    outline>
                    <i className="fas fa-trash"></i>
                </Button>
            </div>
        </>)
    }


    return (
        <Modal
            className="modal-dialog-centered"
            isOpen={show}
            toggle={hidde}
        >
            <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                    Restrições das equipes
                </h5>
                <button
                    aria-label="Close"
                    className="close"
                    data-dismiss="modal"
                    type="button"
                    onClick={hidde}
                >
                    <span aria-hidden={true}>×</span>
                </button>
            </div>
            <div className="modal-body">
                {
                    canReceiveRestricao()
                        ?
                        <>
                            <Row>
                                <Col >
                                    <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="example-number-input"
                                        >
                                            Equipe
                                        </label>
                                        <InputGroup className="mb-3 d-flex justify-content-center">
                                            <Select2
                                                className="form-control"
                                                //@ts-ignore
                                                onSelect={(e) => setEquipe(e.target.value)}
                                                data={equipesDisponiveis.map(equipe => ({ id: equipe.id, text: equipe.nome }))}
                                                value={equipe}
                                            />
                                            <div>

                                                <Button
                                                    disabled={saving}
                                                    color="success"
                                                    type="button"
                                                    outline
                                                    onClick={event => handleAddEquipe('permissao', event)}
                                                    className="btn-icon btn-3 mt-3"
                                                >
                                                    <span className="btn-inner--icon">
                                                        <i className="ni ni-fat-add"></i>
                                                    </span>
                                                    <span className="btn-inner--text">Adicionar Permissão</span>
                                                </Button>
                                                {`  `}
                                                <Button
                                                    disabled={saving}
                                                    color="danger"
                                                    type="button"
                                                    outline
                                                    onClick={event => handleAddEquipe('restricao', event)}
                                                    className="btn-icon btn-3 mt-3"
                                                >
                                                    <span className="btn-inner--icon">
                                                        <i className="ni ni-fat-add"></i>
                                                    </span>
                                                    <span className="btn-inner--text">Adicionar restrição</span>
                                                </Button>
                                            </div>
                                        </InputGroup>
                                        <small className='text-danger'>
                                            {erros.equipe_id || ''}
                                        </small>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    {
                                        columns.length > 0 &&
                                        <ToolkitProvider
                                            data={equipesRestringidas}
                                            keyField="nome"
                                            columns={columns}
                                            search
                                        >
                                            {props => (
                                                <div className="py-4">
                                                    <BootstrapTable
                                                        {...props.baseProps}
                                                        bootstrap4={true}
                                                        bordered={false}
                                                    />
                                                </div>
                                            )}
                                        </ToolkitProvider>
                                    }
                                </Col>
                            </Row>
                        </>
                        :
                        <h2 className='text-center'>
                            No momento esse usuário não pode receber restrições de equipes
                        </h2>
                }


            </div>
            <div className="modal-footer">
                <Button
                    color="link"
                    type="button"
                    disabled={saving}
                    onClick={hidde}
                >
                    Voltar
                </Button>
            </div>
        </Modal>
    )
}

export default RestricaoEquipeModal;