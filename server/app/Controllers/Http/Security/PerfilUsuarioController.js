'use strict'

const User = use("App/Models/Security/User");
const Role = use('Adonis/Acl/Role')

class PerfilUsuarioController {

    async index({ params }) {
        const { user_id } = params
        const user = await User.find(user_id)
        return await user.roles().fetch()
    }

    async store({ params, request }) {
        const { id } = request.only(['id'])
        const { user_id } = params

        const user = await User.find(user_id)
        await user.roles().attach([id])

        return await Role.find(id)
    }

    async destroy({ params }) {
        const { user_id, id } = params
        const user = await User.find(user_id)
        await user.roles().detach([id])

        return await Role.find(id)
    }

}

module.exports = PerfilUsuarioController
