'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class LogWatch extends Model {
  static get table() {
    return 'common.log_watch'
  }

  user() {
    return this.belongsTo('App/Models/Security/User')
  }

}

module.exports = LogWatch
