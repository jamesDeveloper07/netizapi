'use strict'

const Cliente = use('App/Models/Common/Cliente');

class ClienteController {

  async index({ request }) {
    const { id, nome, documento, telefone, status } = request.all();

    const query = Cliente.query()

    if (id) {
      query.where({ id })
    }

    if (nome) {
      query.where('nome', 'ilike', `%${nome}%`)
    }

    if (documento) {
      query.where({ documento })
    }

    if (telefone) {
      query.where({ telefone })
    }

    if (status) {
      query.where({ status })
    }

    query.orderBy('nome', 'asc')
    return await query.fetch()
  }

  async show({ request, params }) {
    const { id } = params;
    const query = Cliente.query()
    query.where({ id })
    return await query.first()
  }

  async store({ request, response, auth }) {

    try {
      const dataCliente = request.only(['nome', 'documento', 'telefone', 'status', 'origem', 'externo_id',])

      if (dataCliente && !dataCliente.status) {
        dataCliente.status = 'ativo'
      }

      if (dataCliente && !dataCliente.nome) {
        response.status(400).send('Nome não informado')
        return
      }

      if (dataCliente && !dataCliente.documento) {
        response.status(400).send('Documento não informado')
        return
      }


      if (dataCliente && !dataCliente.telefone) {
        response.status(400).send('Telefone não informado')
        return
      }


      if (dataCliente && !dataCliente.origem) {
        response.status(400).send('Origem não informada')
        return
      }

      if (dataCliente && !dataCliente.externo_id) {
        response.status(400).send('Id de Origem (externo_id) não informado')
        return
      }

      const cliente = await Cliente.create(dataCliente)

      const id = cliente.id
      const data = await Cliente.query()
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

module.exports = ClienteController
