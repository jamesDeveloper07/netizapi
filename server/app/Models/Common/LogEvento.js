'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class LogEvento extends Model {
  static get table() {
    return 'common.log_evento'
  }

}

module.exports = LogEvento
