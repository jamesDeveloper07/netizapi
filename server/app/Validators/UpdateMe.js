'use strict'

class UpdateMe {
  get sanitizationRules() {
    return {
      name: 'trim'
    }
  }

  get validateAll() {
    return true
  }

  get rules() {
    return {
      name: 'required|min:6',
      nova_senha: 'same:confirme_nova_senha|min:6|max:90|required_if:confirme_nova_senha',
      confirme_nova_senha: 'min:6|max:90|required_if:nova_senha',
      password: 'min:6|max:100|required_if:nova_senha'
    }
  }

  get messages() {
    return {
      'name.required': 'Informe o nome do usuário',
      'name.min': 'Nome muito curto',
      'nova_senha.same': 'Nova senha e confirme nova senha são diferentes',
      'password.min': 'Senha muito curta',
      'password.max': 'Senha grande',
      'password.required_if': 'Informe sua senha atual',
      'confirme_nova_senha.min': 'Senha muito curta',
      'confirme_nova_senha.max': 'Senha grande',
      'confirme_nova_senha.required_if': 'Confirme sua nova senha',
      'nova_senha.min': 'Senha muito curta',
      'nova_senha.max': 'Senha grande',
      'nova_senha.required_if': 'Confirme sua nova senha',
    }
  }

  async fails(errorMessages) {
    return this.ctx.response.status(500).send(errorMessages)
  }
}

module.exports = UpdateMe
