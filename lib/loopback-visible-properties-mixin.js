'use strict';

module.exports = function (Model, options) {

  const relationsTypes = ['referencesMany', 'embedsMany', 'belongsTo'];

  const fields     = options.fields || {};
  const properties = Model.definition.properties || {};
  const relations  = Model.definition.settings && Model.definition.settings.relations || [];

  Model.settings.hidden = Model.settings.hidden || [];

  Object.keys(properties)
  .concat(Object.keys(relations))
  .concat(
    Object.keys(relations)
    .filter((relationName) => {
      const type = relations[relationName].type;
      return relationsTypes.indexOf(type) !== -1;
    })
    .map((relationName) => {
      const relation = relations[relationName];
      if ((relation.foreignKey||'') === '') {
        return `${relationName}Id`;
      }
      return relation.foreignKey
    })
  )
  .map((property) => {
    if (Model.settings.hidden.indexOf(property) !== -1) return;
    if (fields[property]) return;
    Model.settings.hidden.push(property);
  });

};