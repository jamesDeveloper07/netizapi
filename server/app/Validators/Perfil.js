'use strict'

const { rule } = require('indicative')

class Perfil {

  get validateAll() {
    return true
  }

  get rules() {
    const id = this.ctx.params.id
    console.log(id)
    return {
      name: `required|unique:roles,name${id ? `,id,${id}` : ''}`,
      slug: `required|unique:roles,slug${id ? `,id,${id}` : ''}`,
      slug: [
        rule('regex', /^\S*$/)
      ]
    }
  }

  async fails(errorMessages) {
    return this.ctx.response.status(400).send(errorMessages)
  }

  get messages() {
    return {
      'name.required': 'Nome é obrigatório',
      'name.unique': 'Já existe um perfil com esse nome',
      'slug.required': 'Slug é obrigatório',
      'slug.unique': 'Já existe um perfil com esse slug',
      'slug.regex': 'Inválido',
    }
  }


}

module.exports = Perfil
