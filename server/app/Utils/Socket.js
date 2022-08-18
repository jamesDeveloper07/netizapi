const Ws = use('Ws')

function broadcast(empresa_id, id, type, data) {
  const channel = Ws.getChannel(`empresa:*`)
  if (!channel) return
  
  const topic = channel.topic(`empresa:${empresa_id}:${id}`)
  if (!topic) {
    console.error(`Has no topic to empresa:${empresa_id}:${id}`)
    return
  }

  try {
    topic.broadcastToAll(`message`, {
      type: `empresa:${empresa_id}:${type}`,
      obj: data
    });
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  broadcast
}