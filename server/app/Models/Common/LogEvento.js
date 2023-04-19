'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class LogEvento extends Model {
  static get table() {
    return 'common.log_evento'
  }

  logsIntegracao() {
    return this.hasMany('App/Models/Common/LogIntegracao')
  }

  user() {
    return this.belongsTo('App/Models/Security/User')
  }

}

module.exports = LogEvento
