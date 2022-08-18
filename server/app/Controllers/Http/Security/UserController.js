'use strict'

const User = use("App/Models/Security/User");
const Hash = use('Hash')
const Job = use('App/Jobs/ForgotPasswordEmail')
const Bull = use('Rocketseat/Bull')
const Database = use('Database')

class UserController {

    async index({ request }) {
        const { page, limit, sortField, sortOrder } = request.all()

        const users = await User
            .query()
            .search(request.all())
            .orderBy(sortField || 'name', sortOrder || 'asc')
            .paginate((page || page == 0) ? page : 1, limit ? limit : 10)
        return users
    }

    async show({ params }) {
        return User.find(params.id)
    }

    async findByEmail({ request, response }) {
        try {
            const {email} = request.only(["email"])
            console.log({email})
            const user = await User.findBy({ email })
            console.log(user)
            if (user && user.id) {
                return user
            } else {                
                return response.status(400).send({
                    erroSlug: 'userNotFound',
                    message:'Usuário não encontrado'
                })
            }

        } catch (error) {
            console.error(error)
            return response.status(500).send(error)
        }

    }

    async create({ request, response }) {
        try {
            const data = request.only(["email", "password", 'name'])
            const hash = await Hash.make((new Date()).toLocaleDateString())

            const user = new User()
            user.merge(data)
            user.password = (new Date().toLocaleDateString())
            user.recovery_password_token = hash
            await user.save()

            const json = user.toJSON();
            json.email_tamplate = 'emails/wellcome_to_playnee'
            json.subject = 'Bem Vindo ao Playnee'
            Bull.add(Job.key, json)//Envia um email para o usuário

            return user
        } catch (error) {
            console.error(error)
            return response.status(500).send(error)
        }

    }

    async update({ request, params }) {
        const { id } = params
        const data = request.only(["name", "status"])
        const user = await User.find(id)
        user.merge(data)
        await user.save()

        return await User.find(id)
    }

    async updateMe({ auth, request, response }) {
        const data = request.only(["id", "name"])
        const senhas = request.only(["nova_senha", "confirme_nova_senha", "password"])

        let user = await Database.select('*').from('security.users').where({ id: data.id }).first()
        if (user.id != data.id) {
            //Se o usuario para alterar não for o da sessão, então...
            return response
                .status(409)//Conflito
                .send("Você não pode alterar essa conta")
        }

        if (senhas.nova_senha) {
            await auth.attempt(user.email, senhas.password)
            user.password = await Hash.make(senhas.nova_senha)
        }

        //Adiciona os dados do user..
        user.name = data.name

        await Database
            .table('security.users')
            .where({ id: data.id })
            .update({
                name: data.name,
                password: user.password
            })

        return user;
    }

}


module.exports = UserController
