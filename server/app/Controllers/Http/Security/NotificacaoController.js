'use strict'

const Database = use('Database')
const axios = require('axios');
const Notificacao = use("App/Models/Security/Notificacao");
const NotificacaoUser = use("App/Models/Security/NotificacaoUser");

class NotificacaoController {

    //ENVIAR PUSH----------

    async enviarNotificacao({ auth, request }) {
        try {

            const notification = request.only('notification')
            const to = request.only('to')

            let urlApi = 'https://fcm.googleapis.com/fcm/send';

            const response = await axios({
                method: 'post',
                url: urlApi,
                responseType: 'json',
                headers: {
                    "content-type": "application/json",
                    "authorization": "key=AAAAM4YfNU0:APA91bGF1ohOoivpDv41e1ZGZCm-RzKx9Z9IlwiF94Nfz4psMJpKa6QPBNeJoi0AqaphVKg2Elo76rPk4IlcyYD_o49RWwfVTtLT9CkakeFfYoLFDa04WHFtRI8kPlvcjY-NzgfJOyxv"
                },
                data: {
                    "notification": notification.notification,
                    "to": to.to
                }
            })
            return response.data
        } catch (error) {
            console.error(error.response)
            throw error
        }
    }

    async enviarParaLista({ auth, request }) {
        try {
            const notification = request.only('notification')
            const to = request.only('to')

            let urlApi = 'https://fcm.googleapis.com/fcm/send';

            const response = await axios({
                method: 'post',
                url: urlApi,
                responseType: 'json',
                headers: {
                    "content-type": "application/json",
                    "authorization": "key=AAAAM4YfNU0:APA91bGF1ohOoivpDv41e1ZGZCm-RzKx9Z9IlwiF94Nfz4psMJpKa6QPBNeJoi0AqaphVKg2Elo76rPk4IlcyYD_o49RWwfVTtLT9CkakeFfYoLFDa04WHFtRI8kPlvcjY-NzgfJOyxv"
                },
                data: {
                    "notification": notification.notification,
                    "registration_ids": to.to
                }
            })
            return response.data
        } catch (error) {
            console.error(error.response)
            throw error
        }
    }

    async enviarNotificacoesProgramadas() {
        try {

            const urlApi = 'https://fcm.googleapis.com/fcm/send';

            const select = await Database.raw(`SELECT notif.id, notuser.user_id, users.name as user_name, titulo, mensagem, acao_clique_url, icone_url, sub.icon_font,
origem_id, notif.created_at, scheduled_to, sended_at, readed_at, notif.updated_at, submodulo_id, sub.nome as submodulo_nome, sub.modulo_id, mod.nome as modulo_nome
from security.notificacoes_users notuser
join security.notificacoes notif on (notif.id = notuser.notificacao_id)
join security.users as users on (users.id = notuser.user_id)
join security.submodulos sub on (notif.submodulo_id = sub.id)
join security.modulos  mod on (sub.modulo_id = mod.id)
where sended_at is null and mod.status like 'A' and sub.status like 'A'
and users.status is true and scheduled_to < now()`);

            const notificacoes = select.rows;

            if (notificacoes && notificacoes.length > 0) {
                for (var index in notificacoes) {
                    const selectDevice = await Database.raw(`SELECT token FROM security.devices
                    where user_id = ${notificacoes[index].user_id} and status like 'A'`);
                    notificacoes[index].devices = selectDevice.rows;

                    var toDevices = [];
                    const devices = notificacoes[index].devices;
                    if (devices && devices.length > 0) {
                        for (var ind in devices) {
                            toDevices.push(devices[ind].token);
                        }
                    }

                    //console.log(notificacoes[index]);
                    if (toDevices.length > 0) {
                        var dataNot = {
                            "notification": {
                                "title": notificacoes[index].titulo,
                                "body": notificacoes[index].mensagem,
                                "click_action": notificacoes[index].acao_clique_url,
                                "icon": notificacoes[index].icone_url
                            },
                            "registration_ids": toDevices
                        }

                        try {
                            const response = await axios({
                                method: 'post',
                                url: urlApi,
                                responseType: 'json',
                                headers: {
                                    "content-type": "application/json",
                                    "authorization": "key=AAAAM4YfNU0:APA91bGF1ohOoivpDv41e1ZGZCm-RzKx9Z9IlwiF94Nfz4psMJpKa6QPBNeJoi0AqaphVKg2Elo76rPk4IlcyYD_o49RWwfVTtLT9CkakeFfYoLFDa04WHFtRI8kPlvcjY-NzgfJOyxv"
                                },
                                data: dataNot
                            })
                        } catch (error) {
                            console.error(error)
                        }

                        this.marcarComoEnviada(notificacoes[index])

                        //console.log(response.data);

                    } else {
                        console.log('Usuário sem Device cadastrado!');
                    }
                }
                return {
                    status: 'sucesso',
                    mensagem: 'Notificações enviadas com sucesso!'
                }
            } else {
                return {
                    status: 'sucesso',
                    mensagem: 'Não há notificações a serem enviadas!'

                }
            }
        } catch (error) {
            console.error(error.response)
            throw error
        }
    }

