'use strict'

class MensagemController {

  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request
    console.log('A new subscription for mensagem topic', socket.topic)
  }

  onMessage(message) {
    console.log('got message', message)
  }

  onClose() {
    console.log('Closing subscription for mensagem topc', this.socket.topic)
  }

}

module.exports = MensagemController
