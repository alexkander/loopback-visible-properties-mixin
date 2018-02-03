'use strict';

const assert     = require('assert');
const expect     = require('chai').expect;
const should     = require('chai').should;
const loopback   = require('loopback');
const Promise    = require('bluebird');
const supertestp = require('supertest-as-promised')

const api = supertestp('http://localhost:8000');

const LoopbackVisiblePropertiesMixin = require('../visible-properties');

// -----------------------------------------------------------------------------
// SETUP LOOPBACK SERVER -------------------------------------------------------
const app    = module.exports = loopback();
const ds     = loopback.createDataSource('memory');

const Person = ds.createModel('Person', {
  firstName: String,
  lastName: String,
  email: String,
}, { plural: 'persons' });

Person.referencesMany(Person, { as: 'siblings', 'foreignKey': 'siblingsIds', });
Person.belongsTo(Person, { as: 'mother' });
Person.belongsTo(Person, { as: 'father' });
Person.belongsTo(Person, { as: 'couple' });
Person.hasMany(Person, { as: 'children', foreignKey: 'motherId' });

LoopbackVisiblePropertiesMixin(Person, {
  fields: {
    // the ame is visible but the email
    firstName:   true,
    lastName:    true,
    email:       false,
    // make the object visible but not its properties
    mother:      true,
    motherId:    false,
    father:      true,
    fatherId:    false,
    siblings:    true,
    siblingsIds: false,
    children:    true,
    // couple relation object and property is hidden because was ignore here.
  }
});

app.dataSource('ds', ds);
app.model(Person);
app.use(loopback.rest());
// SETUP LOOPBACK SERVER END ---------------------------------------------------

describe('#loopback-visible-properties-mixin', () => {

  const data = [
    { firstName: 'Alexander', lastName: 'Rondon',},
    { firstName: 'Maru', lastName: 'Sanchez',},
    { firstName: 'Evencio', lastName: 'Rondon',},
    { firstName: 'Aurelis', lastName: 'Moreno',},
    { firstName: 'Johan', lastName: 'Rondon',},
    { firstName: 'Elinal', lastName: 'Rondon',},
    { firstName: 'Germain', lastName: 'Rondon',},
    { firstName: 'Juvenal', lastName: 'Rondon',},
  ];

  const siblings = [];

  before((done) => {
    // Listen on HTTP requests
    app.listen(8000, () => {
      Promise.all(data)
      .map((personData) => {
        return Person.create(personData);
      })
      .then((result) => {
        result.map((person, idx) => {
          data[idx] = person;
        })
      })
      .then(() => {
        siblings.push(data[3], data[4], data[5], data[6]);
        data[0].motherId = data[1].id;
        data[0].fatherId = data[2].id;
        data[0].coupleId = data[4].id;
        return data[0].save();
      })
      .then(() => siblings)
      .mapSeries((item) => data[0].siblings.add(item))
      .then(() => done());
    });
  });

  Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize) {
      var R = [];
      for (var i=0; i<this.length; i+=chunkSize)
          R.push(this.slice(i,i+chunkSize));
      return R;
    }
  });

  it('error if mixin setup without options', (done) => {
    try {
      LoopbackVisiblePropertiesMixin({});
    } catch(e) {
      done()
    }
  });

  it('error if mixin setup without options fields', (done) => {
    try {
      LoopbackVisiblePropertiesMixin({}, {});
    } catch(e) {
      done()
    }
  });

  it('check the seed', (done) => {
    
    Person.findById(data[0].id, {
      include: ['mother', 'couple', 'siblings', 'father', 'children']
    })
    .then((person) => {
      expect(person).to.have.property('id');
      expect(person).to.have.property('firstName');
      expect(person).to.have.property('lastName');
      expect(person).to.have.property('email');
      expect(person).to.have.property('siblings');
      expect(person).to.have.property('siblingsIds');
      expect(person).to.have.property('mother');
      expect(person).to.have.property('motherId');
      expect(person).to.have.property('father');
      expect(person).to.have.property('fatherId');
      expect(person).to.have.property('couple');
      expect(person).to.have.property('coupleId');
      expect(person).to.have.property('children');
      expect(person.siblings()).to.have.lengthOf(siblings.length);
      expect(person.siblingsIds).to.have.lengthOf(siblings.length);
      done();
    })
  });

  it('remove get', (done) => {
    api.get(`/persons/${data[0].id}`)
    .query({
      filter: { include: ['mother', 'couple', 'siblings', 'father', 'children'] }
    })
    .expect(200)
    .then(function(res) {
      expect(res.body).to.not.have.property('id');
      expect(res.body).to.have.property('firstName');
      expect(res.body).to.have.property('lastName');
      expect(res.body).to.not.have.property('email');
      expect(res.body).to.have.property('siblings');
      expect(res.body).to.not.have.property('siblingsIds');
      expect(res.body).to.have.property('mother');
      expect(res.body).to.not.have.property('motherId');
      expect(res.body).to.have.property('father');
      expect(res.body).to.not.have.property('fatherId');
      expect(res.body).to.not.have.property('couple');
      expect(res.body).to.not.have.property('coupleId');
      expect(res.body).to.have.property('children');
      expect(res.body.siblings).to.have.lengthOf(siblings.length);
      done();
    });
  });

  it('complete uncover code', () => {
    LoopbackVisiblePropertiesMixin({ definition: {}, settings: { hidden: [] } }, { fields: []});
  });

  after(() => {
    process.exit();
  });

});
