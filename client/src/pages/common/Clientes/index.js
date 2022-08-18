import React, { useState, useRef, useContext } from 'react';
import EmpresaContext from '../../../contexts/Empresa'
import api from "../../../services/api";
import NotificationAlert from "react-notification-alert";
import Filters from './Filters'

// reactstrap components
import Table from './Table';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
    Spinner,
} from "reactstrap";
// core components
import SimpleHeader from '../../../components/Headers/SimpleHeader'

export default ({ ...props }) => {

    const { empresaSelecionada } = useContext(EmpresaContext)
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)
    const [clientes, setClientes] = useState([])
    const [pageProperties, setPageProperties] = useState({
        total: "0",
        perPage: 10,
        page: 1,
        lastPage: 1,
        loading: false
    })
    const [lastSearch, setLastSearch] = useState({})
    const notificationAlert = useRef();

    function notify(type, msg) {
        let options = {
            place: "tc",
            message: (
                <div className="alert-text">
                    <span data-notify="message">
                        {msg}
                    </span>
                </div>
            ),
            type: type,
            icon: "ni ni-bell-55",
            autoDismiss: 7
        };
        if (notificationAlert && notificationAlert.current) notificationAlert.current.notificationAlert(options);
    };

    function onNewClicked(e) {
        e.preventDefault();
        props.history.push('clientes/new')
    }

    async function updatePageProperties(response) {
        const { total, perPage, page, lastPage } = await response.data
        await setPageProperties({
            total,
            perPage,
            page,
            lastPage,
            loading: false,
        })
    }

    async function loadClientes(page = 1,
        limit = 10,
        sortField = "created_at",
        sortOrder = "desc",
        filters = lastSearch) {
        try {
            setPageProperties({
                ...pageProperties,
                loading: true
            })
            const response = await api.get(`common/empresas/${empresaSelecionada?.id}/clientes/`, {
                params: {
                    page,
                    limit,
                    sortField,
                    sortOrder,
                    ...filters
                }
            })
            setClientes(response.data.data)
            await updatePageProperties(response)
        } catch (err) {
            console.log(err.response)
            notify('danger', 'Houve um problema ao carregar os clientes.');
        }
    }


    const handleTableChange = async (type, { page, sizePerPage, sortField, sortOrder }) => {
        try {
            await loadClientes(page == 0 ? 1 : page, sizePerPage, sortField, sortOrder)
        } catch (error) {
            notify('danger', 'Houve um problema ao carregar as clientes.');
        }
    }

    return (
        <>
            {alert}
            <div className="rna-wrapper">
                <NotificationAlert ref={notificationAlert} />
            </div>
            <SimpleHeader name="Listagem de clientes" parentName="Clientes" {...props} />
            <Container className="mt--6" fluid>
                <Row>
                    <Col>
                        <Card>
                            <CardHeader
                                style={{
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 1,
                                }}>
                                <Filters
                                    title={<h1>Clientes</h1>}
                                    data={clientes}
                                    load={(filters) => {
                                        setLastSearch(filters)
                                        loadClientes(
                                            1,
                                            10,
                                            "nome",
                                            "desc",
                                            filters)
                                    }}
                                />
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col xs='12'>
                                        <span >
                                            <Button
                                                color="primary"
                                                type="button"
                                                onClick={e => onNewClicked(e)}
                                                size="sm">
                                                <span className="btn-inner--icon">
                                                    <i className="ni ni-fat-add" />
                                                </span>
                                                Novo Cliente
                                                </Button>
                                        </span>
                                    </Col>

                                    <Col>
                                        <Table
                                            clientes={clientes || []}
                                            notify={notify}
                                            onTableChange={handleTableChange}
                                            history={props.history}
                                            pageProperties={pageProperties}
                                            loading={loading}
                                        />
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
