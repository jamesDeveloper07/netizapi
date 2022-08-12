'use strict'

const User = use('App/Models/Security/User');
const Role = use('Adonis/Acl/Role')
const Permission = use('Adonis/Acl/Permission')

class AuthController {
  async register({ request }) {
    const data = request.only(['name', 'username', 'email', 'password']);
    const user = await User.create(data);
    return user;
  }

  async authenticate({ request, auth }) {
    const { email, password } = request.all()
    const token = await auth.attempt(email, password);
    const user = await User.findBy({ email })
    await user.loadMany(['roles', 'permissions', 'roles.permissions'])
    return { user, auth: token }
  }

  async refeshtoken({ request, auth }) {
    const { refresh_token } = request.all()
    if (refresh_token) {
      const token = await auth
        .newRefreshToken()
        .generateForRefreshToken(refresh_token, true)

      const user = await auth.getUser();
      await user.loadMany(['roles', 'permissions', 'roles.permissions']);
      return { user, auth: token }
    }
  }

  async revoke({ auth }) {
    const user = await auth.getUser();
    await user.tokens().update({ is_revoked: true });
  }

}

module.exports = AuthController