    //--------------------------



    //GETs AND POSTs------------

    /*
    async index({ response, request, auth }) {
        const user = await auth.getUser();

        const notificacoes = await Database.raw(`
        select row_number() OVER () AS id, tarefas.*,

        CASE
            WHEN tipo_notificacao like 'oportunidade_criador' and count > 1
                then 'Você criou ' || count || ' oportunidades agendadas para hoje.'
            WHEN tipo_notificacao like 'oportunidade_criador' and count = 1
                then 'Você criou 1 oportunidade agendada para hoje.'

            WHEN tipo_notificacao like 'oportunidade_responsavel' and count > 1
                then 'Você é responsável por ' || count || ' oportunidades agendadas para hoje.'
            WHEN tipo_notificacao like 'oportunidade_responsavel' and count = 1
                then 'Você é responsável por 1 oportunidade agendada para hoje.'

            WHEN tipo_notificacao like 'acao_responsavel' and count > 1
                then 'Você é responsável por ' || count || ' ações agendadas para hoje.'
            WHEN tipo_notificacao like 'acao_responsavel' and count = 1
                then 'Você é responsável por 1 ação agendada para hoje.'

            WHEN tipo_notificacao like 'publicacao_criador' and count > 1
                then 'Você criou ' || count || ' publicações agendadas para hoje.'
            WHEN tipo_notificacao like 'publicacao_criador' and count = 1
                then 'Você criou 1 publicação agendada para hoje.'

            WHEN tipo_notificacao like 'publicacao_responsavel' and count > 1
                then 'Você é responsável por ' || count || ' publicações agendadas para hoje.'
            WHEN tipo_notificacao like 'publicacao_responsavel' and count = 1
                then 'Você é responsável por 1 publicação agendada para hoje.'

        END as descricao,

        menus.path, menus.icon

        from (

        --oportunidade criador (agendadas para hoje)
        select count(id), criador_id as user_id, 'oportunidade_criador' as tipo_notificacao, 'oportunidades' as menu_alias
        from marketing.oportunidades
        where criador_id = ${user.id}
        and data_agendamento between to_char(now(), 'YYYY-MM-DD 00:00:00')::timestamp and to_char(now(), 'YYYY-MM-DD 23:59:59')::timestamp
        group by criador_id

        union all

        --oportunidade responsável (agendadas para hoje)
        select count(id), user_id, 'oportunidade_responsavel' as tipo_notificacao, 'oportunidades' as menu_alias
        from marketing.oportunidades
        where user_id = ${user.id}
        and data_agendamento between to_char(now(), 'YYYY-MM-DD 00:00:00')::timestamp and to_char(now(), 'YYYY-MM-DD 23:59:59')::timestamp
        group by user_id

        union all

        --ações responsável
        select count(acao.id), quem.user_id, 'acao_responsavel' as tipo_notificacao, 'pdcas' as menu_alias
        from mentoring.acoes acao
        inner join mentoring.users_quem quem on (quem.acao_id = acao.id)
        where quem.user_id = ${user.id}
        and quando between to_char(now(), 'YYYY-MM-DD 00:00:00')::timestamp and to_char(now(), 'YYYY-MM-DD 23:59:59')::timestamp
        group by quem.user_id

        union all

        --publicações criador
        select count(id), user_id, 'publicacao_criador' as tipo_notificacao, 'publicacoes' as menu_alias
        from marketing.publicacoes
        where user_id = ${user.id}
        and data_postagem between to_char(now(), 'YYYY-MM-DD 00:00:00')::timestamp and to_char(now(), 'YYYY-MM-DD 23:59:59')::timestamp
        group by user_id

        union all

        --publicações responsável
        select count(id), designer_responsavel_id as user_id, 'publicacao_responsavel' as tipo_notificacao, 'publicacoes' as menu_alias
        from marketing.publicacoes
        where designer_responsavel_id = ${user.id}
        and data_postagem between to_char(now(), 'YYYY-MM-DD 00:00:00')::timestamp and to_char(now(), 'YYYY-MM-DD 23:59:59')::timestamp
        group by designer_responsavel_id
        ) as tarefas
        join security.menus as menus on tarefas.menu_alias like menus.alias
        where count > 0`
        );

        return notificacoes.rows;
    }
    */

