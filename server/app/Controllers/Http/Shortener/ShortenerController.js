'use strict'

const Link = use('App/Models/Shortener/Link');
const Acesso = use('App/Models/Shortener/Acesso');

const Env = use('Env')
const Database = use('Database')
const axios = require('axios');

const RoleAndPermission = use('App/Utils/RoleAndPermission');
const moment = require('moment-timezone');

// var Hashids = require('hashids');
// // var hashids = new Hashids('this is my salt', 7, );
// var hashids = new Hashids('N3T1z0409S3rF3l1z', 6, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');

var adler32 = require('adler32');

class ShortenerController {

  async shorten({ request, response, params }) {
    try {
      const { url_destino } = request.only(['url_destino'])
      const { contexto } = request.only(['contexto'])
      console.log({ url_destino });

      if (!url_destino) {
        return response.status(400).send({ menssage: 'url_destino não informada!' })
      }

      const query = Link.query()
      query.where({ url_destino })
      var urlEncurtada = await query.first();

      if (urlEncurtada) {
        console.log('Url encontrada na base.')
        return urlEncurtada;
      } else {
        console.log('Url ainda não cadastrada. Seguir com cadastro e encurtamento.')
        // return null;

        var dataLink = {
          url_destino,
          contexto: contexto ? contexto : "padrão"
        }

        var link = await Link.create(dataLink);

        // link.codigo = this.encode(link.id.toString());
        link.codigo = this.encode("999999999999999999");

        link.save();

        return link;
      }

    } catch (error) {
      console.error('Erro no encurtador de url api/shortener \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o encurtamento de url' })
    }

  }

  async redirect({ request, response, params }) {
    try {
      const { codigo } = params;

      const query = Link.query()
      query.where({ codigo })
      var link = await query.first();

      if (link && link.url_destino) {
        console.log('Url encontrada na base.')
        console.log(link.url_destino)

        var ipAddress = request.headers['x-forwarded-for'];

        var acesso = {
          ip_origem: ipAddress ? ipAddress : "Ip não identificado",
          contador: 1,
          link_id: link.id
        }

        var newAcesso = await Acesso.create(acesso);

        return response.redirect(link.url_destino);
      } else {
        console.log('Url ainda não cadastrada. retornar not found()')
        return response.status(404).send({ menssage: 'Não encontramos a url de destino' })
      }

    } catch (error) {
      console.error('Erro no redirect do encurtador de url api/shortener \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos redirecionar sua url pelo encurtador' })
    }

  }


  async encrypt({ request, response, params }) {
    try {
      const { data_hora } = request.only(['data_hora'])
      console.log({ data_hora });

      if (!data_hora) {
        return response.status(400).send({ menssage: 'data_hora não informada!' })
      }


      var hex = this.encode(data_hora)

      return hex;

    } catch (error) {
      console.error('Erro no encurtador de url api/shortener \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o encurtamento de url' })
    }

  }


  encode(n) {
    var data = new Buffer(n);
    var hex = adler32.sum(data).toString(16);
    return hex;
  }


}

module.exports = ShortenerController


