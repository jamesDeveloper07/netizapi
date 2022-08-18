'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Submodulo extends Model {
  static get table() {
    return 'security.submodulos';
  }

  modulo() {
    return this.belongsTo('App/Models/Security/Modulo')
  }

  notificacoes() {
    return this.hasMany('App/Models/Security/Notificacao')
  }

}

module.exports = Submodulo;
