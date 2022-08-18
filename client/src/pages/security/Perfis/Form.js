import React, { useState, useRef, useEffect } from 'react';
import classnames from "classnames";
import api from "../../../services/api";

import PerfilForm from './PerfilForm'
import NotificationAlert from "react-notification-alert";
import {
    Card,
    CardBody,
    CardHeader,
    Container,
    Nav,
    Row,
    Col,
    NavItem,
    TabContent,
    TabPane,
    NavLink,
} from "reactstrap";

export default ({ perfilId, history, ...props }) => {

    const [perfil, setPerfil] = useState({})
    const [tabActive, setTabActive] = useState('perfil')
    const [alert, setAlert] = useState(null)
    const notificationAlert = useRef()

    useEffect(() => {
        if (perfilId && perfilId != perfilId.id) {
            loadPerfil(perfilId)
        }
    }, [perfilId])

    async function loadPerfil(perfil) {
        try {
            const response = await api.get(`/security/perfis/${perfil}`)
            setPerfil(response.data)
        } catch (error) {
            console.log(error)
            notify('danger', 'Não foi possível carregar perfil')
        }
    }

    const notify = (type, msg) => {
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
            autoDismiss: 3
        };
        if (notificationAlert.current) notificationAlert.current.notificationAlert(options);
    };

    function onPerfilChange(perfil) {
        setPerfil(perfil || {})
    }

    return (
        <>
            <div className="rna-wrapper">
                <NotificationAlert ref={notificationAlert} />
            </div>
            {alert}
            <Container className="mt--6" fluid>
                <Card>
                    <CardHeader>
                        <h1>
                            {
                                perfil.id ? 'Gerenciar Perfil ' : 'Novo Perfil'
                            }
                        </h1>
                        <small class="text-muted">{perfil.name}</small>
                    </CardHeader>
                    <CardBody
                        outline
                        body
                    >

                        <Row>
                            <Col xs={12} lg={12} md={12} sm={12}>
                                <div
                                    className="nav-wrapper"
                                >
                                    <Nav
                                        className="nav-fill flex-column flex-md-row"
                                        pills
                                        role="tablist"
                                    >
                                        <NavItem>
                                            <NavLink
                                                href="#pablo"
                                                role="tab"
                                                className={classnames("mb-sm-3 mb-md-0", {
                                                    active: tabActive == 'perfil'
                                                })}
                                                onClick={() => setTabActive('perfil')}
                                            >
                                                <i className="fas fa-id-badge mr-2" />
                                                Perfil
                                            </NavLink>
                                        </NavItem>
                                        {

                                            false &&
                                            <NavItem>
                                                <NavLink
                                                    className={classnames("mb-sm-3 mb-md-0", {
                                                        active: tabActive == 'menu'
                                                    })}
                                                    href="#"
                                                    onClick={() => setTabActive('menu')}
                                                    role="tab"
                                                    disabled={!perfil.id}
                                                >
                                                    <i className="fas fa-bars mr-2" />
                                                    Menus
                                            </NavLink>
                                            </NavItem>
                                        }
                                    </Nav>
                                </div>
                                <hr />
                                <div>
                                    <TabContent activeTab={tabActive}>
                                        <TabPane tabId="perfil">
                                            <PerfilForm
                                                {...props}
                                                history={history}
                                                onPerfilChange={onPerfilChange}
                                                notify={notify}
                                                perfil={perfil}
                                            />
                                        </TabPane>
                                        <TabPane tabId="menu">

                                        </TabPane>

                                    </TabContent>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Container>
        </>
    );
}
