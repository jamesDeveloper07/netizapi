'use strict'

const AcaoServico = use('App/Models/Common/AcaoServico');

class AcaoServicoController {

  async index({ request }) {
    const { id, acao_id, servico_id, status } = request.all();

    const query = AcaoServico.query()
      .with('acao')
      .with('servico')

    if (id) {
      query.where({ id })
    }

    if (acao_id) {
      query.where({ acao_id })
    }

    if (servico_id) {
      query.where({ servico_id })
    }

    if (status) {
      query.where({ status })
    }

    query.orderBy('id', 'asc')
    return await query.fetch()
  }

  async show({ request, params }) {
    const { id } = params;
    const query = AcaoServico.query()
    query.where({ id })
    return await query.first()
  }

  async store({ request, response, auth }) {

    try {
      const dataAcao = request.only(['acao_id', 'servico_id', 'status'])

      if (dataAcao && !dataAcao.status) {
        dataAcao.status = 'ativo'
      }

      if (dataAcao && !dataAcao.acao_id) {
        response.status(400).send('Ação não informada')
        return
      }

      if (dataAcao && !dataAcao.servico_id) {
        response.status(400).send('Serviço não informado')
        return
      }

      const acaoServico = await AcaoServico.create(dataAcao)

      const id = acaoServico.id
      const data = await AcaoServico.query()
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

module.exports = AcaoServicoController
