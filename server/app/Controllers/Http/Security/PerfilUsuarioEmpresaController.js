'use strict'

const User = use("App/Models/Security/User");
const Role = use('Adonis/Acl/Role')
const RoleUserEmpresa = use("App/Models/Security/RoleUserEmpresa");
const Database = use('Database')

class PerfilUsuarioEmpresaController {

    async index({ params }) {
        const { user_id, empresa_id } = params

        const roles = await Role.query()
            .whereRaw(`id in (
                SELECT role_id from security.roles_users_empresas
                    where user_id = ${user_id} 
                    and empresa_id = ${empresa_id} )`)
            .fetch()

        return roles
    }

    async store({ params, request }) {
        const { id } = request.only(['id'])
        const { user_id, empresa_id } = params

        await Database.raw(`INSERT INTO security.roles_users_empresas
        (role_id, user_id, empresa_id)
    SELECT ${id}, ${user_id}, ${empresa_id}
    WHERE
        NOT EXISTS (
            SELECT id FROM security.roles_users_empresas
            WHERE role_id = ${id}
            AND user_id = ${user_id} 
            AND empresa_id = ${empresa_id} 
        );`)

        return await Role.find(id)
    }

    async destroy({ params }) {
        const { user_id, empresa_id, id } = params

        await Database.raw(`DELETE FROM security.roles_users_empresas        
            WHERE role_id = ${id}
            AND user_id = ${user_id} 
            AND empresa_id = ${empresa_id};`
        )

        return await Role.find(id)
    }

}

module.exports = PerfilUsuarioEmpresaController
