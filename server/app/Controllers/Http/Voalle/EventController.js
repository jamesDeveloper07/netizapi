'use strict'


const EventRepository = use('App/Repository/EventRepository');
const RoleAndPermission = use('App/Utils/RoleAndPermission');


class EventController {

  async getStatusList({ response, request, auth, params }) {

    const status = await EventRepository.getStatusList();
    return status
  }

  async getStageList({ response, request, auth, params }) {
    try {
      const stage = await EventRepository.getStageList();
      return stage
    } catch (error) {
      console.log(error);
      response.status(400).send(error)
    }

  }

  async getByVarious({ response, request, auth, params }) {
    try {
      const user = await auth.getUser();
      const { contract_id, client_id, cliente, pesquisarTelefoneCliente } = request.only(['contract_id', 'client_id', 'cliente', 'pesquisarTelefoneCliente'])

      var { data_inicio_evento, data_fim_evento } = request.only(['data_inicio_evento', 'data_fim_evento']);

      var { stage, status } = request.only(['stage', 'status']);

      var { temSVA, temDeezer, temWatch, temHBO } = request.only(['temSVA', 'temDeezer', 'temWatch', 'temHBO']);

      // var { data_inicio_execucao, data_fim_execucao } = request.only(['data_inicio_execucao', 'data_fim_execucao']);

      let { page = 0,
        limit = 10,
        sortField = 'contract_id',
        sortOrder = 'asc',
      } = request.only(['page',
        'limit',
        'sortField',
        'sortOrder'
      ])

      if (page) page -= 1

      var sqlContrato = ''
      if (contract_id && contract_id > 0) {
        sqlContrato = `and contract_id = ${contract_id}`
      }

      var sqlCliente = ''
      if (client_id) {
        sqlCliente = `and client_id = ${client_id}`
      } else {
        if (cliente) {
          if ((pesquisarTelefoneCliente && pesquisarTelefoneCliente === 'true')) {
            var tel = cliente.replace(/[^0-9]/g, '');
            sqlCliente = `and NULLIF(regexp_replace(phone, '[^\\.\\d]','','g'), '') like '%${tel}%'`
          } else {
            var doc = cliente.replace(/[^0-9]/g, '')
            sqlCliente = `and (name ilike '%${cliente}%' or email ilike '%${cliente}%'${doc ? ` or tx_id like '%${doc}%')` : ')'} `
          }
        }
      }

      var sqlPeriodo = ''
      if (data_inicio_evento && data_fim_evento) {
        sqlPeriodo = `and date(event_data AT TIME ZONE 'BRA') BETWEEN date('${data_inicio_evento}' AT TIME ZONE 'BRA') AND date('${data_fim_evento}' AT TIME ZONE 'BRA') `;
      } else {
        if (data_inicio_evento) {
          sqlPeriodo = `and date(event_data AT TIME ZONE 'BRA') >= date('${data_inicio_evento}')`
        }
        if (data_fim_evento) {
          sqlPeriodo = `and date(event_data AT TIME ZONE 'BRA') <= date('${data_fim_evento}')`
        }
      }

      var sqlStage = ''
      if (stage && stage > 0) {
        sqlStage = `and stage = ${stage}`
      }

      var sqlStatus = ''
      if (status && status.length > 0) {
        sqlStatus = `and status in (${status.join()})`
      }

      var sqlSVAs = ''
      if (temSVA == 0) {
        sqlSVAs += `and not isservicodigital`
      } else {
        if (temSVA == 1) {
          sqlSVAs += `and isservicodigital `
        }

        if (temDeezer == 0) {
          sqlSVAs += `and not isdeezer `
        } else {
          if (temDeezer == 1) {
            sqlSVAs += `and isdeezer `
          }
        }

        if (temWatch == 0) {
          sqlSVAs += `and not iswatch `
        } else {
          if (temWatch == 1) {
            sqlSVAs += `and iswatch `
          }
        }

        if (temHBO == 0) {
          sqlSVAs += `and not ishbo`
        } else {
          if (temHBO == 1) {
            sqlSVAs += `and ishbo`
          }
        }

      }


      const where = `${sqlContrato} ${sqlCliente} ${sqlPeriodo} ${sqlStage} ${sqlStatus} ${sqlSVAs}`;

      const paginate = `order by ${sortField} ${sortOrder}
      LIMIT ${limit} OFFSET ${page ? (parseInt(page) * parseInt(limit)) : 0}`;

      const total = await EventRepository.getContractsByEvents('count(contract_id)', 0, where, ' ');

      const contractEvents = await EventRepository.getContractsByEvents('*', 0, where, paginate);

      return {
        total: total[0].count,
        lastPage: Math.ceil(total[0].count / limit),
        perPage: limit,
        page: page + 1,
        data: contractEvents
      }

    } catch (error) {
      console.log(error)
      return response
        .status(400)
        .send({ message: 'Não foi possível consultar Contratos' })
    }
  }

  async processarEventos({ request, response, params, auth }) {
    try {
      console.log('Método GET EVENTS Event Controller');

      const user = await auth.getUser();
      let header = request.headers()
      let empresa_id = header.empresa_id

      if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
        const { emp_id } = request.only(['emp_id'])
        empresa_id = emp_id
      }

      if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
        return response.status(400).send('Empresa não informada')
      }

      let expression = '(administrador)'
      const hasPermission = await RoleAndPermission.validarRoles(user.id, empresa_id, expression)

      if (!hasPermission) {
        return response.status(400).send('Você não tem permissão para executar está ação.')
      }

      const returnRepository = await EventRepository.executarIntegracoes();

      if (returnRepository && returnRepository.status) {
        if (returnRepository.status == 200 && returnRepository.contractEvents) {
          return returnRepository.contractEvents
        } else {
          return response.status(returnRepository.status).send(returnRepository.menssage)
        }
      } else {
        return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo processarEventos api/voalle (error 001)' })
      }

    } catch (error) {
      console.error('Erro no metodo processarEventos api/voalle \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo processarEventos api/voalle (error 002)' })
    }
  }

  async reexecutarIntegracao({ request, response, params, auth }) {
    try {
      console.log('\n\n====REEXECUTAR INTEGRAÇÃO====\n');

      var { contract_id, event_id } = request.only(['contract_id', 'event_id']);

      const user = await auth.getUser();
      let header = request.headers()
      let empresa_id = header.empresa_id

      if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
        const { emp_id } = request.only(['emp_id'])
        empresa_id = emp_id
      }

      if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
        return response.status(400).send('Empresa não informada')
      }

      let expression = '(administrador or supervisor)'
      const hasPermission = await RoleAndPermission.validarRoles(user.id, empresa_id, expression)

      if (!hasPermission) {
        return response.status(400).send('Você não tem permissão para executar está ação.')
      }

      if (!contract_id || contract_id <= 0) {
        return response.status(400).send('Contrato não informado para reexecução de integração.')
      }

      const returnRepository = await EventRepository.executarIntegracoes(contract_id, user.id);

      if (returnRepository && returnRepository.status) {
        if (returnRepository.status == 200 && returnRepository.contractEvents) {
          return returnRepository.contractEvents
        } else {
          return response.status(returnRepository.status).send(returnRepository.menssage)
        }
      } else {
        return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo reexecutarIntegracao api/voalle (error 001)' })
      }

    } catch (error) {
      console.error('Erro no metodo reexecutarIntegracao api/voalle \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo reexecutarIntegracao api/voalle (error 002)' })
    }
  }

  async executarCancelamentoManual({ request, response, params, auth }) {
    try {
      console.log('\n\n====EXECUTAR CANCELAMENTO MANUAL====\n');

      var { contract_id, event_id } = request.only(['contract_id', 'event_id']);

      const user = await auth.getUser();
      let header = request.headers()
      let empresa_id = header.empresa_id

      if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
        const { emp_id } = request.only(['emp_id'])
        empresa_id = emp_id
      }

      if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
        return response.status(400).send('Empresa não informada')
      }

      let expression = '(administrador or supervisor)'
      const hasPermission = await RoleAndPermission.validarRoles(user.id, empresa_id, expression)

      if (!hasPermission) {
        return response.status(400).send('Você não tem permissão para executar está ação.')
      }

      if (!contract_id || contract_id <= 0) {
        return response.status(400).send('Contrato não informado para reexecução de integração.')
      }

      const returnRepository = await EventRepository.executarCancelamentoManual(contract_id, user.id);

      if (returnRepository && returnRepository.status) {
        if (returnRepository.status == 200 && returnRepository.contractEvents) {
          return returnRepository.contractEvents
        } else {
          return response.status(returnRepository.status).send(returnRepository.menssage)
        }
      } else {
        return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo executarCancelamentoManual api/voalle (error 001)' })
      }

    } catch (error) {
      console.error('Erro no metodo executarCancelamentoManual api/voalle \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo executarCancelamentoManual api/voalle (error 002)' })
    }
  }


}

module.exports = EventController


