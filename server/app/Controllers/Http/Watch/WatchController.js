'use strict'

const Env = use('Env')
const axios = require('axios');
const Database = use('Database')
const RoleAndPermission = use('App/Utils/RoleAndPermission');
const moment = require('moment-timezone');

const Parametro = use('App/Models/Common/Parametro')

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

      console.log('\n\nSolicitando access-token by code ' + code + '\n');

      var qs = require('qs');
      var data = qs.stringify({
        'client_id': '4340937e03212',
        'client_secret': '12f03ed89258d',
        'code': code,
        'grant_type': 'password'
      });

      const resp = await axios({
        method: 'post',
        url: 'https://apiweb.watch.tv.br/oauth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
      }).then(async (res) => {
        console.log('\nENTROU NO THEN');

        const paramToken = await Parametro.findBy({ chave: 'access_token_watch' });
        console.log('ACCESS ATUAL')
        console.log({ paramToken })

        const token = res.data.Result[0];

        if (token && token.access_token) {

          try {
            if (paramToken && paramToken.id && paramToken.id > 0) {
              paramToken.valor = token.access_token;
              paramToken.updated_at = new Date();
              await paramToken.save();
              return response.status(200).send('Parametro Access_Token_Watch atualizado com sucesso.');
            } else {
              const newParamToken = new Parametro();

              newParamToken.merge({
                chave: 'access_token_watch',
                valor: token.access_token,
                descricao: 'Parametro referente ao token de autorização a api do Watch Brasil, com validade de 8h a partir da data de atualização.',
                created_at: new Date(),
                updated_at: new Date()
              });

              await newParamToken.save();
              return response.status(200).send('Parametro Access_Token_Watch criado com sucesso.');
            }

          } catch (error) {
            return response.status(400).send('Falha na atualização do parametro access_token_watch.');
          }

        } else {
          return response.status(400).send('Falha no response do access_token');
        }

      }, (error) => {
        console.log('\nENTROU NO ERROR');
        console.log(error);
        if (error && error.response) {
          return response.status(error.response.status).send(error.response.data)
        } else {
          return response.status(400).send(error)
        }
      });

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


