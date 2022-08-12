'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Cliente extends Model {
  static get table() {
    return 'common.clientes'
  }



}

module.exports = Cliente
