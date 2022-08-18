import React, { useState, useEffect, useContext } from 'react';
import SiteEmpresa from '../../../../entities/Common/SiteEmpresa';
import { Anuncio } from '../../../../entities/Marketing';
import api from '../../../../services/api';
import EmpresaContext from "../../../../contexts/Empresa";

import LinkForm from "./Form";
import List from "./List";
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
    Col
} from "reactstrap";


// import { Container } from './styles';
type Props = {
    show: boolean,
    hidde(): void,
    cliente_id: number
}

const Links: React.FC<Props> = ({ show, hidde, cliente_id }) => {

    const { empresaSelecionada } = useContext(EmpresaContext)
    const [showForm, setShowForm] = useState(false)
    const [sites, setSites] = useState(new Array<SiteEmpresa>())
    const [afiliacoes, setAfiliacoes] = useState(new Array<Anuncio>())

    useEffect(() => {
        if (!cliente_id) return
        load()
    }, [cliente_id])

    function handleShowForm() {
        setShowForm(true)
    }

    function handleHiddeForm() {
        setShowForm(false)
    }

    async function load() {
        await loadSites()
        await loadAfiliacoes()
    }

    async function loadSites() {
        try {
            const response = await api.get(`common/empresas/${empresaSelecionada?.id}/sites-empresas`)
            setSites(response.data)
        } catch (error) {
            console.error(error)
        }
    }

    async function loadAfiliacoes() {
        try {
            const response = await api.get(`common/empresas/${empresaSelecionada?.id}/clientes/${cliente_id}/afiliados`)
            setAfiliacoes(response.data)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <LinkForm
                show={showForm}
                hidde={handleHiddeForm}
                cliente_id={cliente_id}
                onSucess={load}
            />
            <Modal
                className="modal-dialog-centered"
                isOpen={show}
                size='lg'
                toggle={hidde}
            >
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                        Afiliações
            </h5>
                </div>
                <div className="modal-body">
                    <div
                        className="text-center mb-2"

                    >
                        <Button
                            color="primary"
                            type="button"
                            onClick={handleShowForm}
                            size="sm"
                        >
                            + Novo link de anúncio
                    </Button>
                    </div>


                    {
                        sites.length > 0 && afiliacoes.length > 0 &&
                        <List
                            sites={sites}
                            afiliacoes={afiliacoes}
                        />
                    }

                </div>
                <div className="modal-footer">
                    <Button
                        color="link"
                        data-dismiss="modal"
                        type="button"
                        onClick={hidde}
                    >
                        Fechar
            </Button>

                </div>
            </Modal>
        </>
    );
}

export default Links;