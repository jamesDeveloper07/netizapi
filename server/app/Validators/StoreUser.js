'use strict'

const { rule } = require('indicative')

class StoreUser {

  get sanitizationRules() {
    return {
      email: [
        rule('normalize_email', {
          all_lowercase: true,
          icloud_remove_subaddress: true,
          gmail_remove_dots: false
        })
      ],
      name: 'trim'
    }
  }

  get validateAll() {
    return true
  }

  get rules() {
    return {
      name: 'required|min:6',
      email: `required|email|unique:security.users`,
      password: 'required|min:6|max:100'
    }
  }

  get messages() {
    return {
      'name.required': 'Informe o nome do usuário',
      'name.min': 'Nome muito curto',
      'email.required': 'Informe o email',
      'email.email': 'Email invalido',
      'email.unique': 'Email já em uso',
      'password.required': 'Informe a senha do usuário'
    }
  }

  async fails(errorMessages) {
    return this.ctx.response.status(500).send(errorMessages)
  }
}

module.exports = StoreUser

