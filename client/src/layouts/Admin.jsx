import React from "react";
// react library for routing
import { Route, Switch } from "react-router-dom";
// core components
import AdminNavbar from "../components/Navbars/AdminNavbar";
import AdminFooter from "../components/Footers/AdminFooter.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Wellcome from '../layouts/Wellcome'
import NotFound from '../layouts/NotFound'

//import routes from "../routes";
import { getComponent } from '../routes/componentsPath'

class Admin extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sidenavOpen: true,
      menus: [],
      sidebarMenus: [],
      routes: []
    };
  }

  componentDidMount() {
    //this.getRoutes(routes)
    this.getRoutes(this.state.routes)
  }

  changeRoutes(routes) {
    // console.log('ENTROU NO CHANGEROUTES ADMIN.jsx')
    // console.log({ routes })
    if (routes && routes.length > 0) {
      // console.log('ROUTES ENCONTRADAS')
      //this.state.routes = routes
      this.setState({
        ...this.state,
        routes
      });
      //this.getRoutes(this.state.routes)
      this.getRoutes(routes)
    }
  }

  componentDidUpdate(e) {
    if (e.history.pathname !== e.location.pathname) {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.refs.mainContent.scrollTop = 0;
    }
  }

  createMenu(item) {
    const object = getComponent(item.path)
    const routeMenu = this.createMenuRoute(item)
    if (routeMenu) {
      //Se existir uma rota para esse menu...
      const menus = this.state.menus
      menus.push(routeMenu)
      this.setState({ ...this.state, menus })
    }
    return {
      alias: item.alias,
      path: item.path,
      compotent: object ? object.component : null,
      name: item.nome,
      ordem: item.ordem,
      icon: item.icon,
      layout: '/admin',
    }
  }

  createMenuRoute(item) {
    if (item.path) {
      const object = getComponent(item.path)
      return (
        <Route
        key={'key-item-'+item.id}
          path={'/admin' + item.path}
          exact
          component={object ? object.component : NotFound}
        />
      )
    }
  }

  getRoutes(routes) {
    //const response = await routes();
    const response = routes;
    // console.log('GET ROUTES ADMIN.jsx')
    // console.log({ routes })
    let sidebarMenus = response.filter((item) => !item.hidden)
    sidebarMenus = sidebarMenus.map((prop) => {
      const item = this.createMenu(prop)
      if (prop.menus && prop.menus.length > 0) {
        item['views'] = prop.menus.map((obj) => this.createMenu(obj))
        item['collapse'] = true
        item['state'] = prop.alias
      }
      return item
    })

    //Cria as rotas para os menus foras da sidebar
    response.filter((item) => item.hidden)
      .map((item) => this.createMenu(item))

    this.setState({
      ...this.state,
      sidebarMenus
    })
  };

  getBrandText = path => {
    for (let i = 0; i < this.state.routes.length; i++) {
      if (
        this.props.location.pathname.indexOf(
          this.state.routes[i].layout + this.state.routes[i].path
        ) !== -1
      ) {
        return this.state.routes[i].name;
      }
    }
    return "Brand";
  };
  // toggles collapse between mini sidenav and normal
  toggleSidenav = e => {
    if (document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-pinned");
      document.body.classList.add("g-sidenav-hidden");
    } else {
      document.body.classList.add("g-sidenav-pinned");
      document.body.classList.remove("g-sidenav-hidden");
    }
    this.setState({
      sidenavOpen: !this.state.sidenavOpen
    });
  };
  getNavbarTheme = () => {
    return this.props.location.pathname.indexOf(
      "admin/alternative-dashboard"
    ) === -1
      ? "dark"
      : "light";
  };

  render() {

    return (
      <>
        <Sidebar
          {...this.props}
          routes={this.state.sidebarMenus}
          toggleSidenav={this.toggleSidenav}
          sidenavOpen={this.state.sidenavOpen}
          logo={{
            innerLink: "/",
            imgSrc: require("../assets/img/brand/full_logo_ligth.svg"),
            imgAlt: "..."
          }}
        />
        <div
          className="main-content"
          ref="mainContent"
          onClick={this.closeSidenav}
        >
          <AdminNavbar
            {...this.props}
            theme={this.getNavbarTheme()}
            toggleSidenav={this.toggleSidenav}
            sidenavOpen={this.state.sidenavOpen}
            brandText={this.getBrandText(this.props.location.pathname)}
            changeRoutes={this.changeRoutes.bind(this)}

          />
          {
            (window.location.pathname === '/admin' || window.location.pathname === '/admin/') ?
              <Wellcome />
              :
              <Switch>{this.state.menus}</Switch>
          }
          <AdminFooter />
        </div>
        {this.state.sidenavOpen ? (
          <div className="backdrop d-xl-none" onClick={this.toggleSidenav} />
        ) : null}
      </>
    );
  }
}

export default Admin;
