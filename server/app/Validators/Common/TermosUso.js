'use strict'

class TermosUso {

  //
  get sanitizationRules() {
    return {
      link_url: 'trim'
    }
  }

  //Validando todos os campos de uma unica vez
  get validateAll() {
    return true
  }

  //Colocando as regras das validações
  get rules() {
    return {
      nome: `required`,
      versao: `required`,
      link_url: `required|url`,
      data_inicio_vigencia: `required|date`,
      data_fim_vigencia: `date`
    }
  }
  //Mensagens de falhas de validação
  get messages() {
    return {
      'nome.required': 'Informe o nome',
      'versao.required': 'Informe a versão',
      'link_url.required': 'Informe a URL',
      'link_url.url': 'Informe uma URL válida',
      'data_inicio_vigencia.required': 'Informe a Data Início da Vigência',
      'data_inicio_vigencia.date': 'Data Início da Vigência precisa ser uma data válida',
      'data_fim_vigencia.date': 'Data Fim da Vigência precisa ser uma data válida',
    }
  }
  //Define como será retornado a mensagem de falha
  async fails(errorMessages) {
    return this.ctx.response.status(400).send(errorMessages)
  }
}

module.exports = TermosUso

