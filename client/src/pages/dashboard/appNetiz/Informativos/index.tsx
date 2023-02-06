import React, { useEffect, useState, useContext } from 'react';
import api from '../../../../services/api'
import EmpresaContext from '../../../../contexts/Empresa'

import {
    Container,
    Gradient,
    LoadingContainer,
} from './styles';
import InformativosAdicionais from './Adicionais'

import {
    Container as BootstrapContainer,
    Card,
    CardBody,
    CardTitle,
    Row,
    Col,
    Spinner
} from "reactstrap";

type Informativo = {
    nome: string,
    descricao: string
    count: number,
    tempo?: string,
    icon: string,
    background: string
}

interface IIformativos {
    notify(type: string, msg: string): void,
    mes: string,
    ano: string
}

const Informativos: React.FC<IIformativos> = ({ notify, mes, ano }) => {

    const { empresaSelecionada } = useContext(EmpresaContext)
    const [informativos, setInformativos] = useState(new Array<Informativo>())
    const [loading, setLoaging] = useState(false)


    useEffect(() => {
        loadInformativos()
    }, [mes, ano])

    async function loadInformativos(): Promise<void> {
        setLoaging(true)
        try {
            const response = await api.get(`dashboards/empresas/${empresaSelecionada?.id}/informativos-oportunidades`,
                {
                    params: {
                        ano,
                        mes
                    }
                })
            const data = await response.data
            setInformativos(data as Array<Informativo>)
        } catch (error) {
            notify('danger', 'Não é possível carregar informativos')
        }
        setLoaging(false)
    }

    const CardStats: React.FC<{ informativo: Informativo }> = ({ informativo }) => (
        <Card className={informativo.background}>
            <CardBody>
                <Row>
                    <div className="col">
                        <CardTitle className="text-uppercase text-muted mb-0 ">
                            {informativo.nome}
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0 ">{informativo.count}</span>
                    </div>
                    <Col className="col-auto">
                        <div className="icon icon-shape bg-blue text-white rounded-circle shadow">
                            <i className={informativo.icon} />
                        </div>
                    </Col>
                </Row>
                <p className="mt-3 mb-0 text-sm">
                    <span className="text-nowrap text-bold ">{informativo.descricao}</span>
                </p>
            </CardBody>
        </Card>
    )


    return (
        <div
            style={{
                marginBottom: '-40px',              
            }}>
            <Container
                className='header d-flex align-items-center'
            >
                <Gradient
                    className='mask bg-info'
                />
                <BootstrapContainer
                    fluid
                    className='mt-2'
                >
                    <Row className="mb-4">
                        <Col lg='8' md='6'>
                            {
                                loading ?
                                    <LoadingContainer>
                                        <Spinner color='secondary' />
                                    </LoadingContainer>
                                    :
                                    <Row>
                                        {
                                            informativos.map((item, key) => <Col key={key}>
                                                <CardStats informativo={item}
                                                />
                                            </Col>)
                                        }
                                    </Row>
                            }

                        </Col>
                        <Col>
                            <InformativosAdicionais notify={notify} />
                        </Col>
                    </Row>
                </BootstrapContainer>
            </Container>
        </div>
    )
}

export default Informativos;