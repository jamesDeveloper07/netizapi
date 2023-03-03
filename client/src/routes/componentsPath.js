import Login from "../pages/security/auth/SignIn";

//components do acelerando vendas
import Clientes from '../pages/common/Clientes'
import NewCliente from '../pages/common/Clientes/New.js'
import EditCliente from '../pages/common/Clientes/Edit.js'

import Empresas from '../pages/common/Empresas'
import NewEmpresa from '../pages/common/Empresas/New'
import EditEmpresa from '../pages/common/Empresas/Edit'
import MinhaEmpresa from "../pages/common/Empresas/MinhaEmpresa";

import Usuarios from '../pages/security/Users'
import NewUsuario from '../pages/security/Users/New'
import EditUsuario from '../pages/security/Users/Edit'
import Perfil from '../pages/security/Perfis'
import EditPerfil from '../pages/security/Perfis/Edit'
import NewPerfil from '../pages/security/Perfis/New'

import TermosUso from "../pages/common/Empresas/TermosUso";
import NewTermosUso from "../pages/common/Empresas/TermosUso/New";
import EditTermosUso from "../pages/common/Empresas/TermosUso/Edit";

import Solicitacoes from "../pages/common/Empresas/Solicitacoes";
import NewSolicitacao from "../pages/common/Empresas/Solicitacoes/New";
import EditSolicitacao from "../pages/common/Empresas/Solicitacoes/Edit";

import Watch from "../pages/common/Empresas/Watch/Pacotes";
import Tickets from "../pages/common/Empresas/Watch/Pacotes/Tickets";
import NewTicket from "../pages/common/Empresas/Watch/Pacotes/Tickets/New";
// import EditSolicitacao from "../pages/common/Empresas/Solicitacoes/Edit";

import DashboardAppNetiz from "../pages/dashboard/appNetiz";

import Notificacoes from '../pages/security/Notificacoes'

import Proto from '../pages/proto/proto'

import Wellcome from '../layouts/Wellcome'
import MeEdit from '../pages/security/Users/me/Edit.js'

export const getComponent = (path) => {
    for (let p of paths) {
        if (p.path === path) {
            return p
        }
    }
    return null
}

const paths = [
    {
        path: '/minha-empresa',
        component: MinhaEmpresa,
        layout: '/admin'
    },
    {
        path: '/perfis/:id/edit',
        component: EditPerfil,
        layout: '/admin'
    },
    {
        path: '/perfis/new',
        component: NewPerfil,
        layout: '/admin'
    },
    {
        path: '/perfis',
        component: Perfil,
        layout: '/admin'
    },
    {
        path: '/usuarios/:id/edit',
        component: EditUsuario,
        layout: '/admin'
    },
    {
        path: '/usuarios/new',
        component: NewUsuario,
        layout: '/admin'
    },
    {
        path: '/usuarios',
        component: Usuarios,
        layout: '/admin'
    },
    {
        path: '/empresas/:id/edit',
        component: EditEmpresa,
        layout: '/admin'
    },
    {
        path: '/empresas/new',
        component: NewEmpresa,
        layout: '/admin'
    },
    {
        path: '/empresas',
        component: Empresas,
        layout: '/admin'
    },
    {
        path: '/wellcome',
        component: Wellcome,
        layout: '/admin'
    },
    {
        path: "/clientes",
        component: Clientes,
        layout: "/admin"
    },
    {
        path: '/me/edit',
        component: MeEdit,
        layout: '/admin'
    },
    {
        path: '/clientes/new',
        component: NewCliente,
        layout: '/admin'
    },
    {
        path: '/clientes/:id/edit',
        component: EditCliente,
        layout: '/admin'
    },
    {
        path: "/proto",
        component: Proto,
        layout: "/admin"
    },
    {
        hidden: true,
        path: "/login",
        name: "Login",
        component: Login,
        layout: "/auth"
    },

    {
        path: '/termos-uso',
        component: TermosUso,
        layout: '/admin'
    },
    {
        path: '/termos-uso/new',
        component: NewTermosUso,
        layout: '/admin'
    },
    {
        path: '/termos-uso/:id/edit',
        component: EditTermosUso,
        layout: '/admin'
    },

    {
        path: '/solicitacoes',
        component: Solicitacoes,
        layout: '/admin'
    },
    {
        path: '/solicitacoes/new',
        component: NewSolicitacao,
        layout: '/admin'
    },
    {
        path: '/solicitacoes/:id/edit',
        component: EditSolicitacao,
        layout: '/admin'
    },

    {
        path: '/dashboard/app-netiz',
        component: DashboardAppNetiz,
        layout: '/admin'
    },


    {
        path: '/notificacoes',
        component: Notificacoes,
        layout: '/admin'
    },

    {
        path: '/watch/pacotes',
        component: Watch,
        layout: '/admin'
    },
    {
        path: '/watch/pacotes/:codigo/tickets',
        component: Tickets,
        layout: '/admin'
    },
    {
        path: '/watch/pacotes/:codigo/tickets/new',
        component: NewTicket,
        layout: '/admin'
    },
    // {
    //     path: '/solicitacoes/new',
    //     component: NewSolicitacao,
    //     layout: '/admin'
    // },
    // {
    //     path: '/solicitacoes/:id/edit',
    //     component: EditSolicitacao,
    //     layout: '/admin'
    // },
]