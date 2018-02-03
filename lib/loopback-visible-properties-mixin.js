'use strict';

module.exports = function (Model, options) {

  if (!options || !options.fields) {
    throw new Error('loopback-visible-properties-mixin: fields setup is not defined');
  }

  const properties = [];
  if (Model.definition.properties) {
    properties.push.apply(properties, Object.keys(Model.definition.properties));
  }
  if (Model.relations) {
    properties.push.apply(properties, Object.keys(Model.relations));
  }
  if (!Model.settings.hidden) {
    Model.settings.hidden = [];
  }

  properties
  .concat(Object.keys(Model.relations))
  .concat(
    Object.keys(Model.relations)
    .filter((relationName) => {
      const type = Model.relations[relationName].type;
      return ['referencesMany', 'embedsMany', 'belongsTo'].indexOf(type) !== -1;
    })
    .map((relationName) => {
      return Model.relations[relationName].keyTo;
    })
  )
  .map((property) => {
    if (Model.settings.hidden.indexOf(property) !== -1) return;
    if (options.fields[property]) return;
    Model.settings.hidden.push(property);
  });

};