import React, { ElementType, useContext, useEffect } from "react";
import AuthContext from './contexts/Auth'
import { isAuthenticated } from "./services/auth";
import { EmpresaProvider } from './contexts/Empresa'
import { MensagemProvider } from './contexts/Mensagem'

import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
  RouteProps
} from "react-router-dom";


import AdminLayout from "./layouts/Admin.jsx";
import AuthLayout from "./layouts/Auth";

const PrivateRoute: React.FC<RouteProps & { signed: boolean }> = ({ component, signed, ...rest }) => {

  const Component = component as ElementType

  console.log('Entrou no APP')

  return < Route
    {...rest}
    render={props =>
      isAuthenticated() ? (
        <EmpresaProvider>
          <MensagemProvider>
            <Component {...props} />
          </MensagemProvider>
        </EmpresaProvider>
      ) : (
          <Redirect to={{ pathname: "/auth/login", state: { from: props.location } }} />
        )
    }
  />
};


const App: React.FC = ({ }) => {

  const { signed, } = useContext(AuthContext)

  return (<BrowserRouter>
    <Switch>
      <PrivateRoute signed={signed} path="/admin" component={AdminLayout} />

      <Route path="/auth" component={AuthLayout} />
      <Redirect from="/auth" to="/auth/login" />
      <Redirect from="/" to="/admin" />
      <Route component={() => <h1>Nada</h1>} />
    </Switch>
  </BrowserRouter>
  );
}
export default App;