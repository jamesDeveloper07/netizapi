'use strict'

const Env = use('Env')
const axios = require('axios');
const Database = use('Database')
const RoleAndPermission = use('App/Utils/RoleAndPermission');
const moment = require('moment-timezone');

class VoalleController {

  async getContratosByClientId({ request, response, params }) {
    try {
      console.log('Método Teste Voalle Controller');
      const { client_id } = params;

      const contracts = await Database
        .connection('pgvoalle')
        .raw(`SELECT cont.id, cont.contract_number, ('Contrato nº ' || cont.contract_number) as contract_description, cont.client_id,
        cont.people_address_id, addr.street, addr.number, addr.address_complement,
        addr.neighborhood, addr.city, addr.state, addr.country, addr.postal_code,
        item.id as contract_item_id, item.service_product_id, item.description as item_description, item.total_amount,
        item.contract_service_tag_id,
		    cont.billing_day as diaFaturar, cont.collection_day as diaVencimento, cont.cut_day as diaCorte,
		    cont.stage, cont.v_stage, cont.status, cont.v_status,
		    cont.unblock_attempt_count,
		    CASE WHEN cont.unblock_attempt_count > 0 THEN false ELSE true END AS can_unblock,
        tag.service_tag, tag.title, tag.description as tag_description

        FROM erp.contracts cont
        left join erp.people_addresses addr ON (addr.id = cont.people_address_id and addr.deleted is FALSE)
        --left join erp.contract_items item ON (cont.id = item.contract_id and item.deleted is FALSE and item.is_composition)
        left join erp.contract_items item ON (cont.id = item.contract_id and item.deleted is FALSE and item.contract_service_tag_id is not null)
        left join erp.contract_service_tags tag on (item.contract_service_tag_id = tag.id and tag.deleted is FALSE )

        where cont.client_id = ${client_id}
        and cont.deleted is false
        ORDER BY cont.id ASC`);

      // later close the connection
      Database.close(['pgvoalle']);

      return contracts.rows;

    } catch (error) {
      console.error('Erro no metodo getContratosByClientId api/voalle \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo getContratosByClientId api/voalle' })
    }
  }


  async getFaturasByClientId({ request, response, params }) {
    try {
      console.log('GET ULTIMAS 13 FATURAS DE UM CLIENTE');
      const { client_id } = params;


      const contracts = await Database
        .connection('pgvoalle')
        .raw(`SELECT fat.id, fat.client_id, fat.contract_id, fat.title, fat.competence, fat.expiration_date,
        (fat.balance = 0) as pago, (fat.balance > 0 and fat.expiration_date < now()) as atrasado, fat.typeful_line as cod_barras
        FROM erp.financial_receivable_titles fat

        where fat.client_id = ${client_id}
        and ((deleted = false) AND (type = 2) AND (bill_title_id IS NULL) AND (finished = false) AND (renegotiated = false))
        ORDER BY id DESC LIMIT 13`);

      // later close the connection
      Database.close(['pgvoalle']);

      return contracts.rows;

    } catch (error) {
      console.error('Erro no metodo getFaturasByClientId api/voalle \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo getFaturasByClientId api/voalle' })
    }
  }


  async getFaturasByContractId({ request, response, params }) {
    try {
      console.log('GET ULTIMAS 13 FATURAS DE UM CLIENTE');
      const { contract_id } = params;


      const contracts = await Database
        .connection('pgvoalle')
        .raw(`SELECT fat.id, fat.client_id, fat.contract_id, fat.title, fat.competence, fat.expiration_date,
        (fat.balance = 0) as pago, (fat.balance > 0 and fat.expiration_date < now()) as atrasado, fat.typeful_line as cod_barras
        FROM erp.financial_receivable_titles fat

        where fat.contract_id = ${contract_id}
        and ((deleted = false) AND (type = 2) AND (bill_title_id IS NULL) AND (finished = false) AND (renegotiated = false))
        ORDER BY id DESC LIMIT 13`);

      // later close the connection
      Database.close(['pgvoalle']);

      return contracts.rows;

    } catch (error) {
      console.error('Erro no metodo getFaturasByContractId api/voalle \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo getFaturasByContractId api/voalle' })
    }
  }







}

module.exports = VoalleController


