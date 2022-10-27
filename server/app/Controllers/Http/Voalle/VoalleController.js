'use strict'

const Env = use('Env')
const axios = require('axios');
const Database = use('Database')
const RoleAndPermission = use('App/Utils/RoleAndPermission');
const moment = require('moment-timezone');

class VoalleController {

  async getContratosByClientId({ request, response, params }) {
    try {
      console.log('Método GET CONTRACT Voalle Controller');
      const { client_id } = params;

      const contracts = await Database
        .connection('pgvoalle')
        .raw(`SELECT cont.id, cont.contract_number, ('Contrato nº ' || cont.contract_number) as contract_description, cont.client_id,
        cont.people_address_id, addr.street, addr.number, addr.address_complement,
        addr.neighborhood, addr.city, addr.state, addr.country, addr.postal_code,

        cont.amount, cont.billing_day as diaFaturar, cont.collection_day as diaVencimento, cont.cut_day as diaCorte,
		    cont.stage, cont.v_stage, cont.status, cont.v_status, cont.unblock_attempt_count,
		    CASE WHEN cont.unblock_attempt_count > 0 THEN false ELSE true END AS can_unblock,

        (select count(fat.id) FROM erp.financial_receivable_titles fat
        where fat.client_id = cont.client_id
        and fat.contract_id = cont.id
            and ((fat.deleted = false) AND (fat.type = 2) AND (fat.bill_title_id IS NULL) AND (fat.finished = false) AND (fat.renegotiated = false))
        and (fat.balance > 0 and (fat.expiration_date + INTERVAL '1 DAY') < now() )
        ) as total_faturas_atraso

        FROM erp.contracts cont
        left join erp.people_addresses addr ON (addr.id = cont.people_address_id and addr.deleted is FALSE)

        where cont.client_id = ${client_id}
		    and cont.status not in (4,9) -- não esteja cancelado ou encerrado
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

  async getServicesByContractId({ request, response, params }) {
    try {
      console.log('Método GET SERVICES Voalle Controller');
      const { contract_id } = params;

      const contracts = await Database
        .connection('pgvoalle')
        .raw(`SELECT item.contract_id, cont.contract_number
        ,item.id as contract_item_id, item.service_product_id, item.description as item_description, item.total_amount
        ,item.contract_service_tag_id

        FROM erp.contract_items item
        join erp.contracts cont ON (cont.id = item.contract_id)

        where item.contract_id = ${contract_id}

        and item.deleted is FALSE
        and item.contract_service_tag_id is not null

        ORDER BY item.contract_service_tag_id ASC`);

      // later close the connection
      Database.close(['pgvoalle']);

      return contracts.rows;

    } catch (error) {
      console.error('Erro no metodo getServicesByContractId api/voalle \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo getServicesByContractId api/voalle' })
    }
  }

  async getContratosByClientId_old({ request, response, params }) {
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
        tag.service_tag, tag.title, tag.description as tag_description,

        (select count(fat.id) FROM erp.financial_receivable_titles fat
        where fat.client_id = cont.client_id
        and fat.contract_id = cont.id
            and ((fat.deleted = false) AND (fat.type = 2) AND (fat.bill_title_id IS NULL) AND (fat.finished = false) AND (fat.renegotiated = false))
        and (fat.balance > 0 and (fat.expiration_date + INTERVAL '1 DAY') < now() )
        ) as total_faturas_atraso

        FROM erp.contracts cont
        left join erp.people_addresses addr ON (addr.id = cont.people_address_id and addr.deleted is FALSE)
        --left join erp.contract_items item ON (cont.id = item.contract_id and item.deleted is FALSE and item.is_composition)
        left join erp.contract_items item ON (cont.id = item.contract_id and item.deleted is FALSE and item.contract_service_tag_id is not null)
        left join erp.contract_service_tags tag on (item.contract_service_tag_id = tag.id and tag.deleted is FALSE )

        where cont.client_id = ${client_id}
		    and cont.status not in (4,9) -- não esteja cancelado ou encerrado
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


      const faturas = await Database
        .connection('pgvoalle')
        .raw(`SELECT fat.id, fat.client_id, fat.contract_id, cont.contract_number, fat.title, fat.competence, fat.expiration_date, fat.title_amount,
        (fat.balance = 0) as pago, (fat.balance > 0 and ((fat.expiration_date + INTERVAL '1 DAY') < now()) ) as atrasado, fat.typeful_line as cod_barras,
        pag.receipt_date

        FROM erp.financial_receivable_titles fat
        left join erp.contracts cont on (fat.contract_id = cont.id)
        left join erp.financial_receipt_titles pag on (fat.id = financial_receivable_title_id and pag.deleted = false)

        where fat.client_id = ${client_id}
        and ((fat.deleted = false) AND (fat.type = 2) AND (fat.bill_title_id IS NULL) AND (fat.finished = false) AND (fat.renegotiated = false))
        and cont.status not in (4,9) -- não esteja cancelado ou encerrado
        and cont.deleted is false
        ORDER BY id DESC LIMIT 13`);

      // later close the connection
      Database.close(['pgvoalle']);

      return faturas.rows;

    } catch (error) {
      console.error('Erro no metodo getFaturasByClientId api/voalle \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo getFaturasByClientId api/voalle' })
    }
  }


  async getFaturasByContractId({ request, response, params }) {
    try {
      console.log('GET ULTIMAS 13 FATURAS DE UM CLIENTE');
      const { contract_id } = params;


      const faturas = await Database
        .connection('pgvoalle')
        .raw(`SELECT fat.id, fat.client_id, fat.contract_id, cont.contract_number, fat.title, fat.competence, fat.expiration_date, fat.title_amount,
        (fat.balance = 0) as pago, (fat.balance > 0 and ((fat.expiration_date + INTERVAL '1 DAY') < now()) ) as atrasado, fat.typeful_line as cod_barras,
        pag.receipt_date

        FROM erp.financial_receivable_titles fat
        left join erp.contracts cont on (fat.contract_id = cont.id)
        left join erp.financial_receipt_titles pag on (fat.id = financial_receivable_title_id and pag.deleted = false)

        where fat.contract_id = ${contract_id}
        and ((fat.deleted = false) AND (fat.type = 2) AND (fat.bill_title_id IS NULL) AND (fat.finished = false) AND (fat.renegotiated = false))
        and cont.status not in (4,9) -- não esteja cancelado ou encerrado
        and cont.deleted is false
        ORDER BY id DESC LIMIT 13`);

      // later close the connection
      Database.close(['pgvoalle']);

      return faturas.rows;

    } catch (error) {
      console.error('Erro no metodo getFaturasByContractId api/voalle \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo getFaturasByContractId api/voalle' })
    }
  }

  async getFaturaById({ request, response, params }) {
    try {
      console.log('GET FATURA BY ID');
      const { id } = params;


      const faturas = await Database
        .connection('pgvoalle')
        .raw(`SELECT fat.id, fat.client_id, fat.contract_id, cont.contract_number, fat.title, fat.competence, fat.expiration_date, fat.title_amount,
        (fat.balance = 0) as pago, (fat.balance > 0 and ((fat.expiration_date + INTERVAL '1 DAY') < now()) ) as atrasado, fat.typeful_line as cod_barras,
        pag.receipt_date

        FROM erp.financial_receivable_titles fat
        left join erp.contracts cont on (fat.contract_id = cont.id)
        left join erp.financial_receipt_titles pag on (fat.id = financial_receivable_title_id and pag.deleted = false)

        where fat.id = ${id}
        and ((fat.deleted = false) AND (fat.type = 2) AND (fat.bill_title_id IS NULL) AND (fat.finished = false) AND (fat.renegotiated = false))
        limit 1`);

      // later close the connection
      Database.close(['pgvoalle']);

      return faturas.rows[0];

    } catch (error) {
      console.error('Erro no metodo getFaturaById api/voalle \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo getFaturaById api/voalle' })
    }
  }


}

module.exports = VoalleController


