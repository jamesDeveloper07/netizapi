'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Acesso extends Model {
  static get table() {
    return 'shortener.acessos'
  }

  link() {
    return this.belongsTo('App/Models/Shortener/Link')
  }


}

module.exports = Acesso
