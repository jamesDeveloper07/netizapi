'use strict'

const Role = use('Adonis/Acl/Role')
const Permission = use('Adonis/Acl/Permission')
const _ = require('lodash')
const Acl = require('../../node_modules/adonis-acl/src/Acl')

class RoleAndPermission {

    static async getRoles(user_id, empresa_id) {
        try {

            let roles = await Role.query()
                .whereRaw(`id in ( SELECT role_id from
        security.roles_users_empresas
        where user_id = ${user_id}
        and empresa_id = ${empresa_id} )`).fetch()

            roles = roles.rows.map(({ slug }) => slug)

            return roles
        } catch (error) {
            console.log(error)
            return null;
        }

    }

    static async validarRoles(user_id, empresa_id, expression) {
        try {

            let roles = await Role.query()
                .whereRaw(`id in ( SELECT role_id from
        security.roles_users_empresas
        where user_id = ${user_id}
        and empresa_id = ${empresa_id} )`).fetch()

            const perfis = roles.rows.map(({ slug }) => slug)

            const is = Acl.check(expression, operand => _.includes(perfis, operand))

            return is
        } catch (error) {
            console.log(error)
            return false;
        }

    }

    static async getPermissions(user_id, empresa_id) {
        try {

            let roles = await Role
                .query()
                .whereRaw(`id in ( SELECT role_id from
      security.roles_users_empresas
      where user_id = ${user.id}
      and empresa_id = ${empresa_id} )`).fetch()

            roles = roles.rows.map((item) => item.id)
            const rolesReduce = () => roles.reduce((total, proximo) => total += `, ${proximo}`)

            let permissions = await Permission
                .query()
                .whereRaw(`id in (Select permission_id from
      public.permission_role
      where role_id in (${roles.length == 0 ? null : rolesReduce()}) ) `).fetch()

            permissoes = permissions.rows.map(({ slug }) => slug)

            return permissoes
        } catch (error) {
            console.log(error)
            return null;
        }

    }

    static async validarPermissions(user_id, empresa_id, expression) {
        try {

            let roles = await Role
                .query()
                .whereRaw(`id in ( SELECT role_id from
      security.roles_users_empresas
      where user_id = ${user_id}
      and empresa_id = ${empresa_id} )`).fetch()

            roles = roles.rows.map((item) => item.id)
            const rolesReduce = () => roles.reduce((total, proximo) => total += `, ${proximo}`)

            const permissions = await Permission
                .query()
                .whereRaw(`id in (Select permission_id from
      public.permission_role
      where role_id in (${roles.length == 0 ? null : rolesReduce()}) ) `).fetch()

            const permissoes = permissions.rows.map(({ slug }) => slug)

            const can = Acl.check(expression, operand => _.includes(permissoes, operand))

            return can
        } catch (error) {
            console.log(error)
            return false;
        }

    }
}

module.exports = RoleAndPermission