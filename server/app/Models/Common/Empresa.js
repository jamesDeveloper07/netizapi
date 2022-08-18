'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Env = use('Env')
const moment = require('moment');

class Empresa extends Model {

  static get table() {
    return 'common.empresas'
  }

  static boot() {
    super.boot()
    // this.addHook('afterCreate', 'EmpresaHook.insertDestinos')
    // this.addHook('afterCreate', 'EmpresaHook.insertMotivosEncerramentos')
    // this.addHook('afterCreate', 'EmpresaHook.insertApiAccess')
    // this.addHook('afterCreate', 'EmpresaHook.insertEstagios')
  }


  static scopeSearch(query, {
    nomeEmpresa,
  }) {
    if (nomeEmpresa && nomeEmpresa.trim().length > 0) {
      query.whereRaw(`nome ILIKE '%${nomeEmpresa}%'`)
    }
  }

  static get computed() {
    return ['logo_url', 'dias_cadastro']
  }

  getDiasCadastro({ created_at }) {
    const criacao = moment(created_at)
    const dataNow = moment(new Date())
    const dias = dataNow.diff(criacao, 'days')
    return dias
  }

  getLogoUrl({ logo, id }) {
    return `${Env.get('S3_SERVER')}${Env.get('S3_APP_PATH')}/empresas/${id}/logo/${logo}`;
  }

  users() {
    return this.belongsToMany('App/Models/Security/User')
      .pivotTable('security.users_empresas')
  }

  usersEmpresas() {
    return this.hasMany('App/Models/Security/UserEmpresa')
  }
}

module.exports = Empresa
