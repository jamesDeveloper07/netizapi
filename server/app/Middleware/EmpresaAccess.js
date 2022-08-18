'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Empresa = use("App/Models/Common/Empresa")
const Equipe = use('App/Models/Common/Equipe')
const RoleAndPermission = use('App/Utils/RoleAndPermission');

/**
 * Verifica se a empresa acessada está ativa
 */
class EmpresaAccess {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle({ request, params, auth }, next) {
    const { empresa_id } = params

    if (empresa_id) {
      const empresa = await Empresa.findOrFail(empresa_id)
      if (!empresa || empresa.status != 'A') {
        let error = new Error('Empresa não encontrada')
        error.status = 400
        throw error
      }
      const user = await auth.getUser()
      
      let gerenciarEmpresaExpression = '(gerenciar-empresas)'
      let gerenciarEmpresaPermissions = await RoleAndPermission.validarPermissions(user.id, empresa_id, gerenciarEmpresaExpression)

      //Se não incluir gerenciar empresas checa se o user tem acesso a empresa
      if (!gerenciarEmpresaPermissions) {
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
      await this.injectEquipes({ auth, request, params })
    }

    await next()
  }

  async injectEquipes({ auth, request, params }) {

    const user = await auth.getUser()
    let equipesRestringidas = await user.equipesRestringidas().fetch()
    equipesRestringidas = equipesRestringidas.rows.map(item => item.id)

    let equipesPermitidas = await user.equipesPermitidas().fetch()
    equipesPermitidas = equipesPermitidas.rows.map(item => item.id)

    if (equipesRestringidas.length > 0) {
      let equipes = request._all['equipes']
      if (!equipes || (equipes && (equipes.length === 0 || equipes[0] == -1))) {
        const { empresa_id } = params
        const equipesDaEmpresa = await Equipe
          .query()
          .where({ empresa_id })
          .whereNotNull('deleted_at')
          .fetch()

        request._all['equipes'] = equipesDaEmpresa.rows.filter(item => !equipesRestringidas.includes(item.id))
      } else {
        request._all['equipes'] = equipes.filter(item => !equipesRestringidas.includes(item))
      }
    }
  }
}

module.exports = EmpresaAccess
