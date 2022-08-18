import React, { useState, useRef, useEffect, useContext } from 'react';
import classnames from "classnames";
import api from "../../../services/api";
import AuthContext from "../../../contexts/Auth";

import Logo from './Logo'
import EmpresaForm from './EmpresaForm'
import Colaboradores from './Colaboradores'
import Equipes from './Equipes'
import Sites from './Sites'
import TermosUsoEmpresa from './TermosUso/TermosUsoEmpresa';

import NotificationAlert from "react-notification-alert";
import { HeaderContainer } from './styles'
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


export default ({ empresaId, history, hiddeTabs = {}, externaTabActive, minhaEmpresa, ...props }) => {

    const [empresa, setEmpresa] = useState({})
    const [tabActive, setTabActive] = useState('empresa')
    const [alert, setAlert] = useState(null)
    const notificationAlert = useRef()
    const { hasPermission, hasRole } = useContext(AuthContext)


    useEffect(() => {
        if (empresaId && empresaId != empresa.id) {
            loadEmpresa(empresaId)
        }
    }, [empresaId])


    useEffect(() => {
        if (externaTabActive && externaTabActive.length > 0) {
            setTabActive(externaTabActive);
        }
    }, [externaTabActive])

    async function loadEmpresa(empresaId) {
        try {
            const response = await api.get(`/common/empresas/${empresaId}`)
            setEmpresa(response?.data)
        } catch (error) {
            console.log(error)
            notify('danger', 'Não foi possível carregar empresa')
        }
    }

    const notify = (type, msg) => {
        let options = {
            place: "tc",
            message: (
                <div className="alert-text" style={{ zIndex: 100 }}>
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

    function onEmpresaChange(empresa) {
        setEmpresa(empresa ? empresa : {})
    }

    const CustomNavItem = ({ children, disabled, name }) => {

        return (
            <>
                {
                    !hiddeTabs[name] &&
                    <NavItem>
                        <NavLink
                            href="#"
                            role="tab"
                            className={classnames("mb-sm-3 mb-md-0 mt-2", {
                                active: tabActive === name
                            })}
                            onClick={() => setTabActive(name)}
                            disabled={disabled}
                        >
                            {children}
                        </NavLink>
                    </NavItem>
                }
            </>
        )
    }

    return (
        <>
            <div className="rna-wrapper" >
                <NotificationAlert ref={notificationAlert} />
            </div>
            {alert}
            <Container className="mt--6" fluid>
                <Card>
                    <CardHeader>
                        <HeaderContainer>
                            {
                                empresa.id &&
                                <Logo
                                    {...props}
                                    history={history}
                                    onEmpresaChange={onEmpresaChange}
                                    notify={notify}
                                    empresa={empresa}
                                />
                            }
                            <div className='ml-4'>
                                <h1>
                                    {
                                        empresa.id ? 'Gerenciar Empresa ' : 'Nova Empresa'
                                    }
                                </h1>
                                <small class="text-muted">{empresa.nome}</small>
                            </div>
                        </HeaderContainer>
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
                                        <CustomNavItem
                                            name='empresa'
                                        >
                                            <>
                                                <i className="fas fa-building mr-2" />
                                                Empresa
                                            </>
                                        </CustomNavItem>

                                        <CustomNavItem
                                            name='users'
                                            disabled={!empresa.id}
                                        >
                                            <>
                                                <i className="fas fa-user mr-2" />
                                                Colaboradores
                                            </>
                                        </CustomNavItem>
                                        <CustomNavItem
                                            name='equipes'
                                            disabled={!empresa.id}
                                        >
                                            <>
                                                <i className="fas fa-user-friends mr-2" />
                                                Equipes
                                            </>
                                        </CustomNavItem>

                                        <CustomNavItem
                                            name='sites'
                                            disabled={!empresa.id}
                                        >
                                            <>
                                                <i className="fas fa fa-globe mr-2"></i>
                                                Sites
                                            </>
                                        </CustomNavItem>

                                        <CustomNavItem
                                            name='termosuso'
                                            disabled={!empresa.id || (!hasRole('administrador') && !hasRole('administrador_empresa'))}
                                        >
                                            <>
                                                <i className="fas fa-file-signature mr-2"></i>
                                                Termos de Uso
                                            </>
                                        </CustomNavItem>

                                    </Nav>
                                </div>
                                <hr className='mt-0' />
                                <div>
                                    <TabContent activeTab={tabActive}>
                                        <TabPane tabId="empresa">
                                            <EmpresaForm
                                                {...props}
                                                history={history}
                                                onEmpresaChange={onEmpresaChange}
                                                notify={notify}
                                                empresa={empresa}
                                                minhaEmpresa={minhaEmpresa}
                                            />
                                        </TabPane>
                                        
                                        <TabPane tabId="users">
                                            {
                                                empresa.id &&
                                                <Colaboradores
                                                    {...props}
                                                    history={history}
                                                    onEmpresaChange={onEmpresaChange}
                                                    notify={notify}
                                                    empresa={empresa}
                                                />
                                            }
                                        </TabPane>
                                        <TabPane tabId="equipes">
                                            {
                                                empresa.id &&
                                                <Equipes
                                                    {...props}
                                                    history={history}
                                                    onEmpresaChange={onEmpresaChange}
                                                    notify={notify}
                                                    empresa={empresa}
                                                />
                                            }
                                        </TabPane>

                                        <TabPane tabId="sites">
                                            {
                                                empresa.id &&
                                                <Sites
                                                    {...props}
                                                    onEmpresaChange={onEmpresaChange}
                                                    notify={notify}
                                                    empresa={empresa}
                                                />
                                            }
                                        </TabPane>

                                        <TabPane tabId="termosuso">
                                            {
                                                empresa.id && (hasRole('administrador') || hasRole('administrador_empresa')) &&
                                                <TermosUsoEmpresa
                                                    {...props}
                                                    onEmpresaChange={onEmpresaChange}
                                                    notify={notify}
                                                    empresa={empresa}
                                                    minhaEmpresa={minhaEmpresa}
                                                />
                                            }
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
