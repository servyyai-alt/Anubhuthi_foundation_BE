const { crudRoutes, Retreat } = require('./_crud');
module.exports = crudRoutes(Retreat, { isActive: true });
