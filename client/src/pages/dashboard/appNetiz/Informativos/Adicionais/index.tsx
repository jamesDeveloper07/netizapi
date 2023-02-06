import React, { useEffect, useState, useContext } from 'react';
import api from '../../../../../services/api'
import EmpresaContext from '../../../../../contexts/Empresa'
import {
    useHistory
} from "react-router-dom";
// import { Container } from './styles';
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    ListGroupItem,
    ListGroup,
} from "reactstrap";

type Informativo = {
    nome: string,
    link?: string,
    valor?: string,
    descricao?: string
}

interface IAdicionais {
    notify(type: string, msg: string): void
}

const Adicionais: React.FC<IAdicionais> = ({ notify }) => {

    const history = useHistory()
    const { empresaSelecionada } = useContext(EmpresaContext)
    const [informativos, setInformativos] = useState(new Array<Informativo>())

    useEffect(() => {
        loadInformativos()
    }, [])

    async function loadInformativos() {
        try {
            const response = await api.get(`dashboards/empresas/${empresaSelecionada?.id}/informativos`)
            const data = await response.data
            setInformativos(data as Array<Informativo>)
        } catch (error) {
            notify('danger', 'Não foi possível carregar informativos')
        }
    }

    function handleNavigateTo(path?: string) {
        if (path) history.push(path)
    }

    return (
        <>
            <Card>
                <CardHeader>Informativos</CardHeader>
                <CardBody>
                    <ListGroup data-toggle="checklist" flush>
                        {
                            informativos.map((item, key) => (
                                <ListGroupItem key={key} className="checklist-entry flex-column align-items-start py-4 px-4">
                                    <div className="checklist-item checklist-item-primary">
                                        <div className="checklist-primary">
                                            <h5 className="checklist-title mb-0">{item.nome}</h5>
                                            <small>{item?.descricao}</small>
                                        </div>
                                        <div>
                                            <div className="custom-control ">
                                                <Button
                                                    color='link'
                                                    size='sm'
                                                    onClick={() => handleNavigateTo(item?.link)}
                                                >
                                                    {item?.valor}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </ListGroupItem>
                            ))
                        }
                    </ListGroup>
                </CardBody>
            </Card>
        </>
    )
}

export default Adicionais;