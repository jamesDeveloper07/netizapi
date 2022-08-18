import Login from "../pages/security/auth/SignIn";
import RecoverySession from "../pages/security/auth/RecoverySession";
import ForgotPassword from '../pages/security/auth/ForgotPassword'
import RecoveryPassword from '../pages/security/auth/RecoveryPassword'

import api from "../services/api";

//deixou de ser usado
const routes = async () => {
  try {
    const response = await api.get('/security/sessions/menus')
    return response.data
  } catch (erro) {
    console.log(erro)
  }
  return [{
    hidden: true,
    path: "/login",
    name: "Login",
    component: Login,
    layout: "/auth"
  },]
}

export const authRoutes = [
  {
    hidden: true,
    path: "/login",
    name: "Login",
    component: Login,
    layout: "/auth"
  },
  {
    hidden: true,
    path: "/recovery-session",
    name: "Recovery Session",
    component: RecoverySession,
    layout: "/auth"
  },
  {
    hidden: true,
    path: "/forgot-password",
    name: "Forgot Password",
    component: ForgotPassword,
    layout: "/auth"
  },
  {
    hidden: true,
    path: "/recovery-password",
    name: "Recovery Password",
    component: RecoveryPassword,
    layout: "/auth"
  }
]



export default routes;
