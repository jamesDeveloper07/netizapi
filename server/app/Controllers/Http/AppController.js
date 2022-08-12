'use strict'

class AppController {
  index(){
    return 'HELLO NETIZ WORLD: VALIDAÇÂO LOGADO'
  }

  roleAdminValidation(){
    return 'HELLO NETIZ WORLD: VALIDAÇÂO LOGADO e ROLE ADMINISTRADOR'
  }

  roleAtendenteValidation(){
    return 'HELLO NETIZ WORLD: VALIDAÇÂO LOGADO e ROLE ATENDENTE'
  }
}

module.exports = AppController
