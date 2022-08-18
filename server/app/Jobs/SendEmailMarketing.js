'use strict'

const Logger = use('Logger')
const Mail = use('Mail')
const HistoricoMensagem = use('App/Models/Marketing/HistoricoMensagem')
const Blacklist = use('App/Models/Marketing/ContatoBlacklist')
const Env = use('Env')
const Job = use('App/Models/Common/Job');

class SendEmailMarketing {

    static get key() {
        return "SendEmailMarketing-key";
    }

    static get options() {
        return {
          attempts: 3,
          removeOnComplete: true,
        }
      }

    async handle(job) {
        try {

            const jobSendEmail = await Job.findBy({ job_key: 'SendEmailMarketing-key' });
            if (!jobSendEmail || jobSendEmail.situacao === 'I') {
                console.log('Job SEND EMAIL MARKETING Inativo')
                return;
            }

            const { data } = job
            const mensagem = data.mensagem
            const blacklistLink = `<p><span style="font-size: 12px;">Caso n&atilde;o deseje receber nossos emails, <a href="link_blacklist">clique aqui</a>.</span></p>`

            Logger.info(`
            ### INICIANDO ENVIO DE ${data.oportunidades.length} EMAILS MARKETINGS EM ${(new Date()).toLocaleString()} ###`)

            for (let oportunidade of data.oportunidades) {
                const sairLink = blacklistLink.replace('link_blacklist', `${Env.get('HOST_URL')}/marketing/empresas/${oportunidade.empresa_id}/emails/${oportunidade.cliente.email}/blacklist`)
                try {
                    const texto = mensagem.texto.replace('{nome_cliente}', oportunidade.cliente.nome.trim())
                    texto.concat(`\n\n${sairLink}`)
                    await Mail.raw(texto, (message) => {
                        message.subject(mensagem.titulo)
                        message.from('conatato@growbit.com', mensagem.remetente)
                        message.to(oportunidade.cliente.email)
                        message.replyTo('contato@growbit.com')
                    })
                    await HistoricoMensagem.create({ oportunidade_id: oportunidade.id, mensagem_id: mensagem.id })
                } catch (error) {
                    Logger.error(`Erro ao enviar email ${oportunidade.cliente.email} `, error)
                    if (error && error.responseCode > 500) {
                        await this.addToBlacklist(oportunidade)
                    }
                }
            }
            Logger.info(`## ${data.oportunidades.length} EMAILS MARKETING ENVIADOS`)
        } catch (error) {
            Logger.error('Não foi possível enviar email de marketing\n', error)
        }
    }

    async addToBlacklist(oportunidade) {
        try {
            const contato = oportunidade.cliente.email.toLowerCase()
            console.log(contato)
            await Blacklist.findOrCreate({
                contato
            }, {
                contato,
                empresa_id: oportunidade.empresa_id,
                motivo: 'rejeitado pelo servidor'
            })
        } catch (error) {
            Logger.error('Error ao salvar contato na blacklist ', error)
        }
    }
}

module.exports = SendEmailMarketing;