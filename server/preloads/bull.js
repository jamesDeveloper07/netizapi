const Bull = use('Rocketseat/Bull')

Bull.process()
  // Optionally you can start BullBoard:
  .ui(9999, 'localhost') // http://localhost:9999
// You don't need to specify either port or hostname, the default port number is 9999 and the default hostname is localhost
