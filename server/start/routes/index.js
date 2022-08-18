'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
require("./api");
require("./common");
require("./security");

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

Route.get('/app', 'AppController.index').middleware(["auth:jwt"]);
Route.get('/app_role_admin', 'AppController.roleAdminValidation').middleware(['auth:jwt', 'is:(administrador)'])
Route.get('/app_role_atend', 'AppController.roleAtendenteValidation').middleware(['auth:jwt', 'is:(administrador or atendente)'])


//Sessions
Route.post("/api/sessions", "Security/SessionController.create");
Route.post("/api/sessions/refresh-roles", "Security/SessionController.refreshRoles").middleware([
  "auth:jwt",
]);
Route.delete("/api/sessions", "Security/SessionController.destroy").middleware([
  "auth:jwt",
]);
Route.get("/api/sessions", "Security/SessionController.show").middleware([
  "auth:jwt",
]);
