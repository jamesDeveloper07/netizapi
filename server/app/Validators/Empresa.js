'use strict'

const { validate } = use('Validator');
const { rule } = require('indicative')

class Empresa {

  get validateAll() {
    return true
  }

  get rules() {
    return {
      nome: 'required',
      site: 'url',
      cnpj: [
        rule('regex', /^((\d{2}).(\d{3}).(\d{3})\/(\d{4})-(\d{2}))*$/),
      ]
    }
  }

  get messages() {
    return {
      'nome.required': 'Informe o nome da empresa.',
      'cnpj.regex': 'Informe um CNPJ válido.',
      'site.url': 'Url inválida.',
    }
  }

  async fails(errorMessages) {
    return this.ctx.response.status(500).send(errorMessages)
  }
}

module.exports = Empresa
