'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Notificacao extends Model {
  static get table() {
    return 'security.notificacoes';
  }

  submodulo() {
    return this.belongsTo('App/Models/Security/Submodulo')
  }

}

module.exports = Notificacao;
