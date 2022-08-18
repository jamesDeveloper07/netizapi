'use strict'

const Device = use("App/Models/Security/Device");

class DeviceController {

    async index({ auth, response, request }) {
        const { page,
            limit,
            sortField,
            sortOrder,
            paginate,
            codigo
        } = request.only(['page',
            'limit',
            'sortField',
            'sortOrder',
            'paginate',
            'codigo'
        ])
        const query = Device.query()
        if (codigo) {
            query.where('codigo', 'ILIKE', `%${codigo}%`)
        }
        query.orderBy(sortField ? sortField : 'codigo', sortOrder ? sortOrder : 'asc')

        return await query.paginate((page && page >= 1) ? page : 1, limit ? limit : 10)
    }

    async store({ auth, request, response, params }) {
        try {
            const user = await auth.getUser();

            const data = request.only(['codigo', 'token', 'type'])

            const device = new Device()
            device.user_id = user.id;
            device.status = 'A'
            device.merge(data)

            const deviceFind = await Device.findBy('token', device.token);

            if (!deviceFind) {
                await device.save()
                return device;
            } else {

                //console.log('Atualizando device');
                deviceFind.user_id = user.id;
                deviceFind.status = 'A'
                deviceFind.merge(data)
                deviceFind.updated_at = new Date();
                await deviceFind.save();
                return deviceFind;
            }
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
            const data = request.only(['name', 'slug', 'description'])

            const device = await Device.find(id)
            if (!device) return response.status(400).send({ message: 'Device não encontrado.' })

            device.merge(data)
            await device.save()

            return device
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

            const device = await Device.find(id)
            if (!device) return response.status(400).send({ message: 'Device não encontrado.' })
            await device.delete()

            return device
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

            return await Device.find(id)
        } catch (error) {
            console.error(error)
            return response.status(500).send({
                message: error
            })
        }
    }

    async getByUsuario({ auth, response, params }) {
        try {
            const { user_id } = params

            return await Device.query()
                .where('user_id', user_id).fetch();
        } catch (error) {
            console.error(error)
            return response.status(500).send({
                message: error
            })
        }
    }

    async getByToken({ auth, response, request, params }) {
        try {
            const token = request.only(['token'])

            return await Device.query()
                .where(token).fetch();
        } catch (error) {
            console.error(error)
            return response.status(500).send({
                message: error
            })
        }
    }
}

module.exports = DeviceController