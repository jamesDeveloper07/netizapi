'use strict'

const Logger = use('Logger')
const Job = use('App/Models/Common/Job');
const Bull = use('Rocketseat/Bull')
const EventRepository = use('App/Repository/EventRepository');

class ExecutarIntegracoes {

  static get key() {
    return "ExecutarIntegracoes-key";
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  async handle(job) {
    try {

      const jobExecutarIntegracoes = await Job.findBy({ job_key: 'ExecutarIntegracoes-key' });
      if (!jobExecutarIntegracoes || jobExecutarIntegracoes.situacao === 'I') {
        console.log('Job Executar Integracoes Inativo')
        return;
      }

      Logger.info(`
      ### INICIANDO JOB EXECUTAR INTEGRAÇOES EM ${(new Date()).toLocaleString()} ###`)

      const returnRepository = await EventRepository.executarIntegracoes();

      if (returnRepository && returnRepository.status) {
        if (returnRepository.status == 200) {
          Logger.info(returnRepository.menssage);
        } else {
          Logger.console.warn(returnRepository.menssage);
        }
      } else {
        Logger.console.warn('Não conseguimos realizar o job Executar Integrações (error 001)');
      }

      jobExecutarIntegracoes.last_run_at = new Date();
      await jobExecutarIntegracoes.save()
      Logger.info(`## Finalizado job Executar Integracoes as ${(new Date()).toLocaleString()}.`);

    } catch (error) {
      Logger.error('Erro no job Executar Integracoes.', error);
      throw new Error(error);
    }
  }
}

module.exports = ExecutarIntegracoes;
