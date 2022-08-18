'use strict'

const Logger = use('Logger')
const moment = require('moment')
const Database = use('Database')
const PassagemEstagio = use('App/Models/Marketing/PassagemEstagio')
const MalaDireta = use('App/Models/Marketing/MalaDireta');
const Oportunidade = use('App/Models/Marketing/Oportunidade')
const Estagio = use('App/Models/Marketing/EstagioEsteira')
const DestinatarioMalaDireta = use('App/Models/Marketing/DestinatarioMalaDireta')
const Esteira = use('App/Models/Marketing/Esteira')
const JobSendEmailMalaDireta = use('App/Jobs/SendEmailsMalaDireta')
const JobSendSmsMalaDireta = use('App/Jobs/SendSmsMalaDireta')
const Job = use('App/Models/Common/Job');
const Bull = use('Rocketseat/Bull')

class GerenciarEsteiras {

  static get key() {
    return "GerenciarEsteiras-key";
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  async handle(job) {
    try {
      
      const jobGerenciarEsteira = await Job.findBy({ job_key: 'GerenciarEsteiras-key' });
      if (!jobGerenciarEsteira || jobGerenciarEsteira.situacao === 'I') {
        console.log('Job GERENCIAR ESTEIRAS Inativo')
        return;
      }

      Logger.info(`
      ### INICIANDO JOB GERENCIAMENTO DE ESTEIRA EM ${(new Date()).toLocaleString()} ###`)

      const esteiras = await Esteira
        .query()
        .where({ situacao: 'A' })
        .whereNull('deleted_at')
        .fetch()

      for (let esteira of esteiras.rows) {
        const anuncios = await esteira.anuncios().fetch()
        if (anuncios.length === 0) continue

        const estagios = await esteira
          .estagios()
          .where({ situacao: 'A' })
          .whereNull('deleted_at')
          .orderBy('ordem', 'ASC')
          .fetch()

        for (let estagio of estagios.rows) {
          const estagioAnterior = await Estagio
            .query()
            .where({
              situacao: 'A',
              esteira_id: esteira.id,
            })
            .whereRaw(`ordem < ${estagio.ordem}`)
            .whereNull('deleted_at')
            .orderBy('ordem', 'DESC')
            .first()


          const queryOportunidadesParaExecutar = Oportunidade
            .query()
            .whereNull('deleted_at')
            .whereNull('data_encerramento')
            .whereIn('anuncio_id', anuncios.rows.map(anuncio => anuncio.id))
            .where({ empresa_id: esteira.empresa_id })
            .whereRaw(`id NOT IN (SELECT oportunidade_id FROM marketing.destinatarios_mala_direta AS dmd
              JOIN marketing.malas_diretas AS mad ON mad.id = dmd.mala_direta_id
              WHERE estagio_id = ${estagio.id} AND oportunidade_id IS NOT NULL      
              )`)
          if (estagioAnterior) {
            if (estagio.executar_em_estagios_anteriores) {
              queryOportunidadesParaExecutar.whereRaw(`id NOT IN (SELECT oportunidade_id FROM marketing.passagens_estagios 
                WHERE estagio_id IN (SELECT id FROM marketing.estagios_esteiras WHERE ordem > ${estagio.ordem} AND esteira_id = ${estagio.esteira_id}))`)
            } else {
              queryOportunidadesParaExecutar
                .whereRaw(` ${estagioAnterior.id} = (SELECT estagio_id 
                FROM marketing.passagens_estagios 
                WHERE oportunidade_id = marketing.oportunidades.id 
                ${estagio.periodo_execucao ? ` AND (now() - created_at) >= interval '${estagio.periodo_execucao} days' ` : ''}
                ORDER BY created_at DESC LIMIT 1)`)
            }
          } else if (estagio.periodo_execucao) {
            queryOportunidadesParaExecutar.whereRaw(`now() - created_at >= interval '${estagio.periodo_execucao} days'`)
          }

          const oportunidadesParaExecutar = await queryOportunidadesParaExecutar.fetch()
          const malaDireta = await estagio.malaDireta().first()
          for (let oportunidade of oportunidadesParaExecutar.rows) {
            if (malaDireta.enviar_sms) {
              const telefones = await oportunidade
                .telefones()
                .whereRaw(`upper(tipo_telefone) LIKE '%CELULAR%'`)
                .fetch()
              for (let telefone of telefones.rows) {
                await DestinatarioMalaDireta.findOrCreate({
                  mala_direta_id: malaDireta.id,
                  //contato: `55${telefone.ddd}${telefone.numero}`,
                  oportunidade_id: oportunidade.id
                }, {
                  mala_direta_id: malaDireta.id,
                  contato: `55${telefone.ddd}${telefone.numero}`,
                  tipo_contato: 'telefone',
                  oportunidade_id: oportunidade.id
                })

              }
            } else if (malaDireta.enviar_email) {
              const cliente = await oportunidade.cliente().first()

              if (cliente.email) await DestinatarioMalaDireta.findOrCreate({
                //contato: cliente.email,
                oportunidade_id: oportunidade.id,
                mala_direta_id: malaDireta.id
              }, {
                mala_direta_id: malaDireta.id,
                contato: cliente.email,
                tipo_contato: 'email',
                oportunidade_id: oportunidade.id
              })
            }
          }
        }
      }

      jobGerenciarEsteira.last_run_at = new Date();

      await jobGerenciarEsteira.save()

      Logger.info(`## Finalizado job de gerenciamento de esteiras as ${(new Date()).toLocaleString()}.`);
    } catch (error) {
      Logger.error('Erro no gerenciamento das esteiras.', error);
      throw new Error(error);
    }
  }
}

module.exports = GerenciarEsteiras;