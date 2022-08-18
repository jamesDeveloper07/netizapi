'use strict'

class RecoveryPassword {

  get rules() {
    return {
      password: 'required|min:6',
      token: 'required',
    }
  }

  get messages() {
    return {
      'password.min': 'Senha deve possuir pelo menos 6 caracteres.',
      'password.required': 'Informe sua senha.',
      'token.required': 'Url inválida. Talvez você tenha feita outra solicitação de recuperação de senha. Verifique seu email, por favor.',
    }
  }

  async fails(errorMessages) {
    return this.ctx.response.status(400).send(errorMessages)
  }
}

module.exports = RecoveryPassword
