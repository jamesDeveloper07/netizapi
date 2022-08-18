import React, { useState, useRef } from 'react';
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
} from "reactstrap";
// core components
import SimpleHeader from '../../../components/Headers/SimpleHeader'

export default ({ ...props }) => {

    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)
    const [perfis, setPerfis] = useState([])
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
        if (notificationAlert) notificationAlert.current.notificationAlert(options);
    };

    function onNewClicked(e) {
        e.preventDefault();
        props.history.push('perfis/new')
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

    async function loadPerfis(page = 1,
        limit = 10,
        sortField = "created_at",
        sortOrder = "desc",
        filters = lastSearch) {
        try {
            setPageProperties({
                ...pageProperties,
                loading: true
            })
            const response = await api.get(`security/perfis/`, {
                params: {
                    page,
                    limit,
                    sortField,
                    sortOrder,
                    ...filters
                }
            })
            setPerfis(response.data)
            await updatePageProperties(response)
        } catch (err) {
            console.log(err.response)
            notify('danger', 'Houve um problema ao carregar os perfis.');
        }
    }


    const handleTableChange = async (type, { page, sizePerPage, sortField, sortOrder }) => {
        try {
            await loadPerfis(page == 0 ? 1 : page, sizePerPage, sortField, sortOrder)
        } catch (error) {
            notify('danger', 'Houve um problema ao carregar os perfis.');
        }
    }

    return (
        <>
            {alert}
            <div className="rna-wrapper">
                <NotificationAlert ref={notificationAlert} />
            </div>
            <SimpleHeader name="Listagem de perfis" parentName="Perfis" {...props} />
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
                                    title={<h1>Perfil</h1>}
                                    data={perfis}

                                    load={(filters) => {
                                        setLastSearch(filters)
                                        loadPerfis(
                                            1,
                                            10,
                                            "name",
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
                                                Novo Perfil
                                                </Button>
                                        </span>
                                    </Col>

                                    <Col>
                                        <Table
                                            perfis={perfis ? perfis.data : []}
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
