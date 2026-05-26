const { crudRoutes, Event } = require('./_crud');
module.exports = crudRoutes(Event, { isActive: true });
