'use strict'

class UpdateUser {

  get validateAll() {
    return true
  }

  get rules() {
    return {
      name: 'required|min:6',
      status: 'required|boolean',
    }
  }

  get messages() {
    return {
      'name.required': 'Informe o nome do usuário',
      'status.required': 'Informe a situção do usuário',
      'status.boolean': 'Selecione uma situação válida',
    }
  }

  async fails(errorMessages) {
    return this.ctx.response.status(500).send(errorMessages)
  }
}

module.exports = UpdateUser
