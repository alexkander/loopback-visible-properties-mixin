'use strict';

const VisibleProperties = require('./visible-properties');

module.exports = function (app) {
  app.loopback.modelBuilder.mixins.define('VisibleProperties', VisibleProperties);
};
