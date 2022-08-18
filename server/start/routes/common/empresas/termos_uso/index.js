const Route = use('Route')

Route.group(() => {
    //Politicas Privacidade
    Route.get('/termos-uso/', 'TermosUsoController.index')
    Route.get('/termos-uso/:id', 'TermosUsoController.show')
    Route.post('/termos-uso/', 'TermosUsoController.store').validator('Common/TermosUso')
    Route.put('/termos-uso/:id', 'TermosUsoController.update').validator('Common/TermosUso')

    Route.get('/termos-uso-empresa/', 'TermosUsoController.getHistoricoTermosEmpresa')
    Route.get('/termos-uso-vigente', 'TermosUsoController.getVigente')
    Route.post('/termos-uso/:id/assinar-termos-uso', 'TermosUsoController.assinarTermosUso')


}).namespace('Common').prefix('/api/common/empresas/:empresa_id')
    .middleware(['auth:jwt'])
