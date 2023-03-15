'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class LogIntegracao extends Model {
  static get table() {
    return 'common.log_integracao'
  }

  servico() {
    return this.belongsTo('App/Models/Common/Servico')
  }

  user() {
    return this.belongsTo('App/Models/Security/User')
  }

}

module.exports = LogIntegracao
