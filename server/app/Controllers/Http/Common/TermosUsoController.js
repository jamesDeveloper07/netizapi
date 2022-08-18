'use strict'
const TermosUso = use('App/Models/Common/TermosUso')
const Empresa = use('App/Models/Common/Empresa')
const HistoricoTermosUso = use('App/Models/Common/HistoricoTermosUso')

const Database = use('Database')
const Logger = use('Logger')

class TermosUsoController {

    async store({ request, params, auth }) {
        const user = await auth.getUser();
        const { empresa_id } = params
        const data = await request.only([
            'nome',
            'descricao',
            'versao',
            'link_url',
            'data_inicio_vigencia',
            'data_fim_vigencia'
        ])

        await Database.raw(`UPDATE common.termos_uso set data_fim_vigencia = now() WHERE data_fim_vigencia is null`)

        const termosUso = new TermosUso();
        termosUso.merge({
            ...data,
            user_id: user.id,
            deleted_at: null
        })
        await termosUso.save()

        return termosUso
    }

    async update({ response, request, params }) {
        const { empresa_id, id } = params
        const data = await request.only([
            'nome',
            'descricao',
            'versao',
            'link_url',
            'data_inicio_vigencia',
            'data_fim_vigencia'
        ])

        const termosUso = await TermosUso.findBy({ id });
        termosUso.merge(data)
        await termosUso.save()

        return termosUso
    }

    async assinarTermosUso({ response, request, params, auth }) {
        try {
            const { empresa_id, id } = params

            const empresa = await Empresa.findBy({ id: empresa_id });
            empresa.termos_uso_id = id;
            empresa.updated_at = new Date()
            await empresa.save()

            const user = await auth.getUser();
            const historico = new HistoricoTermosUso();
            historico.merge({
                termos_uso_id: id,
                empresa_id: empresa.id,
                user_id: user.id
            })

            await historico.save()

            return empresa
        } catch (error) {
            throw error
        }

    }

    async show({ params }) {
        const { id, empresa_id } = params
        const termosUso = await TermosUso.findBy({ id });
        return termosUso
    }

    async getVigente({ params }) {
        const termosUso = await TermosUso.query().whereNull('data_fim_vigencia').fetch();
        return termosUso.rows[0]
    }

    async getHistoricoTermosEmpresa({ params, request, auth }) {
        const { id, empresa_id } = params
        const { page,
            limit,
            sortField = 'dt_assinatura',
            sortOrder = 'desc',
        } = request.only(['page',
            'limit',
            'sortField',
            'sortOrder'
        ])

        const query = HistoricoTermosUso
            .query()
            .with('empresa')
            .with('termosUso')
            .with('user')
            .where('empresa_id', empresa_id)
            .orderBy('dt_assinatura', 'desc')

        const result = await query.paginate(page ? page : 1, limit ? limit : 10)

        return result
    }

    async index({ params, request, auth }) {
        try {
            const { empresa_id } = params

            const { nome, versao } = request.only(['nome', 'versao']);

            var { data_inicio_vigencia, data_fim_vigencia } = request.only(['data_inicio_vigencia', 'data_fim_vigencia']);

            const { page,
                limit,
                sortField = 'nome',
                sortOrder = 'ASC',
            } = request.only(['page',
                'limit',
                'sortField',
                'sortOrder'
            ])

            const query = TermosUso
                .query()
                .whereNull('deleted_at')
                .orderBy('data_inicio_vigencia', 'desc')

            if (nome && nome.trim().length > 0) {
                query.whereRaw(`nome ilike '%${nome}%'`)
            }

            if (versao && versao.trim().length > 0) {
                query.whereRaw(`versao ilike '%${versao}%'`)
            }

            if (data_inicio_vigencia && data_fim_vigencia) {
                query.whereRaw(`( date(data_inicio_vigencia AT TIME ZONE 'BRA') BETWEEN date('${data_inicio_vigencia}' AT TIME ZONE 'BRA') AND date('${data_fim_vigencia}' AT TIME ZONE 'BRA') or date(data_fim_vigencia AT TIME ZONE 'BRA') BETWEEN date('${data_inicio_vigencia}' AT TIME ZONE 'BRA') AND date('${data_fim_vigencia}' AT TIME ZONE 'BRA') )`);
            } else {
                if (data_inicio_vigencia) {
                    query.whereRaw(`date(data_inicio_vigencia AT TIME ZONE 'BRA') >= date('${data_inicio_vigencia}')`)
                }
                if (data_fim_vigencia) {
                    query.whereRaw(`date(data_fim_vigencia AT TIME ZONE 'BRA') <= date('${data_fim_vigencia}')`)
                }
            }

            const result = await query.paginate(page ? page : 1, limit ? limit : 10)
            return result

        } catch (error) {
            throw error
        }

    }

}

module.exports = TermosUsoController
