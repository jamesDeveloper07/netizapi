'use strict'

const Env = use('Env')
const axios = require('axios');
const Database = use('Database')
const RoleAndPermission = use('App/Utils/RoleAndPermission');
const moment = require('moment-timezone');

class WatchController {

  async tokengeneration({ request, response, params }) {
    try {
      const { code } = request.only(['code'])
      const { uid } = request.only(['uid'])
      console.log('\n\nTOKEN GENERATION API WATCH\n');
      console.log({ code });
      console.log({ uid });

      if (!code) {
        return response.status(400).send({ menssage: 'code não informada!' })
      }

      if (!uid) {
        return response.status(400).send({ menssage: 'uid não informada!' })
      }

      return response.status(200).send({ menssage: 'Teste concluído!' })

    } catch (error) {
      console.error('Erro no tokengeneration em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar a geração de token api/watch' })
    }

  }

  async teste({ request, response, params }) {
    try {
      const { code } = request.only(['code'])
      const { uid } = request.only(['uid'])
      console.log('\n\nTESTE API WATCH\n');
      console.log({ code });
      console.log({ uid });


      if (!code) {
        return response.status(400).send({ menssage: 'code não informada!' })
      }

      if (!uid) {
        return response.status(400).send({ menssage: 'uid não informada!' })
      }

      return response.status(200).send({ menssage: 'Teste concluído!' })

    } catch (error) {
      console.error('Erro no teste em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o teste api/watch' })
    }

  }


}

module.exports = WatchController


