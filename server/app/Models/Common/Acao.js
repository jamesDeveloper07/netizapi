'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Acao extends Model {
  static get table() {
    return 'common.acoes'
  }

}

module.exports = Acao
