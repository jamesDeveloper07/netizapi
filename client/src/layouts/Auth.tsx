import React, { useEffect, useState, useContext } from "react";
import AuthContext from '../contexts/Auth'
// react library for routing
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
// nodejs library to set properties for components
import PropTypes from "prop-types";

// core components
import AuthNavbar from "../components/Navbars/AuthNavbar.jsx";
import AuthFooter from "../components/Footers/AuthFooter.jsx";

import { authRoutes as routes } from "../routes";
import { getComponent } from '../routes/componentsPath'

const Auth: React.FC = () => {

  const location = useLocation()
  const history = useHistory()
  const { signed } = useContext(AuthContext)

  useEffect(() => {
    document.body.classList.add("bg-primary");
    redirectRecoveryPassword()
    return () => {
      document.body.classList.remove("bg-primary");
    }
  }, [])

  useEffect(() => {
    if (signed) {
      history?.push('/admin')
    }
  }, [signed])

  function redirectRecoveryPassword() {
    const path = location.pathname;
    if (path == '/auth/recovery-password') {
      const windowLocation = window.location
      if (windowLocation.origin.includes('hml')) {
        const search = location.search
        window.location.href = "https://netiz.com.br/auth/recovery-password" + search
      }
    }
  }


  const getRoutes = (routes: Array<any>): Array<any> | null => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      if (prop.layout === "/auth") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };

  return (
    <>
      <div className="main-content" >
        <AuthNavbar />
        <Switch>{getRoutes(routes)}</Switch>
      </div>
      <AuthFooter />
    </>
  );
}

export default Auth;
