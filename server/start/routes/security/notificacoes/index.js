const Route = use('Route')

Route.group(() => {    
    //lista de notificações antiga
    Route.get('/notificacoes', 'Security/NotificacaoController.index').middleware(['auth:jwt']);
    
    //envios
    Route.post('/notificacoes/enviarNotificacao', 'Security/NotificacaoController.enviarNotificacao').middleware(['auth:jwt']);
    Route.post('/notificacoes/enviarParaLista', 'Security/NotificacaoController.enviarParaLista').middleware(['auth:jwt']);

    Route.post('/notificacoes/enviarNotificacoesProgramadas', 'Security/NotificacaoController.enviarNotificacoesProgramadas');
    
    Route.get('/notificacoes/getByUsuarioLogado', 'Security/NotificacaoController.getByUsuarioLogado').middleware(['auth:jwt']);
    Route.get('/notificacoes/getByVarious', 'Security/NotificacaoController.getByVarious').middleware(['auth:jwt']);
    Route.put('/notificacoes/marcarComoLida/:id', 'Security/NotificacaoController.marcarComoLida').middleware(['auth:jwt']);

    //execucao processo
    Route.post('/notificacoes/gerarnotificacoesparametrizadas', 'Security/NotificacaoParametrizadaController.gerarnotificacoesparametrizadas')
    
}).prefix('/api/security') 