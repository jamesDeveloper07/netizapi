import React, { useState, useRef, useEffect } from 'react';
import classnames from "classnames";
import api from "../../../services/api";

import UserForm from './UserForm'
import Empresas from './empresas'
// import Perfis from './perfis'
import NotificationAlert from "react-notification-alert";
import Avatar from '../../../components/Avatar'
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

export default ({ userId, history, ...props }) => {

    const [user, setUser] = useState({})
    const [tabActive, setTabActive] = useState('usuario')
    const [alert, setAlert] = useState(null)
    const notificationAlert = useRef()

    useEffect(() => {
        if (userId && userId != user.id) {
            loadUser(userId)
        }
    }, [userId])

    async function loadUser(userId) {
        try {
            const response = await api.get(`/security/usuarios/${userId}`)
            setUser(response.data)
        } catch (error) {
            console.log(error)
            notify('danger', 'Não foi possível carregar usuário')
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

    function onUserChange(user) {
        setUser(user ? user : {})
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
                                user.id ? 'Gerenciar Usuário ' : 'Novo Usuário'
                            }
                        </h1>
                        <div style={{ display: 'flex' }}>
                            <Avatar user={user} className='avatar-xs mr-1' style={{ cursor: 'default' }} />
                            <small class="text-muted justify-content-center">
                                {user.name}
                            </small>
                        </div>

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
                                                    active: tabActive == 'usuario'
                                                })}
                                                onClick={() => setTabActive('usuario')}
                                            >
                                                <i className="fas fa-user mr-2" />
                                                Usuário
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                className={classnames("mb-sm-3 mb-md-0", {
                                                    active: tabActive == 'empresas'
                                                })}
                                                href="#"
                                                onClick={() => setTabActive('empresas')}
                                                role="tab"
                                                disabled={!user.id}
                                            >
                                                <i className="fas fa-building mr-2" />
                                                Empresas
                                            </NavLink>
                                        </NavItem>
                                        {/* <NavItem>
                                            <NavLink
                                                className={classnames("mb-sm-3 mb-md-0", {
                                                    active: tabActive == 'perfis'
                                                })}
                                                href="#"
                                                onClick={() => setTabActive('perfis')}
                                                role="tab"
                                                disabled={!user.id}
                                            >
                                                <i className="fas fa-user-tag mr-2" />
                                                Perfis
                                            </NavLink>
                                        </NavItem> */}
                                    </Nav>
                                </div>
                                <hr />
                                <div>
                                    <TabContent activeTab={tabActive}>
                                        <TabPane tabId="usuario">
                                            <UserForm
                                                {...props}
                                                history={history}
                                                onUserChange={onUserChange}
                                                notify={notify}
                                                user={user}
                                            />
                                        </TabPane>
                                        <TabPane tabId="empresas">
                                            {
                                                user.id &&
                                                <Empresas
                                                    {...props}
                                                    history={history}
                                                    onUserChange={onUserChange}
                                                    notify={notify}
                                                    user={user}
                                                />
                                            }
                                        </TabPane>
                                        {/* <TabPane tabId="perfis">
                                            {
                                                user.id &&
                                                <Perfis
                                                    {...props}
                                                    history={history}
                                                    onUserChange={onUserChange}
                                                    notify={notify}
                                                    user={user}
                                                />
                                            }
                                        </TabPane> */}
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
