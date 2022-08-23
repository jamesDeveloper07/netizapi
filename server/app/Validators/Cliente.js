'use strict'

const { rule } = require('indicative')

class Cliente {

  get sanitizationRules() {
    return {
      email:  [
        rule('normalize_email', {
          all_lowercase: true,
          icloud_remove_subaddress: true,
          gmail_remove_dots: false
        })
      ],
      pessoa_contato: 'trim'
    }
  }


  get validateAll() {
    return true
  }

  get rules() {
    let dt = (new Date(new Date().setDate(new Date().getDate() + 1)))
    const { tipo_pessoa } = this.ctx.request.all()
    const regex = (tipo_pessoa && tipo_pessoa == 'F') ? /^((\d{3}).(\d{3}).(\d{3})-(\d{2}))*$/ : /^((\d{2}).(\d{3}).(\d{3})\/(\d{4})-(\d{2}))*$/
    return {
      nome: 'required',
      sexo: 'in:M,F,O|required_when:tipo_pessoa,F',
      tipo_pessoa: 'required|in:F,J',
      data_nascimento: `date|before:${dt}`,
      email: 'email',
      cpf_cnpj: [
        rule('regex', regex)
      ],
      pessoa_contato: 'min:2',
      'telefones.*.ddd': 'min:2|max:3',
      'telefones.*.numero': 'number|min:8:max:11',
      'telefones.*.tipo_telefone': 'min:2',
      'redes_sociais.*.tipo': 'required',
      'redes_sociais.*.endereco': 'required|url',
    }
  }

  async fails(errorMessages) {
    return this.ctx.response.status(400).send(errorMessages)
  }

  get messages() {
    return {
      'nome.required': 'Nome/Razão social obrigatório',
      'tipo_pessoa.required': 'Selecione um tipo de pessoa',
      'data_nascimento.date': 'Selecione uma data nascimento/data de fundação',
      'data_nascimento.before': 'Data nascimento/data de fundação invalida',
      'sexo.in': 'Sexo inválido',
      'email.email': 'Email inválido',
      'sexo.required_when': 'Selecione o sexo',
      'cpf_cnpj.regex': 'CPF/CNPJ inválido',
      'pessoa_contato.min': 'Nome do contato inválido',
      'telefones.*.ddd.min': 'DDD muito curto',
      'telefones.*.ddd.max': 'DDD muito longo',
      'telefones.*.numero.min': 'Número inválido',
      'telefones.*.numero.max': 'Número inválido',
      'telefones.*.tipo_telefone.min': 'Tipo telefone inválido',
      'redes_sociais.*.tipo.required': 'Informe o tipo do endereço eletrônico',
      'redes_sociais.*.endereco.required': 'Informe o endereço eletrônico',
      'redes_sociais.*.endereco.url': 'O endereço eletrônico não é uma URL válida',
    }
  }

}

module.exports = Cliente
