'use strict';

const VisibleProperties = require('./visible-properties');

module.exports = unction (app) {
  app.loopback.modelBuilder.mixins.define('VisibleProperties', VisibleProperties);
};
