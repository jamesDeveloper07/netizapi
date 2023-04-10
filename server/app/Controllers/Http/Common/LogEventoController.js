'use strict'

const LogEvento = use('App/Models/Common/LogEvento');
const Cliente = use('App/Models/Common/Cliente');

const Env = use('Env')
const Database = use('Database')
const axios = require('axios');

const RoleAndPermission = use('App/Utils/RoleAndPermission');

class LogEventoController {

  async index({ request, response, auth }) {
    const user = await auth.getUser();

    let header = request.headers()
    let empresa_id = header.empresa_id

    if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
      const { emp_id } = request.only(['emp_id'])
      empresa_id = emp_id
    }

    if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
      response.status(400).send('Empresa não informada')
    }

    const { id, cliente_id } = request.only(['id', 'cliente_id']);

    var { data_inicio_evento, data_fim_evento } = request.only(['data_inicio_evento', 'data_fim_evento']);

    const { cliente, pesquisarTelefoneCliente } = request.only(['cliente', 'pesquisarTelefoneCliente']);

    const { page,
      limit,
      sortField = 'id',
      sortOrder = 'ASC',
    } = request.only(['page',
      'limit',
      'sortField',
      'sortOrder'
    ])

    const query = LogEvento.query()
      .with('logsIntegracao')
      .orderByRaw('created_at desc, id desc')

    if (id) {
      query.where({ id })
    }

    if (cliente_id) {
      query.where({ cliente_id })
    } else {
      if (cliente) {
        if ((pesquisarTelefoneCliente && pesquisarTelefoneCliente === 'true')) {
          var tel = cliente.replace(/[^0-9]/g, '');
          query.whereRaw(`common.log_evento.phone like '%${tel}%'`)
        } else {
          var doc = cliente.replace(/[^0-9]/g, '');
          query.whereRaw(`common.log_evento.name ilike '%${cliente}%' ${doc ? `or common.name.tx_id like '%${doc}%'` : ''} `)
        }
      }
    }

    if (data_inicio_evento && data_fim_evento) {
      query.whereRaw(`date(event_data AT TIME ZONE 'BRA') BETWEEN date('${data_inicio_evento}' AT TIME ZONE 'BRA') AND date('${data_fim_evento}' AT TIME ZONE 'BRA')`);
    } else {
      if (data_inicio_evento) {
        query.whereRaw(`date(event_data AT TIME ZONE 'BRA') >= date('${data_inicio_evento}')`)
      }
      if (data_fim_evento) {
        query.whereRaw(`date(event_data AT TIME ZONE 'BRA') <= date('${data_fim_evento}')`)
      }
    }

    // if (protocolo_externo_id) {
    //   query.where({ protocolo_externo_id })
    // }

    const result = await query.paginate(page ? page : 1, limit ? limit : 10)
    return result
  }

}

module.exports = LogEventoController
