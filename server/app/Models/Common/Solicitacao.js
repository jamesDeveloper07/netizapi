'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Solicitacao extends Model {
  static get table() {
    return 'common.solicitacoes_cliente_acao_servicos'
  }

  acaoServico() {
    return this.belongsTo('App/Models/Common/AcaoServico')
  }

  cliente() {
    return this.belongsTo('App/Models/Common/Cliente')
  }

}

module.exports = Solicitacao
