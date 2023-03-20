'use strict'


const EventRepository = use('App/Repository/EventRepository');
const RoleAndPermission = use('App/Utils/RoleAndPermission');


class EventController {

  async getEvents({ request, response, params, auth }) {
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

      const returnRepository = await EventRepository.getEvents();

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