    async index({ auth, response, request }) {
        const { page,
            limit,
            sortField,
            sortOrder,
            paginate,
            titulo
        } = request.only(['page',
            'limit',
            'sortField',
            'sortOrder',
            'paginate',
            'titulo'
        ])
        const query = Notificacao.query()
        if (titulo) {
            query.where('titulo', 'ILIKE', `%${titulo}%`)
        }
        query.orderBy(sortField ? sortField : 'id', sortOrder ? sortOrder : 'asc')

        return await query.paginate((page && page >= 1) ? page : 1, limit ? limit : 10)
    }

    async getByUsuarioLogado({ response, request, auth, params }) {
        const user = await auth.getUser();
        const { situacao } = request.only(['situacao'])
        let { limit = 10 } = request.only(['limit'])

        var sqlSituacao = ''
        if (situacao && situacao === 'lidas') {
            sqlSituacao = 'and readed_at is not null'
        } else {
            if (situacao && situacao === 'nao_lidas') {
                sqlSituacao = 'and readed_at is null'
            }
        }

        const totalNaoLidas = await Database.raw(`select count(distinct(notif.id))
        from security.notificacoes_users notuser
        join security.notificacoes notif on (notif.id = notuser.notificacao_id)
        join security.users as users on (users.id = notuser.user_id)
        join security.submodulos sub on (notif.submodulo_id = sub.id)
        join security.modulos  mod on (sub.modulo_id = mod.id)
        where sended_at is not null
        and user_id = ${user.id}
        and mod.status like 'A'
        and sub.status like 'A'
        and users.status is true
        and readed_at is null`);

        const notificacoes = await Database.raw(`SELECT notif.id, notuser.user_id, users.name as user_name, titulo, mensagem, acao_clique_url, icone_url, sub.icon_font,
        origem_id, notif.created_at, scheduled_to, sended_at, readed_at, notif.updated_at, submodulo_id, sub.nome as submodulo_nome, sub.modulo_id, mod.nome as modulo_nome
        from security.notificacoes_users notuser
        join security.notificacoes notif on (notif.id = notuser.notificacao_id)
        join security.users as users on (users.id = notuser.user_id)
        join security.submodulos sub on (notif.submodulo_id = sub.id)
        join security.modulos  mod on (sub.modulo_id = mod.id)
        where sended_at is not null
        and user_id = ${user.id}
        and mod.status like 'A'
        and sub.status like 'A'
        and users.status is true
        ${sqlSituacao}
        order by sended_at desc
        LIMIT ${limit}`);

        return {
            totalNaoLidas: totalNaoLidas.rows[0].count,
            notificacoes: notificacoes.rows
        }
    }


