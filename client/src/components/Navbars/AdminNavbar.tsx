import React, { useEffect, useContext, useState, useRef, ReactPropTypes, SetStateAction } from "react";
import AuthContext from '../../contexts/Auth'
import EmpresaContext from '../../contexts/Empresa'
import { Empresa } from "../../entities/Common";
import { User } from "../../entities/Security";
import { Notificacao } from "../../entities/Security";
import { useHistory } from "react-router-dom";
// nodejs library that concatenates classes
import classnames from "classnames";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// Função de logout
import { logout } from "../../services/auth";
//API para requests
import api from "../../services/api";
//@ts-ignore
import NotificationAlert from "react-notification-alert";
//@ts-ignore
import NotificacoesLista from "../NotificacoesLista";
// reactstrap components
import Avatar from '../Avatar'
import {
  Collapse,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  Navbar,
  NavItem,
  Nav,
  Container
} from "reactstrap";

interface IAdminNavBar {
  toggleSidenav(): void,
  sidenavOpen: boolean,
  brandText?: string,
  theme: string,
  changeRoutes(routes: any): void,
}

const AdminNavbar: React.FC<IAdminNavBar> = ({ theme, toggleSidenav, sidenavOpen, brandText, changeRoutes }) => {

  const { user, signout } = useContext(AuthContext)
  const { empresaSelecionada, changeEmpresaSelecionada, empresas, routes } = useContext(EmpresaContext)
  const history = useHistory()

  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const notificationAlert = useRef<NotificationAlert>(null)

  const notify = (type: string, msg: string) => {
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
    notificationAlert?.current?.notificationAlert(options);
  };


  const editUser = async (e: React.MouseEvent) => {
    e.preventDefault();
    history.push("/admin/me/edit");
  }

  function handleSelectEmpresa(empresa: Empresa) {
    // localStorage.setItem('empresaId', empresa.id + "");
    // localStorage.setItem('empresaNome', empresa.nome);
    changeEmpresaSelecionada(empresa)
    sessionStorage.clear()
    document.location.reload()
  }

  useEffect(() => {
    changeRoutes(routes)
  }, [routes])

  const EmpresasLista: React.FC<{ empresas: Array<Empresa> }> = ({ empresas }) => {

    const [color, setColor] = useState('')

    return <>
      {
        empresas.map((empresa, key) =>
          <DropdownItem
            key={key}
            onClick={
              () => {
                handleSelectEmpresa(empresa)
              }
            }
            style={
              {
                color: "white",
                textAlign: "center",
                backgroundColor: color
              }
            }
            onMouseEnter={(e) => setColor('#8080800f')}
            onMouseLeave={() => setColor('transparent')}
            value={empresa.id}>
            {empresa.nome}
          </DropdownItem >

        )}
    </>
  }



  return (
    <>
      <div className="rna-wrapper">
        <NotificationAlert ref={notificationAlert} />
      </div>
      <Navbar
        style={{
          backgroundColor: '#162B4D'
        }}
        className={classnames(
          "navbar-top navbar-expand navbar-dark bg-info",
        )}
      >
        <Container fluid>
          {/* menu empresa */}
          <Nav className="align-items-center mr-lg-auto ml-sm-auto" navbar>
            <UncontrolledDropdown>
              <DropdownToggle caret color="secondary" style={{
                background: 'transparent',
                border: 'transparent',
                color: 'white',
                boxShadow: '0 0'
              }}>
                <i className="fas fa-city"></i> {empresaSelecionada?.nome}
              </DropdownToggle>
              <DropdownMenu style={{
                background: '#118EEF'
              }}>
                <EmpresasLista empresas={empresas} />
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>

          <Collapse navbar isOpen={true}>

            <Nav className="align-items-center ml-md-auto" navbar>
              <NavItem className="d-xl-none">
                <div
                  className={classnames(
                    "pr-3 sidenav-toggler",
                    { active: sidenavOpen },
                    { "sidenav-toggler-dark": theme === "dark" }
                  )}
                  onClick={toggleSidenav}
                >
                  <div className="sidenav-toggler-inner">
                    <i className="sidenav-toggler-line" />
                    <i className="sidenav-toggler-line" />
                    <i className="sidenav-toggler-line" />
                  </div>
                </div>
              </NavItem>
            </Nav>

            {/* menu Notificações */}
            <Nav className="align-items-center ml-md-0" navbar>
              <NotificacoesLista />
            </Nav>

            {/* Menu Perfil Usuário */}
            <Nav className="align-items-center ml-auto ml-md-0" navbar>
              <UncontrolledDropdown nav>
                <DropdownToggle className="nav-link pr-0" color="" tag="a">
                  <Media className="align-items-center">
                    <Avatar
                      user={user as User}
                      className='bg-secondary'
                      style={{ color: 'blue' }}
                    />
                    <Media className="ml-2 d-none d-lg-block">
                      {user?.name}
                    </Media>
                  </Media>
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>Perfis</DropdownItem>
                  {
                    user?.roles && user?.roles.map((item, key) =>
                      <DropdownItem
                        key={key}
                        disabled>
                        {item.name}
                      </DropdownItem>
                    )
                  }
                  <DropdownItem divider />
                  <DropdownItem
                    href="#"
                    onClick={editUser}
                  >
                    <i className="ni ni-single-02" />
                    <span>Minha conta</span>
                  </DropdownItem>

                  <DropdownItem divider />
                  <DropdownItem
                    href="#"
                    onClick={signout}
                  >
                    <i className="ni ni-user-run" />
                    <span>Logout</span>
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>

          </Collapse>

        </Container>

      </Navbar>
    </>
  );
}

export default AdminNavbar;
