'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Link extends Model {
  static get table() {
    return 'shortener.links'
  }

}

module.exports = Link
