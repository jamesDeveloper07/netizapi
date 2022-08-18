'use strict'

const Database = use('Database')
const axios = require('axios');
const NotificacaoParametrizada = use("App/Models/Security/NotificacaoParametrizada");
const Notificacao = use("App/Models/Security/Notificacao");
const NotificacaoUser = use("App/Models/Security/NotificacaoUser");

const moment = require('moment')

class NotificacaoParametrizadaController {

    async gerarnotificacoesparametrizadas({ request, response, params }) {
        const trx = await Database.beginTransaction();
        try {
            var mensagem = '';
            var count = 0;
            
            const select = await NotificacaoParametrizada.query().whereRaw(` status like 'A' and (tipo_controle_periodo like 'atemporal' or (tipo_controle_periodo like 'temporal' and data_proxima_execucao <=  now()) ) `).fetch();
            const notificacoesParametrizadas = select.rows;

            //console.log(notificacoesParametrizadas);
            //return notificacoesParametrizadas;

            if (notificacoesParametrizadas && notificacoesParametrizadas.length > 0) {

                for (const notificacaoParametrizada of notificacoesParametrizadas) {

                    const selectNotificacoes = await Database.raw(notificacaoParametrizada.texto_select);
                    const notificacoes = selectNotificacoes.rows;
                    //console.log(notificacaoParametrizada);
                    //return notificacoes;
                    if (notificacoes && notificacoes.length > 0) {

                        count = count + notificacoes.length;

                        for (const not of notificacoes) {
                            //Notificacao
                            const notificacao = new Notificacao();
                            notificacao.submodulo_id = not.submodulo_id;
                            notificacao.titulo = notificacaoParametrizada.titulo;
                            notificacao.mensagem = not.mensagem;
                            notificacao.acao_clique_url = not.acao_clique_url;
                            notificacao.icone_url = not.icone_url;
                            await notificacao.save(trx);

                            //Notificacao Usuário                            
                            const notUser = new NotificacaoUser();
                            notUser.notificacao_id = notificacao.id;
                            notUser.user_id = not.user_id;
                            notUser.created_at = notificacao.created_at;
                            await notUser.save(trx);

                        }
                    }

                    if (notificacaoParametrizada.tipo_controle_periodo == 'temporal') {
                        var newDate = moment(notificacaoParametrizada.data_proxima_execucao).add(notificacaoParametrizada.valor_intervalo_periodo, 'm').toDate();
                        // console.log('nova data')
                        // console.log(newDate)

                        var dtAgora = new Date()
                        // console.log('Data Agora')
                        // console.log(dtAgora)

                        //para os casos em que o job ficar parado por um tempo, e quando voltar não enviar várias notificações temporais no mesmo intervalo.
                        while (moment(newDate).isBefore(dtAgora)) {
                            //console.log('While')
                            newDate = moment(new Date(newDate)).add(notificacaoParametrizada.valor_intervalo_periodo, 'm').toDate();
                            //console.log(newDate)
                        }


                        //melhorar essa lógica abaixo, pois está pulando um intervalo a mais que o desejado
                        // //para os casos em que a proxima execução ficar menor que o intervalo definido com base na dataAgora, adicionar mais um intervalo
                        // var duration = moment.duration(moment(newDate).diff(dtAgora));
                        // var minutes = duration.asMinutes();

                        // console.log('Intervalo Definido:' + notificacaoParametrizada.valor_intervalo_periodo)
                        // console.log('Intervalo Atual:' + minutes)

                        // if (minutes < notificacaoParametrizada.valor_intervalo_periodo) {
                        //     console.log('Mais um intervalo')
                        //     newDate = moment(new Date(newDate)).add(notificacaoParametrizada.valor_intervalo_periodo, 'm').toDate();
                        //     console.log(newDate)
                        // }

                        //console.log('TEMPORAL: alterar data para ' + newDate)

                        var update = `UPDATE security.notificacoes_parametrizadas
                        SET data_proxima_execucao='${this.formatDate(newDate)}',
                        data_ultima_execucao='${this.formatDate(dtAgora)}'
                        WHERE id = ${notificacaoParametrizada.id}`

                        // console.log('UPDATE:')
                        // console.log(update)

                        await trx.raw(update);

                    } else {
                        console.log('ATEMPORAL')
                    }

                }

                if (count > 0) {

                    if (count > 1) {
                        mensagem = `Processo executado com sucesso. ${count} notificações geradas.`;
                    } else {
                        mensagem = `Processo executado com sucesso. ${count} notificação gerada.`;
                    }

                } else {
                    mensagem = 'Processo executado com sucesso. Nenhuma notificação a ser gerada no momento.';
                }


            } else {
                mensagem = 'Nenhum processo de geração de notificação a ser executado no momento.';
            }

            //commit transaction
            await trx.commit()

            response.status(200).send({
                message: mensagem
            })

        } catch (error) {
            console.error(error)
            await trx.rollback();
            return response.status(500).send({
                message: error
            })
        }

    }

    formatDate(dt) {
        return dt ? moment(dt).format('DD/MM/YYYY HH:mm:ss') : null;
    }

}

module.exports = NotificacaoParametrizadaController
