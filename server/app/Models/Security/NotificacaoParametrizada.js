'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Notificacao extends Model {

  static get table() {
    return 'security.notificacoes_parametrizadas';
  }

}

module.exports = Notificacao;
