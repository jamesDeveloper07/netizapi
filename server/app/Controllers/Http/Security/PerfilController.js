'use strict'

const Role = use('Adonis/Acl/Role')

class PerfilController {

    async index({ response, request }) {
        const { page,
            limit,
            sortField,
            sortOrder,
            paginate,
            nome,
            naoMostrarInvisiveis
        } = request.only(['page',
            'limit',
            'sortField',
            'sortOrder',
            'paginate',
            'nome',
            'naoMostrarInvisiveis'
        ])
        const query = Role.query()

        if (nome) {
            query.where('name', 'ILIKE', `%${nome}%`)
        }

        if (naoMostrarInvisiveis && (naoMostrarInvisiveis == true || naoMostrarInvisiveis == 'true')) {
            query.where({ is_invisible: false })
        }

        query.orderBy(sortField ? sortField : 'name', sortOrder ? sortOrder : 'asc')

        return await query.paginate((page && page >= 1) ? page : 1, limit ? limit : 10)
    }

    async store({ request, response }) {
        try {
            const data = request.only(['name', 'slug', 'description', 'is_invisible'])

            const role = new Role()
            role.merge(data)
            await role.save()

            return role
        } catch (error) {
            console.error(error)
            return response.status(500).send({
                message: error
            })
        }
    }

    async update({ request, response, params }) {
        try {
            const { id } = params
            const data = request.only(['name', 'slug', 'description', 'is_invisible'])

            const role = await Role.find(id)
            if (!role) return response.status(400).send({ message: 'Perfil não encontrado.' })

            role.merge(data)
            await role.save()

            return role
        } catch (error) {
            console.error(error)
            return response.status(500).send({
                message: error
            })
        }
    }

    async delete({ response, params }) {
        try {
            const { id } = params

            const role = await Role.find(id)
            if (!role) return response.status(400).send({ message: 'Perfil não encontrado.' })
            await role.delete()

            return role
        } catch (error) {
            console.error(error)
            return response.status(500).send({
                message: error
            })
        }
    }

    async show({ response, params }) {
        try {
            const { id } = params

            return await Role.find(id)
        } catch (error) {
            console.error(error)
            return response.status(500).send({
                message: error
            })
        }
    }
}

module.exports = PerfilController
