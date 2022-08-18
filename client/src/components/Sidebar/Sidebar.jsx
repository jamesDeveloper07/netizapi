import React, { useState } from 'react';
// react library for routing
import { NavLink as NavLinkRRD, Link } from "react-router-dom";
// nodejs library that concatenates classes
import classnames from "classnames";
// nodejs library to set properties for components
import { PropTypes } from "prop-types";
// react library that creates nice scrollbar on windows devices
import PerfectScrollbar from "react-perfect-scrollbar";
import Axios from 'axios'
import api from '../../services/api';
// reactstrap components
import {
  Button,
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Row,
  Col,
  Modal
} from "reactstrap";

import moment from 'moment'

import { authStorageKey, empresaStorageKey, userStorageKey } from "../../utils";

class Sidebar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      collapseOpen: true,
      modalInicialOpen: true,
      modalAlertaJobsOpen: false,
      modalTermosUsoOpen: false,
      displayButtonContratar: 'none',
      routes: props.routes,
      termosUsoVigentes: null,
      termosUsoVigentesAceitos: false,
      ...this.getCollapseStates(props.routes)
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.routes != this.props.routes && this.props.routes) {
      this.setState({
        ...this.state,
        ...this.getCollapseStates(this.props.routes)
      })
    }
  }

  getToken = () => {
    let auth = localStorage.getItem(authStorageKey)
    if (auth) {
      const authObj = JSON.parse(auth)
      return authObj.token
    }
  }

  getRoleUser = (role) => {
    let user = localStorage.getItem(userStorageKey)
    if (user) {
      const userObj = JSON.parse(user)
      let roles = userObj?.roles?.find(item => item.slug === role)
      return !!roles
    }

    return false
  }

  getPerfilNegocioEmpresaLogada = () => {
    let empresa = localStorage.getItem(empresaStorageKey)
    if (empresa) {
      const empresaObj = JSON.parse(empresa)
      return empresaObj.perfil_negocio_id
    }
  }

  getIdEmpresaLogada = () => {
    let empresa = localStorage.getItem(empresaStorageKey)
    if (empresa) {
      const empresaObj = JSON.parse(empresa)
      return empresaObj.id
    }
  }

  getLinkVideoInicial = () => {
    let empresa = localStorage.getItem(empresaStorageKey)
    if (empresa) {
      const empresaObj = JSON.parse(empresa)
      return empresaObj.link_video_inicial;
    }
  }

  getPermissaoVideoInicial = () => {
    let empresa = localStorage.getItem(empresaStorageKey)
    if (empresa) {
      const empresaObj = JSON.parse(empresa)
      return empresaObj.flag_mostrar_video_inicial;
    }
  }

  getHasEmpresaLogada = () => {
    let empresa = localStorage.getItem(empresaStorageKey)
    if (empresa) {
      const empresaObj = JSON.parse(empresa)
      if (empresaObj && empresaObj.id > 0) {
        if (empresaObj.assinatura_id) {
          this.state.displayButtonContratar = 'none'
        } else {
          this.state.displayButtonContratar = 'flex'
        }
        return true;
      } else {
        this.state.displayButtonContratar = 'none'
        return false;
      }
    }
  }

  getTermosUsoIdEmpresaLogada = () => {
    let empresa = localStorage.getItem(empresaStorageKey)
    if (empresa) {
      const empresaObj = JSON.parse(empresa)
      return empresaObj.termos_uso_id
    }
  }

  async canShowModalByDuracaoJornada() {

    try {
      var url = `${process.env.REACT_APP_ACELERANDO_PESSOAS_BACK_URL}/sdp/api/acelerando/alunos/canshowjornada?token=${this.getToken()}&idPerfilNegocio=${this.getPerfilNegocioEmpresaLogada()}`
      const response = await Axios.get(url)
      //console.log('Validando Can Show Modal')
      //console.log({ response })
      if (response && response.data && (response.data.can_show == 'true' || response.data.can_show)) {
        //console.log('Dias Restantes')
        localStorage.setItem('diasFimJornada', response.data.dias_restantes)
        //console.log(response.data.dias_restantes)
      }
      return response.data.can_show
    } catch (error) {
      console.error(error)
      console.log('Não foi possível validar Modal By Duração da Jornada')
      return false
    }
  }

  async canShowModalByValidacaoJobs() {
    try {
      const response = await api.get(`/common/validacaojobs`);

      if (response && response.data && response.data.length > 0) {
        return response.data[0].alerta
      } else {
        return false
      }

    } catch (error) {
      console.log('ERROR VALIDAÇÂO JOBS')
      console.error(error)
      console.log('Não foi possível validar Modal By Validacao Jobs')
      return false
    }
  }

  async getTermosUsoVigente(onde) {
    //console.log({ onde })
    try {
      let termoVigente = this.state.termosUsoVigentes
      if (!termoVigente) {
        // console.log('BUSCAR TERMO')
        const response = await api.get(`common/empresas/${this.getIdEmpresaLogada()}/termos-uso-vigente`)
        if (response.data) {
          this.state.termosUsoVigentes = response.data
        }
        return response.data
      } else {
        // console.log('TERMO JÁ CARREGADO')
        return termoVigente
      }
    } catch (error) {
      console.log('ERROR GET TERMO VIGENTE')
      console.error(error)
      console.log('Não foi possível buscar termos de uso vigentes')
      return null
    }
  }


  async canShowModalByValidacaoTermosUso() {
    try {
      console.log('canShowModalByValidacaoTermosUso')
      // const response = await api.get(`common/empresas/${this.getIdEmpresaLogada()}/termos-uso-vigente`)
      // console.log(response.data)
      // if (response.data) {
      //   this.state.termosUsoVigentes = response.data
      // }

      // const termoVigente = await this.getTermosUsoVigente()
      let termoVigente = this.state.termosUsoVigentes
      if (!termoVigente) {
        termoVigente = await this.getTermosUsoVigente('canShow')
        if (termoVigente) {
          this.state.termosUsoVigentes = termoVigente
        }
      }

      let empresa = localStorage.getItem(empresaStorageKey)
      if (this.getRoleUser('administrador_empresa')) {
        if (empresa && termoVigente) {
          const empresaObj = JSON.parse(empresa)
          console.log({ empresaObj })
          if (termoVigente.id && empresaObj.termos_uso_id && (termoVigente.id != empresaObj.termos_uso_id)) {
            return true
          } else {
            if (termoVigente.id && !empresaObj.termos_uso_id) {
              return true
            }
          }
        }
      }
      return false

    } catch (error) {
      console.log('ERROR VALIDAÇÂO TERMOS USO')
      console.error(error)
      console.log('Não foi possível validar Modal By Validacao Termos Uso')
      return false
    }
  }


  // verifies if routeName is the one active (in browser input)
  activeRoute = routeName => {
    return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };
  // makes the sidenav normal on hover (actually when mouse enters on it)
  onMouseEnterSidenav = () => {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.add("g-sidenav-show");
    }
  };
  // makes the sidenav mini on hover (actually when mouse leaves from it)
  onMouseLeaveSidenav = () => {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-show");
    }
  };
  // toggles collapse between opened and closed (true/false)
  toggleCollapse = () => {
    this.setState({
      collapseOpen: !this.state.collapseOpen
    });
  };
  // closes the collapse
  closeCollapse = () => {
    this.setState({
      collapseOpen: false
    });
  };
  // this creates the intial state of this component based on the collapse routes
  // that it gets through this.props.routes
  getCollapseStates = routes => {
    let initialState = {};
    routes.map((prop, key) => {
      if (prop.collapse) {
        initialState = {
          [prop.state]: this.getCollapseInitialState(prop.views),
          ...this.getCollapseStates(prop.views),
          ...initialState
        };
      }
      return null;
    });
    return initialState;
  };
  // this verifies if any of the collapses should be default opened on a rerender of this component
  // for example, on the refresh of the page,
  // while on the src/views/forms/RegularForms.jsx - route /admin/regular-forms
  getCollapseInitialState(routes) {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse && this.getCollapseInitialState(routes[i].views)) {
        return true;
      } else if (window.location.href.indexOf(routes[i].path) !== -1) {
        return true;
      }
    }
    return false;
  }
  // this is used on mobile devices, when a user navigates
  // the sidebar will autoclose
  closeSidenav = () => {
    if (window.innerWidth < 1200) {
      this.props.toggleSidenav();
    }
  };

  // toggles modal between opened and closed (true/false)
  toggleModalInicial = () => {
    this.setState({
      modalInicialOpen: !this.state.modalInicialOpen
    });
  };

  // toggles modal between opened and closed (true/false)
  toggleModalAlertaJobs = () => {
    this.setState({
      modalAlertaJobsOpen: !this.state.modalAlertaJobsOpen
    });
  };

  // toggles modal between opened and closed (true/false)
  toggleModalTermosUso = () => {
    this.setState({
      modalTermosUsoOpen: !this.state.modalTermosUsoOpen
    });
  };

  // closes the modal
  openModalInicial = () => {
    this.setState({
      modalInicialOpen: true
    });
  };

  // closes the modal
  openModalAlertaJobs = () => {
    this.setState({
      modalAlertaJobsOpen: true
    });
  };

  // closes the modal
  openModalTermosUso = () => {
    this.setState({
      modalTermosUsoOpen: true
    });
  };

  // aceitar Termos de Uso
  aceitarTermosUso = (aceitar) => {
    this.setState({
      termosUsoVigentesAceitos: aceitar
    });
  };

  // aceitar Termos de Uso
  getNomeTermosUso = () => {

    if (this.state.termosUsoVigentes) {
      return this.state.termosUsoVigentes.nome
    } else {
      return 'Termo Inválido'
    }

  };

  // closes the modal
  closeModalInicial = () => {
    //console.log('Entrou no CLOSE MODAL')
    var currentDate = moment();
    var new_date = currentDate.add(1, 'days');
    localStorage.setItem('proximaDataMostrarModalInicial', new_date)

    this.setState({
      modalInicialOpen: false
    });
  };

  // closes the modal
  closeModalAlertaJobs = () => {
    //console.log('Entrou no CLOSE MODAL')
    var currentDate = moment();
    var new_date = currentDate.add(1, 'hours');
    localStorage.setItem('proximaDataMostrarModalAlertaJobs', new_date)

    this.setState({
      modalAlertaJobsOpen: false
    });
  };

  // closes the modal
  closeModalTermosUso = () => {
    //console.log('Entrou no CLOSE MODAL')
    var currentDate = moment();
    var new_date = currentDate.add(1, 'hours');
    localStorage.setItem('proximaDataMostrarModalTermosUso', new_date)

    this.setState({
      modalTermosUsoOpen: false
    });
  };

  // closes the modal
  naoMostrarMaisModalInicial = () => {
    //console.log('Entrou no NÂO MOSTRAR MAIS CLOSE MODAL')
    localStorage.setItem('isModalInicialOpen', 'false')
    this.setState({
      modalInicialOpen: false
    });
  };

  async getStatusModalInicial() {
    var isModalInicialOpen = localStorage.getItem('isModalInicialOpen')
    var proximaDataMostrarModalInicial = localStorage.getItem('proximaDataMostrarModalInicial')

    var canShowModalByDuracaoJornada = localStorage.getItem('canShowModalByDuracaoJornada')
    var proximaDataValidarCanShowModalByDuracaoJornada = localStorage.getItem('proximaDataValidarCanShowModalByDuracaoJornada')

    if (proximaDataValidarCanShowModalByDuracaoJornada == null) {
      var currentDate = moment();
      var new_date = currentDate.add(1, 'days');
      localStorage.setItem('proximaDataValidarCanShowModalByDuracaoJornada', new_date)
    }

    if (isModalInicialOpen == null) {
      localStorage.setItem('isModalInicialOpen', 'true')
      this.state.modalInicialOpen = true
      isModalInicialOpen = true
    }

    if (isModalInicialOpen == 'true') {
      //console.log('MODAL STORAGE TRUE')
      if (this.getHasEmpresaLogada()) {

        if (this.getPermissaoVideoInicial() && this.getPermissaoVideoInicial() == 'true') {
          //console.log('FLAG PERMISSÂO MOSTRAR MODAL TRUE')
          if (proximaDataMostrarModalInicial ? moment().isAfter(proximaDataMostrarModalInicial) : true) {
            //console.log('PROXIMA DATA CHEGOU')
            //console.log('PERMISSÃO BY DURAÇÃO')
            //console.log({canShowModalByDuracaoJornada})
            //console.log({proximaDataValidarCanShowModalByDuracaoJornada})
            if (canShowModalByDuracaoJornada == null || (proximaDataValidarCanShowModalByDuracaoJornada ? moment().isAfter(proximaDataValidarCanShowModalByDuracaoJornada) : true)) {
              var permissao = await this.canShowModalByDuracaoJornada()
              localStorage.setItem('canShowModalByDuracaoJornada', permissao)
              canShowModalByDuracaoJornada = permissao
              var currentDate = moment();
              var new_date = currentDate.add(1, 'days');
              localStorage.setItem('proximaDataValidarCanShowModalByDuracaoJornada', new_date)
            }
            //console.log({ canShowModalByDuracaoJornada })
            if (canShowModalByDuracaoJornada == 'true') {
              //console.log('PERMISSAO BY DURAÇÃO CONCEDIDA (TRUE)')
              this.state.modalInicialOpen = true
            } else {
              //console.log('PERMISSAO BY DURAÇÃO NÃO CONCEDIDA (FALSE)')
              this.state.modalInicialOpen = false
            }

          } else {
            //console.log('MAS PROXIMA DATA NÂO CHEGOU AINDA')
            this.state.modalInicialOpen = false
          }
        } else {
          //console.log('SEM FLAG PERMISSÃO MOSTRAR MODAL ou FLAG FALSE')
          this.state.modalInicialOpen = false
        }

      } else {
        //console.log('EMPRESA NÂO LOGADA AINDA')
        this.state.modalInicialOpen = false
      }
    } else {
      // console.log('MODAL STORAGE FALSE')
      this.state.modalInicialOpen = false
    }

    // console.log('STATUS FINAL MODAL: ' + this.state.modalInicialOpen)
  }

  async getStatusModalAlertaJobs() {
    var isModalAlertaJobsOpen = localStorage.getItem('isModalAlertaJobsOpen')
    var proximaDataMostrarModalAlertaJobs = localStorage.getItem('proximaDataMostrarModalAlertaJobs')

    var canShowModalByValidacaoJobs = localStorage.getItem('canShowModalByValidacaoJobs')
    var proximaDataValidarCanShowModalByValidacaoJobs = localStorage.getItem('proximaDataValidarCanShowModalByValidacaoJobs')

    if (proximaDataValidarCanShowModalByValidacaoJobs == null) {
      var currentDate = moment();
      var new_date = currentDate.add(1, 'hours');
      localStorage.setItem('proximaDataValidarCanShowModalByValidacaoJobs', new_date)
    }

    if (isModalAlertaJobsOpen == null) {
      localStorage.setItem('isModalAlertaJobsOpen', 'true')
      this.state.modalAlertaJobsOpen = true
      isModalAlertaJobsOpen = true
    }

    if (isModalAlertaJobsOpen == 'true') {
      //console.log('MODAL STORAGE TRUE')
      if (this.getHasEmpresaLogada()) {

        if (proximaDataMostrarModalAlertaJobs ? moment().isAfter(proximaDataMostrarModalAlertaJobs) : true) {
          //console.log('PROXIMA DATA CHEGOU')
          //console.log('PERMISSÃO BY DURAÇÃO')
          //console.log({canShowModalByDuracaoJornada})
          //console.log({proximaDataValidarCanShowModalByDuracaoJornada})
          if (canShowModalByValidacaoJobs == null || (proximaDataValidarCanShowModalByValidacaoJobs ? moment().isAfter(proximaDataValidarCanShowModalByValidacaoJobs) : true)) {
            var permissao = await this.canShowModalByValidacaoJobs()
            localStorage.setItem('canShowModalByValidacaoJobs', permissao)
            canShowModalByValidacaoJobs = permissao
            var currentDate = moment();
            var new_date = currentDate.add(1, 'hours');
            localStorage.setItem('proximaDataValidarCanShowModalByValidacaoJobs', new_date)
          }
          //console.log({ canShowModalByDuracaoJornada })
          if (canShowModalByValidacaoJobs == 'true') {
            //console.log('PERMISSAO BY DURAÇÃO CONCEDIDA (TRUE)')
            this.state.modalAlertaJobsOpen = true
          } else {
            //console.log('PERMISSAO BY DURAÇÃO NÃO CONCEDIDA (FALSE)')
            this.state.modalAlertaJobsOpen = false
          }

        } else {
          //console.log('MAS PROXIMA DATA NÂO CHEGOU AINDA')
          this.state.modalAlertaJobsOpen = false
        }


      } else {
        //console.log('EMPRESA NÂO LOGADA AINDA')
        this.state.modalAlertaJobsOpen = false
      }
    } else {
      // console.log('MODAL STORAGE FALSE')
      this.state.modalAlertaJobsOpen = false
    }

    // console.log('STATUS FINAL MODAL: ' + this.state.modalInicialOpen)
  }


  async getStatusModalTermosUso() {
    var isModalTermosUsoOpen = localStorage.getItem('isModalTermosUsoOpen')
    var proximaDataMostrarModalTermosUso = localStorage.getItem('proximaDataMostrarModalTermosUso')

    var canShowModalByValidacaoTermosUso = localStorage.getItem('canShowModalByValidacaoTermosUso')
    var proximaDataValidarCanShowModalByValidacaoTermosUso = localStorage.getItem('proximaDataValidarCanShowModalByValidacaoTermosUso')

    if (proximaDataValidarCanShowModalByValidacaoTermosUso == null) {
      var currentDate = moment();
      var new_date = currentDate.add(1, 'hours');
      localStorage.setItem('proximaDataValidarCanShowModalByValidacaoTermosUso', new_date)
    }

    if (isModalTermosUsoOpen == null) {
      localStorage.setItem('isModalTermosUsoOpen', 'true')
      this.state.modalTermosUsoOpen = true
      isModalTermosUsoOpen = true
    }

    if (isModalTermosUsoOpen == 'true') {
      //console.log('MODAL STORAGE TRUE')
      if (this.getHasEmpresaLogada()) {

        if (proximaDataMostrarModalTermosUso ? moment().isAfter(proximaDataMostrarModalTermosUso) : true) {
          //console.log('PROXIMA DATA CHEGOU')
          //console.log('PERMISSÃO BY DURAÇÃO')
          //console.log({canShowModalByDuracaoJornada})
          //console.log({proximaDataValidarCanShowModalByDuracaoJornada})
          if (canShowModalByValidacaoTermosUso == null || (proximaDataValidarCanShowModalByValidacaoTermosUso ? moment().isAfter(proximaDataValidarCanShowModalByValidacaoTermosUso) : true)) {
            var permissao = await this.canShowModalByValidacaoTermosUso()
            localStorage.setItem('canShowModalByValidacaoTermosUso', permissao)
            canShowModalByValidacaoTermosUso = permissao
            var currentDate = moment();
            var new_date = currentDate.add(1, 'hours');
            localStorage.setItem('proximaDataValidarCanShowModalByValidacaoTermosUso', new_date)
          }
          //console.log({ canShowModalByDuracaoJornada })
          if (canShowModalByValidacaoTermosUso == 'true') {
            //console.log('PERMISSAO BY DURAÇÃO CONCEDIDA (TRUE)')
            this.state.modalTermosUsoOpen = true
          } else {
            //console.log('PERMISSAO BY DURAÇÃO NÃO CONCEDIDA (FALSE)')
            this.state.modalTermosUsoOpen = false
          }

        } else {
          //console.log('MAS PROXIMA DATA NÂO CHEGOU AINDA')
          this.state.modalTermosUsoOpen = false
        }


      } else {
        //console.log('EMPRESA NÂO LOGADA AINDA')
        this.state.modalTermosUsoOpen = false
      }
    } else {
      // console.log('MODAL STORAGE FALSE')
      this.state.modalTermosUsoOpen = false
    }

    // console.log('STATUS FINAL MODAL: ' + this.state.modalInicialOpen)
  }

  handlerVerTermos() {
    try {
      console.log(this.state.termosUsoVigentes?.link_url)
      window.open(this.state.termosUsoVigentes?.link_url, '_blank');
    } catch (error) {
      console.log(error)
    }
  }


  async handlerAceitarTermos() {
    try {
      const response = await api.post(`/common/empresas/${this.getIdEmpresaLogada()}/termos-uso/${this.state.termosUsoVigentes?.id}/assinar-termos-uso`)
      console.log('Retorno Aceitar Termos')
      console.log({ response })
      if (response.data && response.data.termos_uso_id && response.data.termos_uso_id > 0) {
        this.closeModalTermosUso()
      }

    } catch (error) {
      console.log(error)

    }
  }


  onAcademyClicked(eventAcademy, propetiesAcademy) {
    //var href = `${propetiesAcademy.path}${propetiesAcademy.alias === 'treinamento_netiz' ? '?tokenNetiz=' + this.getToken() + '&idPerfilNegocio=' + this.getPerfilNegocioEmpresaLogada() : ''}`
    window.open(this.state.linkNetizAcademy)
  }

  onContratarClicked(eventAcademy, propetiesAcademy) {
    var url = ``
    url = `https://netiz.com/planos-precos.html?empresa_id=${this.getIdEmpresaLogada()}`
    //teste local
    //url = `http://127.0.0.1:5500/planos-precos.html?empresa_id=${this.getIdEmpresaLogada()}`
    window.open(url)
  }

  onAvisarSuporteClicked() {
    var url = ``
    url = `https://api.whatsapp.com/send?phone=5579996741562&text=Olá%20Suporte.%20Favor%20verificar%20os%20JOBs,%20pois%20algum%20deles%20pode%20estar%20atrasado%20em%20sua%20execução.%20Obrigado!`
    window.open(url)
  }


  // this function creates the links and collapses that appear in the sidebar (left menu)
  createLinks = routes => {
    return routes.map((prop, key) => {
      if (prop.redirect || prop.hidden) {
        return null;
      }
      if (prop.collapse) {
        var st = {};
        st[prop["state"]] = !this.state[prop.state];
        return (
          <NavItem key={key}>
            <NavLink
              href="#"
              data-toggle="collapse"
              aria-expanded={this.state[prop.state]}
              className={classnames({
                active: this.getCollapseInitialState(prop.views)
              })}
              onClick={e => {
                e.preventDefault();
                this.setState(st);
              }}
            >
              {prop.icon ? <i className={prop.icon} /> : null}
              <span className="nav-link-text">{prop.name}</span>
            </NavLink>
            <Collapse isOpen={this.state[prop.state]}>
              <Nav className="nav-sm flex-column">
                {this.createLinks(prop.views)}
              </Nav>
            </Collapse>
          </NavItem>
        );
      }


      var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
      var regex = new RegExp(expression);
      const isExternalLink = prop.path ? prop.path.match(regex) ? true : (prop.path.includes('http://localhost:5500') || prop.path.includes('http://localhost:5501') || prop.path.includes('http://localhost:8080') || prop.path.includes('http://localhost:8081')) : false
      let isExternalLinkLocal = false;

      if (!isExternalLink) {
        isExternalLinkLocal = prop.path ? prop.path.includes('file:///') : false
      }

      if (isExternalLink && prop?.alias == 'treinamento_netiz') {
        this.state.linkNetizAcademy = `${prop.path}?tokenNetiz=${this.getToken()}&idPerfilNegocio=${this.getPerfilNegocioEmpresaLogada()}&idEmpresaLogada=${this.getIdEmpresaLogada()}`
      }

      return (
        <NavItem
          className={this.activeRoute(prop.layout + prop.path)}
          key={key}
        >
          {isExternalLink || isExternalLinkLocal ?

            prop.alias == 'treinamento_netiz' ?
              <>
                <a
                  className='nav-link'
                  href={`${prop.path}?tokenNetiz=${this.getToken()}&idPerfilNegocio=${this.getPerfilNegocioEmpresaLogada()}&idEmpresaLogada=${this.getIdEmpresaLogada()}`}
                  target='_blank'
                  style={{
                    background: '#f5365c',
                    borderColor: '#f5365c',
                    color: '#fff',
                    marginLeft: '.5rem',
                    marginRight: '.5rem',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    borderRadius: '0.375rem',
                    marginTop: '1rem',
                  }}
                >
                  {prop.icon !== undefined ? (
                    <>
                      <i className={prop.icon} />
                      <span className="nav-link-text">{prop.name}</span>
                    </>
                  ) : (
                    prop.name
                  )}
                </a>
              </>

              :

              <>
                <a
                  className='nav-link'
                  href={prop.path}
                  target='_blank'
                >
                  {prop.icon !== undefined ? (
                    <>
                      <i className={prop.icon} />
                      <span className="nav-link-text">{prop.name}</span>
                    </>
                  ) : (
                    prop.name
                  )}
                </a>
              </>

            :

            <NavLink
              to={prop.layout + prop.path}
              activeClassName=""
              onClick={this.closeSidenav}
              tag={NavLinkRRD}
            >
              {prop.icon !== undefined ? (
                <>
                  <i className={prop.icon} />
                  <span className="nav-link-text">{prop.name}</span>
                </>
              ) : (
                prop.name
              )}
            </NavLink>
          }

        </NavItem >
      );
    });
  };

  createDocLinks = () => {
    if (process.env.NODE_ENV != 'production') {
      return (
        <>
          <hr className="my-3" />
          <h6 className="navbar-heading p-0 text-muted">Documentation</h6>
          <Nav className="mb-md-3" navbar>
            <NavItem>
              <NavLink
                href="https://demos.creative-tim.com/argon-dashboard-pro-react/#/documentation/overview?ref=adpr-sidebar"
                target="_blank"
              >
                <i className="ni ni-spaceship" />
                <span className="nav-link-text">Getting started</span>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="https://demos.creative-tim.com/argon-dashboard-pro-react/#/documentation/colors?ref=adpr-sidebar"
                target="_blank"
              >
                <i className="ni ni-palette" />
                <span className="nav-link-text">Foundation</span>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="https://demos.creative-tim.com/argon-dashboard-pro-react/#/documentation/alert?ref=adpr-sidebar"
                target="_blank"
              >
                <i className="ni ni-ui-04" />
                <span className="nav-link-text">Components</span>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="https://demos.creative-tim.com/argon-dashboard-pro-react/#/documentation/charts?ref=adpr-sidebar"
                target="_blank"
              >
                <i className="ni ni-chart-pie-35" />
                <span className="nav-link-text">Plugins</span>
              </NavLink>
            </NavItem>
          </Nav>
        </>
      )
    }
  }

  render() {

    const { routes, logo } = this.props;
    //console.log(routes)
    this.getTermosUsoVigente('render');
    this.getStatusModalInicial();
    this.getStatusModalAlertaJobs();
    this.getStatusModalTermosUso();
    let navbarBrandProps;
    if (logo && logo.innerLink) {
      navbarBrandProps = {
        to: logo.innerLink,
        tag: Link
      };
    } else if (logo && logo.outterLink) {
      navbarBrandProps = {
        href: logo.outterLink,
        target: "_blank"
      };
    }
    const scrollBarInner = (
      <div className="scrollbar-inner">
        <div className="sidenav-header d-flex align-items-center">
          {logo ? (
            <NavbarBrand
              className="text-center"
              {...navbarBrandProps}>
              <img src={logo.imgSrc}
                width="90%"
              />
            </NavbarBrand>
          ) : null}
          <div className="ml-auto">
            <div
              className={classnames("sidenav-toggler d-none d-xl-block", {
                active: this.props.sidenavOpen
              })}
              onClick={this.props.toggleSidenav}
            >
              <div className="sidenav-toggler-inner">
                <i className="sidenav-toggler-line" />
                <i className="sidenav-toggler-line" />
                <i className="sidenav-toggler-line" />
              </div>
            </div>
          </div>
        </div>
        <div className="navbar-inner">
          <Collapse navbar isOpen={true}>
            <Nav navbar>{this.createLinks(routes)}</Nav>
            {this.createDocLinks()}
          </Collapse>
        </div>
      </div>
    );

    return (
      <>
        <Modal
          className="modal-dialog-centered"
          isOpen={this.state.modalInicialOpen}
          toggle={() => this.toggleModalInicial()}
          size="lg" style={{ maxWidth: '1024px', width: '100%' }}
        >
          <div className="modal-header" style={{ background: '#12ccf0', color: 'white', justifyContent: 'center' }}>
            <h8 className="modal-title" id="modal-title-notification" style={{ fontSize: 35, textAlign: 'center' }}>
              Bem vindo à sua jornada de crescimento
            </h8>
          </div>
          <div className="modal-body">
            <div className="py-3 text-center" style={{ padding: 60, marginTop: -30, fontSize: 22, color: 'black' }}>
              Assista ao vídeo e entenda como você vai fazer o seu negócio crescer como nunca imaginou!
            </div>

            <Row>
              <Col lg={6} md={12} sm={12}>
                <div className="embed-responsive embed-responsive-4by3" >
                  <iframe className="embed-responsive-item" src={this.getLinkVideoInicial()} frameborder="0"></iframe>
                </div>
              </Col>

              <Col lg={6} md={12} sm={12} className={"star-row"} style={{ display: 'grid' }}>

                <div className={"star-div"} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <i className="fas fa-star star-icon" style={{ fontSize: 40, color: 'green' }} />
                  <div style={{ marginLeft: 10, fontSize: 20, fontWeight: 500, color: 'black' }}>
                    Uma Jornada transformadora em apenas 30 dias.
                  </div>
                </div>

                <div className={"star-div"} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <i className="fas fa-star star-icon" style={{ fontSize: 40, color: 'green' }} />
                  <div style={{ marginLeft: 10, fontSize: 20, fontWeight: 500, color: 'black' }}>
                    Estratégias práticas para aplicar em seu negócio.
                  </div>
                </div>

                <div className={"star-div"} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <i className="fas fa-star star-icon" style={{ fontSize: 40, color: 'green' }} />
                  <div style={{ marginLeft: 10, fontSize: 20, fontWeight: 500, color: 'black' }}>
                    Conteúdo fácil de aplicar e direto ao ponto.
                  </div>
                </div>

                <div className={"star-div"} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <i className="fas fa-star star-icon" style={{ fontSize: 40, color: 'green' }} />
                  <div style={{ marginLeft: 10, fontSize: 20, fontWeight: 500, color: 'black' }}>
                    Uma ferramenta para apoiar a execução das estratégias.
                  </div>
                </div>

                <div className={"star-div"} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <Button
                    onClick={e => this.onAcademyClicked()}
                    className="btn-danger "
                    block
                    color="danger"
                    type="button">
                    Ir para minha jornada
                  </Button>
                </div>

              </Col>

            </Row>

            {localStorage.getItem('diasFimJornada') > -1 ?
              localStorage.getItem('diasFimJornada') > 1 ?
                <div className="py-3 text-center" style={{ padding: 60, fontSize: 22, color: 'black' }}>
                  Fique atento! Sua jornada termina em {localStorage.getItem('diasFimJornada')} dias!
                </div>
                :
                localStorage.getItem('diasFimJornada') > 0 ?
                  <div className="py-3 text-center" style={{ padding: 60, fontSize: 22, color: 'black' }}>
                    Fique atento! Sua jornada termina AMANHÃ!
                  </div>
                  :
                  <div className="py-3 text-center" style={{ padding: 60, fontSize: 22, color: 'black' }}>
                    Fique atento! Sua jornada termina HOJE!
                  </div>
              :
              <></>
            }

            <div style={{ display: this.state.displayButtonContratar, flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <Button
                onClick={e => this.onContratarClicked()}
                className="btn-success"
                block
                color="success"
                type="button">
                QUERO CONTRATAR AGORA
              </Button>
            </div>


          </div>
          <div className="modal-footer">

            <div style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'space-between',
              padding: 4
            }}>

              <Button
                style={{ fontSize: 10, color: 'gray', height: 10, marginTop: 15 }}
                color="link"
                data-dismiss="modal"
                type="button"
                onClick={() => this.naoMostrarMaisModalInicial()}
              >
                não mostrar
              </Button>
              <Button
                onClick={() => this.closeModalInicial()}
                className="btn-white"
                color="default"
                type="button">
                Fechar
              </Button>

            </div>

          </div>
        </Modal>


        <Modal
          className="modal-dialog-centered modal-warning"
          size="md"
          isOpen={this.state.modalAlertaJobsOpen}
          toggle={() => this.toggleModalAlertaJobs()}
        >
          <div className="modal-header">
            <h6 className="modal-title" id="modal-title-notification">
              Alerta de JOBs Atrasados
            </h6>
          </div>
          <div className="modal-body">
            <div className="py-3 text-center">
              <i className="fas fa-exclamation-circle ni-3x" />
              <h4 className="heading mt-4"></h4>
              <p>
                Se você está vendo esse aviso, é bem provavel que algum serviço automatizado do Sistema esteja atrasado em sua execução. Faça-nos um favor: avise ao setor de suporte técnico.
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <Button
              className="text-white ml-auto"
              color="link"
              data-dismiss="modal"
              type="button"
              onClick={() => this.closeModalAlertaJobs()}
            >
              Fechar
            </Button>
            <Button
              onClick={() => this.onAvisarSuporteClicked()}
              className="btn-white"
              color="default"
              type="button">
              Avisar ao Suporte
            </Button>
          </div>
        </Modal>


        <Modal
          className={"modal-dialog-centered modal-danger"}
          size="md"
          isOpen={this.state.modalTermosUsoOpen}
        // toggle={() => this.toggleModalTermosUso()}
        >
          <div className="modal-header">
            <h6 className="modal-title" id="modal-title-notification">
              Assinatura de Política de Privacidade
            </h6>
          </div>
          <div className="modal-body">
            <div className="py-3 text-center">
              <i className={"fas fa-file-signature ni-3x"}></i>
              <h4 className="heading mt-4"></h4>
              <>
                <p>
                  ATENÇÃO
                </p>
                <p>
                  A empresa ainda não aceitou os Termos de Uso vigentes. Acesse os Termos de Uso, leia atentamente e, após isso, registre a aceitação.
                </p>
                <p>
                  {/* {this.state.termosUsoVigentes?.nome} */}
                  {this.getNomeTermosUso()}
                </p>
              </>
              <div className="custom-control custom-checkbox mr-4">
                <input
                  className="custom-control-input"
                  id="check-sms"
                  type="checkbox"
                  checked={this.state.termosUsoVigentesAceitos}
                  onChange={({ target }) => this.aceitarTermosUso(target.checked)}
                />
                <label className="custom-control-label" htmlFor="check-sms">
                  Aceito os Termos Vigentes
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <div>
              <Button
                className="text-white ml-auto"
                color="link"
                data-dismiss="modal"
                type="button"
                onClick={() => this.closeModalTermosUso()}
              >
                Fechar
              </Button>

              <Button
                onClick={() => this.handlerVerTermos()}
                className="btn-white"
                color="default"
                type="button">
                Ver Termos
              </Button>

              <Button
                onClick={() => this.handlerAceitarTermos()}
                className="btn-white"
                color="default"
                type="button"
                disabled={!this.state.termosUsoVigentesAceitos}>
                Aceitar
              </Button>

            </div>
          </div>
        </Modal>


        <Navbar
          className="sidenav navbar-vertical fixed-left navbar-expand-xs navbar-light bg-white"
          onMouseEnter={this.onMouseEnterSidenav}
          onMouseLeave={this.onMouseLeaveSidenav}
        >
          {navigator.platform.indexOf("Win") > -1 ? (
            <PerfectScrollbar>{scrollBarInner}</PerfectScrollbar>
          ) : (
            scrollBarInner
          )}
        </Navbar>
      </>
    );
  }
}

Sidebar.defaultProps = {
  routes: [{}],
  toggleSidenav: () => { },
  sidenavOpen: false
};

Sidebar.propTypes = {
  // function used to make sidenav mini or normal
  toggleSidenav: PropTypes.func,
  // prop to know if the sidenav is mini or normal
  sidenavOpen: PropTypes.bool,
  // links that will be displayed inside the component
  routes: PropTypes.arrayOf(PropTypes.object),
  // logo
  logo: PropTypes.shape({
    // innerLink is for links that will direct the user within the app
    // it will be rendered as <Link to="...">...</Link> tag
    innerLink: PropTypes.string,
    // outterLink is for links that will direct the user outside the app
    // it will be rendered as simple <a href="...">...</a> tag
    outterLink: PropTypes.string,
    // the image src of the logo
    imgSrc: PropTypes.string.isRequired,
    // the alt for the img
    imgAlt: PropTypes.string.isRequired
  })
};

export default Sidebar;