    async getByVarious({ response, request, auth, params }) {
        try {
            const user = await auth.getUser();
            const { titulo, situacao, dataInicialEnvio, dataFinalEnvio } = request.only(['situacao', 'titulo', 'dataInicialEnvio', 'dataFinalEnvio'])

            let { page = 0,
                limit = 10,
                sortField = 'sended_at',
                sortOrder = 'desc',
            } = request.only(['page',
                'limit',
                'sortField',
                'sortOrder'
            ])

            if (page) page -= 1

            var sqlSituacao = ''
            if (situacao && situacao === 'lidas') {
                sqlSituacao = 'and readed_at is not null'
            } else {
                if (situacao && situacao === 'nao_lidas') {
                    sqlSituacao = 'and readed_at is null'
                }
            }

            var sqlTitulo = ''
            if (titulo && titulo.length > 0) {
                sqlTitulo = `and titulo ILIKE '%${titulo}%'`
            }

            var sqlPeriodo = ''
            if (dataInicialEnvio && dataFinalEnvio) {
                sqlPeriodo = `and date(sended_at AT TIME ZONE 'BRA') BETWEEN date('${dataInicialEnvio}' AT TIME ZONE 'BRA') AND date('${dataFinalEnvio}' AT TIME ZONE 'BRA') `;
            } else {
                if (dataInicialEnvio) {
                    sqlPeriodo = `and date(sended_at AT TIME ZONE 'BRA') >= date('${dataInicialEnvio}')`
                }
                if (dataFinalEnvio) {
                    sqlPeriodo = `and date(sended_at AT TIME ZONE 'BRA') <= date('${dataFinalEnvio}')`
                }
            }

            let sqlTotal = `select count(distinct(notif.id))
        from security.notificacoes_users notuser
        join security.notificacoes notif on (notif.id = notuser.notificacao_id)
        join security.users as users on (users.id = notuser.user_id)
        join security.submodulos sub on (notif.submodulo_id = sub.id)
        join security.modulos  mod on (sub.modulo_id = mod.id)
        where sended_at is not null
        and user_id = ${user.id}
        and mod.status like 'A'
        and sub.status like 'A'
        and users.status is true
        ${sqlTitulo}
        ${sqlPeriodo}
        ${sqlSituacao}`

            const notificacoes = await Database.raw(`SELECT notif.id, notuser.user_id, users.name as user_name, titulo, mensagem, acao_clique_url, icone_url, sub.icon_font,
        origem_id, notif.created_at, scheduled_to, sended_at, readed_at, notif.updated_at, submodulo_id, sub.nome as submodulo_nome, sub.modulo_id, mod.nome as modulo_nome
        from security.notificacoes_users notuser
        join security.notificacoes notif on (notif.id = notuser.notificacao_id)
        join security.users as users on (users.id = notuser.user_id)
        join security.submodulos sub on (notif.submodulo_id = sub.id)
        join security.modulos  mod on (sub.modulo_id = mod.id)
        where sended_at is not null
        and user_id = ${user.id}
        and mod.status like 'A'
        and sub.status like 'A'
        and users.status is true
        ${sqlTitulo}
        ${sqlPeriodo}
        ${sqlSituacao}
        order by ${sortField} ${sortOrder}
        LIMIT ${limit}
        OFFSET ${page ? (parseInt(page) * parseInt(limit)) : 0} `);

            const total = await Database.raw(sqlTotal)

            return {
                total: total.rows[0].count,
                lastPage: Math.ceil(total.rows[0].count / limit),
                perPage: limit,
                page: page + 1,
                data: notificacoes.rows
            }

        } catch (error) {
            console.log(error)
            return response
                .status(400)
                .send({ message: 'Não foi possível consultar Notificações' })
        }
    }

    async marcarComoLida({ request, params, auth }) {
        try {
            const { id } = params
            const user = await auth.getUser();

            var notificacao_id = id;
            var user_id = user.id;

            const notificacao = await NotificacaoUser.findBy({ notificacao_id, user_id })
            var sql = `UPDATE security.notificacoes_users SET readed_at='${new Date().toISOString()}' WHERE notificacao_id=${notificacao.notificacao_id} and user_id=${notificacao.user_id} and readed_at is null`;
            await Database.raw(sql);
            const notiUpdated = await NotificacaoUser.findBy({ notificacao_id, user_id })
            return notiUpdated;
        } catch (error) {
            console.error(error)
            return response.status(500).send({
                message: error
            })
        }

    }

    async marcarComoEnviada(notificacao) {
        try {

            //console.log('Marcando Como ENVIADA')

            var notificacao_id = notificacao.id;
            var user_id = notificacao.user_id;

            const notFind = await NotificacaoUser.findBy({ notificacao_id, user_id })
            if (notFind) {
                var sql = `UPDATE security.notificacoes_users SET sended_at='${new Date().toISOString()}' WHERE notificacao_id=${notificacao_id} and user_id=${user_id} and sended_at is null`;
                await Database.raw(sql);
                const notiUpdated = await NotificacaoUser.findBy({ notificacao_id, user_id })
                return notiUpdated;
            } else {
                console.log(`Notificação intitulada ${notificacao.titulo} para o usuário ${notificacao.user_name} não foi encontrada para marcação de envio!`)
            }
        } catch (error) {
            console.error(error)
        }

    }



}

module.exports = NotificacaoController
