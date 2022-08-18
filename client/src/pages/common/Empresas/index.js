import React, { useState, useRef } from 'react';
import api from "../../../services/api";
import NotificationAlert from "react-notification-alert";
import Table from './Table'
import Filters from './Filters'

// reactstrap components
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
} from "reactstrap";
// core components
import SimpleHeader from '../../../components/Headers/SimpleHeader'

export default ({ ...props }) => {

    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)
    const [empresas, setEmpresas] = useState([])
    const [pageProperties, setPageProperties] = useState({
        total: "0",
        perPage: 10,
        page: 1,
        lastPage: 1,
        loading: false,
        sort: new Map([])
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
        if (notificationAlert) notificationAlert.current.notificationAlert(options);
    };

    function onNewClicked(e) {
        e.preventDefault();
        props.history.push('empresas/new')
    }

    async function updatePageProperties(response) {
        const { total, perPage, page, lastPage } = await response.data
        await setPageProperties({
            ...pageProperties,
            total,
            perPage,
            page,
            lastPage,
            loading: false,
        })
    }

    async function loadEmpresas(page = 1,
        limit = 10,
        sortField = "created_at",
        sortOrder = "desc",
        filters = lastSearch) {
        try {
            setPageProperties({
                ...pageProperties,
                loading: true
            })
            const response = await api.get(`common/empresas/`, {
                params: {
                    page,
                    limit,
                    sortField,
                    sortOrder,
                    ...filters
                }
            })
            setEmpresas(response.data)
            await updatePageProperties(response)
        } catch (err) {
            console.log(err.response)
            notify('danger', 'Houve um problema ao carregar as empresas.');
        }
    }

    const handleTableChange = async (type, { page, sizePerPage, sortField, sortOrder }) => {
        try {
            if (type == 'sort') {
                const value = pageProperties.sort.get(sortField)
                const newOrder = (value || 'asc') == 'desc' ? 'asc' : 'desc'
                const map = pageProperties.sort
                map.set(sortField, newOrder)
                sortOrder = newOrder
            }
            await loadEmpresas(page == 0 ? 1 : page, sizePerPage, sortField, sortOrder)
        } catch (error) {
            notify('danger', 'Houve um problema ao carregar as empresas.');
        }
    }

    return (
        <>
            {alert}
            <div className="rna-wrapper">
                <NotificationAlert ref={notificationAlert} />
            </div>
            <SimpleHeader name="Listagem de empresas" parentName="Empresas" {...props} />
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
                                    title={<h1>Empresas</h1>}
                                    data={empresas}
                                    load={(filters) => {
                                        setLastSearch(filters)
                                        loadEmpresas(
                                            1,
                                            10,
                                            "created_at",
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
                                                Nova Empresa
                                                </Button>
                                        </span>

                                    </Col>

                                    <Col>
                                        <Table
                                            empresas={empresas ? empresas.data : []}
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
