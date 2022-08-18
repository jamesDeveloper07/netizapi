'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

const Env = use('Env')

class User extends Model {

  static get table() {
    return 'security.users'
  }


  static boot() {
    super.boot()

    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  static get hidden() {
    return ['password']
  }


  static scopeSearch(query, { nome, empresas, status }) {
    if (nome) {
      query.where('name', 'ILIKE', `%${nome}%`)
    }
    if (empresas && empresas.length > 0) {
      query.whereHas('empresas', (builder) => {
        builder.whereIn('common.empresas.id', empresas)
      })
    }
    if (status && status.length > 0) {
      query.whereIn('status', status)
    }
    query.with('empresas')
    query.with('roles')
  }

  static get traits() {
    return [
      '@provider:Adonis/Acl/HasRole',
      '@provider:Adonis/Acl/HasPermission'
    ]
  }

  get rules() {
    //Cria a checagem do email por id caso o usuario já exista...
    const checkId = this.toJSON().id ? `,id,${this.toJSON().id}` : ''
    return {
      email: `unique:security.users,email${checkId}`,
      name: 'required|min:6',
      password: "required|min:6"
    }
  }

  get messages() {
    return {
      'email.unique': 'Este email já está em uso',
      'password.required': 'Informe sua senha',
      'password.min': 'Informe sua senha com no mínimo 6 caracteres',
      'name.required': 'Informe seu nome',
      'name.min': 'Nome muito curto'
    }
  }

  static boot() {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  getAvatarUrl({ avatar }) {
    return `${Env.get('S3_SERVER')}${Env.get('S3_APP_PATH')}/users/avatars/${avatar}?${Math.random()}`;
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens() {
    return this.hasMany('App/Models/Security/Token')
  }

  empresas() {
    return this.belongsToMany('App/Models/Common/Empresa')
      .pivotTable('security.users_empresas')
  }

  menus() {
    return this.belongsToMany('App/Models/Security/Menu')
      .pivotTable('security.users_menus')
  }

}

module.exports = User
