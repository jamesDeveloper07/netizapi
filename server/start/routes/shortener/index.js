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
const Route = use('Route');

Route.group(() => {

  Route.get('/', () => {
    return { greeting: 'Hello world in JSON - NETIZAPI - Shortener' }
  })

  Route.get('/:codigo', 'Shortener/ShortenerController.redirect');
  Route.post('/shorten', 'Shortener/ShortenerController.shorten');

  Route.get('/:codigo', 'Shortener/ShortenerController.redirect');
  Route.post('/dataencrypt', 'Shortener/ShortenerController.encrypt');
  Route.post('/hashdecrypt', 'Shortener/ShortenerController.decrypt');

}).prefix('/api/shortener');
