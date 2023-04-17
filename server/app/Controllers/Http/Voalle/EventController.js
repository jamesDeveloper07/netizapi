'use strict'


const EventRepository = use('App/Repository/EventRepository');
const RoleAndPermission = use('App/Utils/RoleAndPermission');


class EventController {


  async getByVarious({ response, request, auth, params }) {
    try {
      const user = await auth.getUser();
      const { contract_id, client_id, dataInicialEvento, dataFinalEvento } = request.only(['contract_id', 'client_id', 'dataInicialEvento', 'dataFinalEvento'])

      const { cliente, pesquisarTelefoneCliente } = request.only(['cliente', 'pesquisarTelefoneCliente']);

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
            sqlCliente = `and name ilike '%${cliente}%' or email ilike '%${cliente}%' ${doc ? `or tx_id like '%${doc}%'` : ''} `
          }
        }
      }

      var sqlPeriodo = ''
      if (dataInicialEvento && dataFinalEvento) {
        sqlPeriodo = `and date(event_data AT TIME ZONE 'BRA') BETWEEN date('${dataInicialEvento}' AT TIME ZONE 'BRA') AND date('${dataFinalEvento}' AT TIME ZONE 'BRA') `;
      } else {
        if (dataInicialEvento) {
          sqlPeriodo = `and date(event_data AT TIME ZONE 'BRA') >= date('${dataInicialEvento}')`
        }
        if (dataFinalEvento) {
          sqlPeriodo = `and date(event_data AT TIME ZONE 'BRA') <= date('${dataFinalEvento}')`
        }
      }

      const where = `${sqlCliente} ${sqlPeriodo} ${sqlContrato}`;

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
        response.status(400).send('Empresa não informada')
      }

      let expression = '(administrador)'
      const isAdministrador = await RoleAndPermission.validarRoles(user.id, empresa_id, expression)

      if (!isAdministrador) {
        response.status(400).send('Você não tem permissão para executar está ação.')
      }

      const returnRepository = await EventRepository.executarIntegracoes();

      if (returnRepository && returnRepository.status) {
        if (returnRepository.status == 200 && returnRepository.contractEvents) {
          return returnRepository.contractEvents
        } else {
          return response.status(returnRepository.status).send(returnRepository.menssage)
        }
      } else {
        return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo getEvents api/voalle (error 001)' })
      }

    } catch (error) {
      console.error('Erro no metodo getEvents api/voalle \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo getEvents api/voalle (error 002)' })
    }
  }


}

module.exports = EventController


