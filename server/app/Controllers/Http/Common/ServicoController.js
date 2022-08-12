'use strict'

const Servico = use('App/Models/Common/Servico');

class ServicoController {

  async index({ request }) {
    const { id, nome, status } = request.all();

    const query = Servico.query()

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
    const query = Servico.query()
    query.where({ id })
    return await query.first()
  }

  async store({ request, response, auth }) {

    try {
      const dataServico = request.only(['nome', 'descricao', 'status'])

      if (dataServico && !dataServico.status) {
        dataServico.status = 'ativo'
      }

      if (dataServico && !dataServico.nome) {
        response.status(400).send('Nome não informado')
        return
      }

      if (dataServico && !dataServico.descricao) {
        response.status(400).send('Descrição não informada')
        return
      }

      const servico = await Servico.create(dataServico)

      const id = servico.id
      const data = await Servico.query()
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

module.exports = ServicoController
