'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Empresa = use("App/Models/Common/Empresa")
const RoleAndPermission = use('App/Utils/RoleAndPermission');

/**
 * Verifica se a empresa acessada está ativa
 */
class GerenciarEmpresa {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle({ request, params, auth }, next) {
    const { empresa_id } = params
    const user = await auth.getUser()

    if (empresa_id) {

      let gerenciarEmpresaExpression = '(gerenciar-minha-empresa and !gerenciar-empresas)'
      let gerenciarEmpresaPermissions = await RoleAndPermission.validarPermissions(user.id, empresa_id, gerenciarEmpresaExpression)

      if (gerenciarEmpresaPermissions) {
        const empresa = await Empresa.findOrFail(empresa_id)
        if (!empresa || empresa.status != 'A') {
          let error = new Error('Empresa não encontrada')
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
      }

    }

    await next()
  }
}

module.exports = GerenciarEmpresa
