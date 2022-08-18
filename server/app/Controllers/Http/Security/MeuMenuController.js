'use strict'

const User = use('App/Models/Security/User')
const Menu = use('App/Models/Security/Menu')
const Database = use('Database')

class MeuMenuController {

    async index({ auth, request }) {
        const user = await auth.getUser();

        const { empresa_id } = request.only(['empresa_id'])

        if (empresa_id && empresa_id > 0) {

            let roles = await Database.raw(`SELECT * from security.roles_users_empresas
                where user_id = ${user.id} 
                and empresa_id = ${empresa_id}`);

            roles = roles.rows.map((item) => item.role_id)
            const rolesReduce = () => roles.reduce((total, next) => total += `, ${next}`)

            const mainMenus = await Menu.query()
                .where({ is_ativo: true })
                .whereRaw(`parent_menu_id IS NULL AND id IN (SELECT menu_id FROM security.roles_menus WHERE role_id IN (${roles.length == 0 ? null : rolesReduce()}))`)
                .orderBy('ordem', 'asc')
                .fetch()

            for (let m of mainMenus.rows) {
                m['menus'] = await Menu.query()
                    .where({ is_ativo: true, parent_menu_id: m.id })
                    .whereRaw(`id IN (SELECT menu_id FROM security.roles_menus WHERE role_id IN (${roles.length == 0 ? null : rolesReduce()}))`)
                    .orderBy('ordem', 'asc')
                    .fetch()
            }

            return mainMenus

        } else {
            console.log('Empresa inválida')
            return []
        }

    }
}

module.exports = MeuMenuController
