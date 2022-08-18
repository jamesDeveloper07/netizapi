'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Empresa = use("App/Models/Common/Empresa")
const User = use('App/Models/Security/User')
const Role = use('Adonis/Acl/Role')

const _ = require('lodash')
const Acl = require('../../node_modules/adonis-acl/src/Acl')

class RoleUserEmpresa {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle({ request, auth }, next, ...args) {

    let header = request.headers()
    let empresa_id = header.empresa_id

    if (!empresa_id || this.isEmptyObj(empresa_id) || empresa_id <= 0) {
      let error = new Error('Empresa não informada')
      error.status = 500
      throw error
    }

    const empresa = await Empresa.find(empresa_id)

    if (!empresa) {
      let error = new Error('Empresa não encontrada')
      error.status = 400
      throw error
    }

    if (empresa.status != 'A') {
      let error = new Error('Empresa Inativa')
      error.status = 400
      throw error
    }

    const user = await auth.getUser()
    const userHasEmpresa = await user
      .empresas()
      .where({ 'common.empresas.id': empresa_id })
      .first()
    if (!userHasEmpresa) {
      let error = new Error('Você não tem acesso a está empresa')
      error.status = 400
      throw error
    }

    let roles = await Role
      .query()
      .whereRaw(`id in ( SELECT role_id from
      security.roles_users_empresas
      where user_id = ${user.id}
      and empresa_id = ${empresa_id} )`).fetch()

    const perfis = roles.rows.map(({ slug }) => slug)

    let expression = args[0]

    if (Array.isArray(expression)) {
      expression = expression[0]
    }
    const is = Acl.check(expression, operand => _.includes(perfis, operand))

    if (is) {
      await next()
    } else {
      let error = new Error('USUÁRIO SEM PERFIL NECESSÁRIO')
      error.status = 400
      throw error
    }
  }

  isEmptyObj(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

}

module.exports = RoleUserEmpresa
