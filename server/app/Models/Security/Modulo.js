'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Modulo extends Model {
  static get table() {
    return 'security.modulos';
  }

  submodulos() {
    return this.hasMany('App/Models/Security/Submodulo')
  }

}

module.exports = Modulo;
