'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class AcaoServico extends Model {
  static get table() {
    return 'common.acoes_servicos'
  }

  acao() {
    return this.belongsTo('App/Models/Common/Acao')
  }

  servico() {
    return this.belongsTo('App/Models/Common/Servico')
  }

}

module.exports = AcaoServico
