loopback-visible-properties-mixin
===============

[![npm version](https://badge.fury.io/js/loopback-visible-properties-mixin.svg)](https://badge.fury.io/js/loopback-visible-properties-mixin) [![Build Status](https://travis-ci.org/arondn2/loopback-visible-properties-mixin.svg?branch=master)](https://travis-ci.org/arondn2/loopback-visible-properties-mixin)
[![Coverage Status](https://coveralls.io/repos/github/arondn2/loopback-visible-properties-mixin/badge.svg?branch=master)](https://coveralls.io/github/arondn2/loopback-visible-properties-mixin?branch=master)

Loopback mixin hidden all models properties and allow setup what should be visibles.

## Installation

`npm install loopback-visible-properties-mixin --save`

## Usage

You must add config setup to `server/model-config.json`.

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-visible-properties-mixin",
      "../common/mixins"
    ]
  }
}
```

Add mixin params in in model definition. Example:
```
{
  "name": "Person",
  "properties": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
  },
  "relaions": {
    "siblings": {
      "type": "referencesMany",
      "model": "Person",
      "foreignKey": "siblingsIds"
    },
    "mother": {
      "type": "belongsTo",
      "model": "Person",
      "foreignKey": ""
    },
    "father": {
      "type": "belongsTo",
      "model": "Person",
      "foreignKey": ""
    },
    "couple": {
      "type": "belongsTo",
      "model": "Person",
      "foreignKey": ""
    },
    "children": {
      "type": "hasMany",
      "model": "Person",
      foreignKey: "motherId"
    },
  },
  "mixins": {
    "VisibleProperties": {
      "fields": {
        "firstName":   true,
        "lastName":    true,
        "email":       false,
        "mother":      true,
        "motherId":    false,
        "father":      true,
        "fatherId":    false,
        "siblings":    true,
        "siblingsIds": false,
        "children":    true
      }
    }
  }
}
```

You can setup this mixin with a array of visible properties too. Example:
```
{
  "name": "Person",
  ...
  "mixins": {
    "VisibleProperties": {
      "fields": [
        "firstName",
        "lastName",
        "mother",
        "father",
        "siblings",
        "children",
      ]
    }
  }
}
```

In the previous examples, the attributes `id`, `couple` and `coupleId` will not visible in remote responses because they were ignored and `email`, `motherId`, `fatherId` and `siblingsIds` will not visible because they are in `false`.

### Troubles

If you have any kind of trouble with it, just let me now by raising an issue on the GitHub issue tracker here:

https://github.com/arondn2/loopback-visible-properties-mixin/issues

Also, you can report the orthographic errors in the READMEs files or comments. Sorry for that, I do not speak English.

## Tests

`npm test` or `npm run cover`
