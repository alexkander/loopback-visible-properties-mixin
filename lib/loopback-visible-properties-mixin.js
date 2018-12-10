'use strict';

module.exports = function (Model, options) {

  if (!options || !options.fields) {
    throw new Error('loopback-visible-properties-mixin: fields setup is not defined');
  }

  const fields = options.fields;
  const properties = [];
  const hidden = Model.settings.hidden || [];

  if (options.fields instanceof Array) {
    fields = {};
    options.fields.map((field) => {
      fields[field] = true;
    });
  }

  hidden.push.apply(hidden, Object.keys(fields).filter(v => !fields[v]));

  if (Model.definition.properties) {
    properties.push.apply(properties, Object.keys(Model.definition.properties));
  }
  if (Model.relations) {
    properties.push.apply(properties, Object.keys(Model.relations));
    properties.push.apply(properties, 
      Object.keys(Model.relations)
      .filter((relationName) => {
        const type = Model.relations[relationName].type;
        return ['referencesMany', 'embedsMany', 'belongsTo'].indexOf(type) !== -1;
      })
      .map((relationName) => {
        return Model.relations[relationName].keyTo;
      })
    );
  }
  
  properties.map((property) => {
    if (hidden.indexOf(property) !== -1) return;
    if (fields[property]) return;
    hidden.push(property);
  });

  Model.settings.hidden = hidden;

};