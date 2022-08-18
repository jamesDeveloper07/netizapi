'use strict'

const Env = use('Env')
const Drive = use('Drive')

class UserAvatarController {

    async store({ response, request, auth }) {
        const user = await auth.getUser()

        await request.multipart.file('avatar', {
            types: ['image'],
            size: '2mb'
        }, async file => {
            const ACL = 'public-read'
            const contentType = file.headers['content-type']
            const fileName = `${user.id}.jpeg`
            let key = `${Env.get('S3_APP_PATH')}/users/avatars/${fileName}`

            const exists = await Drive.disk('s3').exists(key);
            if (exists) await Drive.disk('s3').delete(key);

            await Drive.disk('s3').put(key, await file.stream, {
                contentType,
                ACL
            })

            user.avatar = fileName
            await user.save()
        })

        await request.multipart.process()

        return user
    }
}

module.exports = UserAvatarController
