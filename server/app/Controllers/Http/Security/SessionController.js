'use strict'
const User = use('App/Models/Security/User')
const Role = use('Adonis/Acl/Role')
const Permission = use('Adonis/Acl/Permission')

class SessionController {

    async create({ request, auth }) {
        const { email, password, refresh_token } = request.all()

        if (refresh_token) {
            return await auth
                .newRefreshToken()
                .generateForRefreshToken(refresh_token, true)
        }

        const token = await auth
            .withRefreshToken()
            .attempt(email, password)
        const user = await User.findBy({ email })

        //await user.loadMany(['roles', 'permissions', 'roles.permissions'])

        return { user, auth: token }
    }

    async destroy({ auth }) {
        const user = auth.getUser();
        const token = auth.getToken();

        await user.tokens().where('token', token).update({ is_revoked: true });
    }

    async show({ request, auth}) {
        // console.log('##### SHOW SESSION ####')

        let user = await auth.getUser();

        let header = request.headers()
        let empresa_id = header.empresa_id

        // console.log('##### SHOW SESSION ####')
        // console.log({ header })
        // console.log({ empresa_id })

        if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
            // console.log('##### BUSCANDO DO REQUEST ####')
            const {emp_id} = request.only(['emp_id'])
            // console.log({ emp_id })
            empresa_id = emp_id
            // console.log({empresa_id})
        }

        if (empresa_id && !isNaN(empresa_id) && parseInt(empresa_id) > 0) {
            // console.log('ENTROU NO IF EMPRESA (SHOW SESSION)')

            const roles = await Role.query()
                .whereRaw(`id in (
                SELECT role_id from security.roles_users_empresas
                    where user_id = ${user.id}
                    and empresa_id = ${empresa_id} )`)
                .fetch()

            for (let role of roles.rows) {
                role.$relations.permissions = await Permission.query()
                    .whereRaw(`id in(
                SELECT permission_id FROM public.permission_role
                WHERE role_id = ${role.id})`)
                    .fetch();
            }

            user.$relations.roles = roles;

        } else {
            // console.log('ENTROU NO ELSE EMPRESA (SHOW SESSION)')
        }

        return user;
    }

    async refreshRoles({ request, auth }) {
        let userAuth = await auth.getUser();
        const { empresa_id } = request.all();

        // console.log('ENTROU NO REFRESH ROLES (SESSION CONTROLLER)')
        // console.log({ userAuth })
        // console.log({ empresa_id })

        const user = await User.findBy({ email: userAuth.email })
        await user.loadMany(['permissions'])

        if (empresa_id) {
            // console.log('ENTROU NO IF EMPRESA (REFRESH ROLES)')

            const roles = await Role.query()
                .whereRaw(`id in (
                SELECT role_id from security.roles_users_empresas
                    where user_id = ${user.id}
                    and empresa_id = ${empresa_id} )`)
                .fetch()


            for (let role of roles.rows) {
                role.$relations.permissions = await Permission.query()
                    .whereRaw(`id in(
                SELECT permission_id FROM public.permission_role
                WHERE role_id = ${role.id})`)
                    .fetch();
                // console.log({ role })
            }

            user.$relations.roles = roles;

        } else {
            // console.log('ENTROU NO ELSE EMPRESA (REFRESH ROLES)')
            //Carrega os dados adicionais do user
            await user.loadMany(['roles', 'permissions', 'roles.permissions'])
        }


        // console.log('ANTES DO RETURN NO REFRESH ROLES (SESSION CONTROLLER)')
        // console.log({ user })

        return { user }
    }
}

module.exports = SessionController
