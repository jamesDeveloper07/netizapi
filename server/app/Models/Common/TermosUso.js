'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class TermosUso extends Model {

    static get table() {
        return 'common.termos_uso'
    }

    user() {
        return this.belongsTo('App/Models/Security/User')
    }

}

module.exports = TermosUso
