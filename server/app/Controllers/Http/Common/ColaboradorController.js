'use strict'

const User = use('App/Models/Security/User')
const Database = use('Database')
// const MembroEquipe = use('App/Models/Common/MembroEquipe')
// const Equipe = use('App/Models/Common/Equipe')
const Role = use('Adonis/Acl/Role')

class ColaboradorController {

    async index({ params, request, auth }) {

        const { empresa_id } = params
        const { term, withNotEmpresa, limit, role, equipes, roles } = request.all()
        const user = await auth.getUser()

        // let equipesRestringidas = await user.equipesRestringidas().fetch()
        // equipesRestringidas = equipesRestringidas.rows.map(item => item.id)

        // let equipesPermitidas = await user.equipesPermitidas().fetch()
        // equipesPermitidas = equipesPermitidas.rows.map(item => item.id)

        let equipesRestringidas = [];
        let equipesPermitidas = [];

        const query = User.query()
        query.where({ status: true })
        if (roles && roles.length > 0) {
            let rolesWhere = ''
            for (let [i, value] of roles.entries()) {
                rolesWhere += `slug ILIKE '%${value}%'`
                if (i + 1 < roles.length) rolesWhere += ' OR '
            }
            query.whereRaw(`id IN (SELECT user_id FROM security.roles_users_empresas WHERE role_id IN (SELECT id FROM roles WHERE ${rolesWhere}) AND empresa_id = ${empresa_id} )`)
        } else if (role) {
            query.whereRaw(`id IN (SELECT user_id FROM security.roles_users_empresas WHERE role_id IN (SELECT id FROM roles WHERE slug ILIKE '%${role}%') AND empresa_id = ${empresa_id})`)
        }

        if (equipes && equipes.length > 0) {
            const equipe = equipes[0]
            if (equipe == -1) {
                // let queryEquipe = ` id IN (SELECT user_id FROM common.membros_equipes WHERE equipe_id IN
                //     (SELECT id FROM common.equipes WHERE deleted_at IS NULL AND captadora = 'A' AND empresa_id = ${empresa_id})
                //     :permissao
                //     :restricao
                //     )`

                // if (equipesPermitidas.length > 0) {
                //     queryEquipe = queryEquipe.replace(':permissao', ` AND equipe_id IN (${equipesPermitidas.join()})`)
                // } else {
                //     queryEquipe = queryEquipe.replace(':permissao', '')
                // }

                // if (equipesRestringidas.length > 0) {
                //     queryEquipe = queryEquipe.replace(':restricao', ` AND equipe_id NOT IN (${equipesRestringidas.join()})`)
                // } else {
                //     queryEquipe = queryEquipe.replace(':restricao', '')
                // }

                // query.whereRaw(queryEquipe)
            } else {
                query.whereRaw(`id IN (SELECT user_id FROM common.membros_equipes
                    WHERE equipe_id IN (${equipes.filter(item => !equipesRestringidas.includes(item)).join()}))`)
            }
        }

        if (term) {
            query.whereRaw(`(name ILIKE '%${term}%' OR email ILIKE '%${term}%')`)
        }
        if (withNotEmpresa) {
            query.whereDoesntHave('empresas', (builder) => {
                builder.where('common.empresas.id', empresa_id)
            })
        } else {
            if (empresa_id) {
                query.whereHas('empresas', (builder) => {
                    builder.where('empresa_id', empresa_id)
                })
            }
        }
        query.limit(limit ? limit : 200)
        query.orderBy('name', 'asc')
        //query.with('roles')

        const colaboradores = await query.fetch()

        if (empresa_id) {
            for (let colab of colaboradores.rows) {
                colab.$relations.roles = await Role.query()
                    .whereRaw(`id in (
                    SELECT role_id from security.roles_users_empresas
                    where user_id = ${colab.id} and empresa_id = ${empresa_id} )`)
                    .fetch()
            }
        } else {
            colab.$relations.roles = []
        }

        return colaboradores

    }

    async getbyempresas({ params, request, auth }) {
        const { empresa_id, empresas } = request.all();
        //const user = await auth.getUser()
        console.log(empresa_id)
        console.log(empresas)

        const query = User.query()
        query.where({ status: true })

        if (empresa_id && empresa_id.length > 0) {
            query.whereHas('empresas', (builder) => {
                builder.whereRaw(' empresa_id in (' + empresa_id + ') ')
            })
        }

        return await query.fetch()
    }

    async store({ params, request, response }) {
        try {

            const { empresa_id } = params
            const { id } = request.only(['id'])

            const query = User.query()
            query.where({ id: id })
            if (empresa_id && empresa_id.length > 0) {
                query.whereHas('empresas', (builder) => {
                    builder.whereRaw(` empresa_id in (${empresa_id}) `)
                })
            }

            const userInEmpresa = await query.fetch();

            if (userInEmpresa && userInEmpresa.rows.length == 0) {
                const user = await User.find(id)
                await user.empresas().attach([empresa_id])
                return user
            } else {
                return response.status(400).send({
                    erroSlug: 'alreadyBelongs',
                    message: 'Colaborador já pertence a esta empresa'
                })
            }

        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async destroy({ params, response }) {
        const { empresa_id, id } = params
        const user = await User.find(id)

        const trx = await Database.beginTransaction();
        try {
            await user.empresas().detach([empresa_id], trx)

            const equipes = await Equipe
                .query()
                .where({ empresa_id })
                .fetch()
            for (let equipe of equipes.rows) {
                await equipe
                    .membros()
                    .where({ user_id: id })
                    .delete(trx)
            }

            await Database.raw(`DELETE FROM security.roles_users_empresas
             where user_id = ${id}
             and empresa_id = ${empresa_id}`)

            await trx.commit()
        } catch (error) {
            console.log(error)
            await trx.rollback()
            return response.status(500).send(error)
        }
        return user
    }
}

module.exports = ColaboradorController
