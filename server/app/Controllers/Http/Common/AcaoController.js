'use strict'

const Acao = use('App/Models/Common/Acao');

class AcaoController {

  async index({ request }) {
    const { id, nome, status } = request.all();

    const query = Acao.query()

    if (id) {
      query.where({ id })
    }

    if (nome) {
      query.where('nome', 'ilike', `%${nome}%`)
    }

    if (status) {
      query.where({ status })
    }

    query.orderBy('nome', 'asc')
    return await query.fetch()
  }

  async show({ request, params }) {
    const { id } = params;
    const query = Acao.query()
    query.where({ id })
    return await query.first()
  }

  async store({ request, response, auth }) {

    try {
      const dataAcao = request.only(['nome', 'descricao', 'status'])

      if (dataAcao && !dataAcao.status) {
        dataAcao.status = 'ativo'
      }

      if (dataAcao && !dataAcao.nome) {
        response.status(400).send('Nome não informado')
        return
      }

      if (dataAcao && !dataAcao.descricao) {
        response.status(400).send('Descrição não informada')
        return
      }

      const servico = await Acao.create(dataAcao)

      const id = servico.id
      const data = await Acao.query()
        .where({ id })
        .first()

      return data

    } catch (error) {
      console.log({ error })
      if (error && error.constraint) {
        response.status(400).send('Catch Error: ' + error.constraint + '\n' + 'Detail: ' + error.detail)
      } else {
        response.status(400).send('Catch Error')
      }
    }
  }

}

module.exports = AcaoController
