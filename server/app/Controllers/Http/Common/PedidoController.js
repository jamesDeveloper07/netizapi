'use strict'

const Pedido = use('App/Models/Common/Pedido');
const ProdutoPedido = use('App/Models/Common/ProdutoPedido');
const AdicionalProdutoPedido = use('App/Models/Common/AdicionalProdutoPedido');
const FormaPagamentoPedido = use('App/Models/Common/FormaPagamentoPedido');

class PedidoController {

  async index({ request }) {
    const { id, codigo, nome_cliente, status } = request.all();
    const query = Pedido.query()
      .with('produtos.produto')
      .with('produtos.adicionais.adicional')
      .with('formasPagamento.formaPagamento')

    query.where({ status: 'ativo' })
    query.whereNull('deleted_at')

    if (id) {
      query.where({ id })
    } else {
      if (codigo) {
        query.where({ codigo })
      }

      if (nome_cliente) {
        query.where('nome_cliente', 'ilike', `%${nome_cliente}%`)
      }
    }

    if (status) {
      if (status === 'preparando') {
        query.whereNull('ready_at')
        query.orderBy('created_at', 'asc')
      } else {
        if (status === 'pronto') {
          query.whereNotNull('ready_at')
          query.whereNull('delivered_at')
          query.orderBy('ready_at', 'desc')
        } else {
          if (status === 'entregue') {
            query.whereNotNull('delivered_at')
            query.orderBy('delivered_at', 'desc')
          }
        }
      }
    } else {
      query.orderBy('id', 'asc')
    }

    return await query.fetch()

  }

  async show({ request, params }) {
    const { id } = params;
    const query = Pedido.query()
    // .with('produtos.produto')
    // .with('produtos.adicionais.adicional')
    // .with('formasPagamento.formaPagamento')

    query.where({ id })

    return await query.first()

  }

  async store({ request, auth }) {

    try {

      const dataPedido = request.only(['codigo', 'nome_cliente', 'contato_cliente', 'status', 'valor_total', 'valor_pagamento', 'troco'])
      const dataProdutos = request.only(['produtos_pedido'])
      const dataFormas = request.only(['formas_pagamento_pedido'])

      const user = await auth.getUser();
      dataPedido.user_id = user.id;

      if (dataPedido.valor_total && dataPedido.valor_pagamento && (parseFloat(dataPedido.valor_total) <= parseFloat(dataPedido.valor_pagamento))) {
        dataPedido.paid_at = new Date()
      }

      const pedido = await Pedido.create(dataPedido)

      const produtos_pedido = dataProdutos.produtos_pedido

      for (let produto of produtos_pedido) {
        const adicionais_produto_pedido = produto.adicionais_produto_pedido;

        produto.pedido_id = pedido.id;

        produto = await ProdutoPedido.create({
          pedido_id: produto.pedido_id,
          produto_id: produto.produto_id,
          quantidade: produto.quantidade,
          observacao: produto.observacao
        })

        for (let adicional of adicionais_produto_pedido) {
          adicional.produto_pedido_id = produto.id;
          //próximo IF é remédio para resolver falha no envio do front
          //(remover após correção)
          if (!adicional.adicional_id && adicional.id) {
            adicional.adicional_id = adicional.id
          }

          adicional = await AdicionalProdutoPedido.create({
            produto_pedido_id: adicional.produto_pedido_id,
            adicional_id: adicional.adicional_id
          })
        }
      }

      const formas_pagamento_pedido = dataFormas.formas_pagamento_pedido

      for (let forma of formas_pagamento_pedido) {
        forma.pedido_id = pedido.id;
        forma = await FormaPagamentoPedido.create({
          pedido_id: forma.pedido_id,
          forma_pagamento_id: forma.forma_pagamento_id,
          valor: forma.valor
        })
      }

      const id = pedido.id
      const data = await Pedido.query()
        .where({ id })
        .with('produtos.produto')
        .with('produtos.adicionais.adicional')
        .with('formasPagamento.formaPagamento')
        .first()

      return data

    } catch (error) {

      console.log({ error })

    }

  }

  async update({ request, params }) {
    const { id } = params
    const data = request.only(['codigo', 'nome_cliente', 'contato_cliente', 'status'])

    const pedido = await Pedido.findOrFail(id)
    await pedido.where({ id }).update(data);
    return await Pedido.find(id)
  }

  async avancar({ request, params }) {
    const { id } = params

    const pedido = await Pedido.findOrFail(id)

    if (pedido) {
      if (!pedido.ready_at) {
        pedido.ready_at = new Date();
        pedido.updated_at = new Date();
        await pedido.save();
      } else {
        if (!pedido.delivered_at) {
          pedido.delivered_at = new Date();
          pedido.updated_at = new Date();
          await pedido.save();
        }
      }
    }

    return await Pedido.find(id)

  }


  async regredir({ request, params }) {
    const { id } = params
    const pedido = await Pedido.findOrFail(id)

    if (pedido) {
      if (pedido.delivered_at) {
        pedido.delivered_at = null;
        pedido.updated_at = new Date();
        await pedido.save();
      } else {
        if (pedido.ready_at) {
          pedido.ready_at = null;
          pedido.updated_at = new Date();
          await pedido.save();
        }
      }
    }

    return await Pedido.find(id)
  }

  async cancelar({ request, params }) {
    const { id } = params
    const pedido = await Pedido.findOrFail(id)

    if (pedido && pedido.status === 'ativo') {
      pedido.status = 'cancelado';
      pedido.updated_at = new Date();
      await pedido.save();
    }

    return await Pedido.find(id)
  }

  async deletar({ request, params }) {
    const { id } = params
    const pedido = await Pedido.findOrFail(id)

    if (pedido) {
      pedido.deleted_at = new Date();
      await pedido.save();
    }

    return await Pedido.find(id)
  }

}

module.exports = PedidoController
