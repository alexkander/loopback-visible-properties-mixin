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

const Person = ds.createModel('person', {
  firstName: String,
  lastName: String,
  email: String,
}, { plural: 'persons' });

Person.referencesMany(Person, { as: 'sibling', 'foreignKey': 'siblingIds', });
Person.belongsTo(Person, { as: 'mother', foreignKey: 'motherId' });
Person.belongsTo(Person, { as: 'father', foreignKey: 'fatherId' });
Person.belongsTo(Person, { as: 'couple', foreignKey: 'coupleId' });

LoopbackVisiblePropertiesMixin(Person, {
  fields: {
    // the ame is visible but the email
    firstName:  true,
    lastName:   true,
    email:      false,
    // make the object visible but not its properties
    sibling:    true,
    siblingIds: false,
    mother:     true,
    motherId:   false,
    father:     true,
    fatherId:   false,
    // Couple relation object and properti is hidden becasuse was ignore here.
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

  const sibling = [];

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
        sibling.push(data[3], data[4], data[5], data[6]);
        data[0].motherId = data[1].id;
        data[0].fatherId = data[2].id;
        data[0].coupleId = data[4].id;
        return data[0].save();
      })
      .then(() => sibling)
      .mapSeries((item) => data[0].sibling.add(item))
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

  it('check the seed', (done) => {
    Person.findById(data[0].id, {
      include: ['mother', 'couple', 'sibling', 'father']
    })
    .then((person) => {
      expect(person).to.have.property('firstName');
      expect(person).to.have.property('lastName');
      expect(person).to.have.property('email');
      expect(person).to.have.property('sibling');
      expect(person).to.have.property('siblingIds');
      expect(person).to.have.property('mother');
      expect(person).to.have.property('motherId');
      expect(person).to.have.property('father');
      expect(person).to.have.property('fatherId');
      expect(person.sibling()).to.have.lengthOf(sibling.length);
      expect(person.siblingIds).to.have.lengthOf(sibling.length);
      done();
    })
  });

  it('check the seed', (done) => {
    console.log(Object.keys(Person).chunk(20));
  });

  after(() => {
    process.exit();
  });

});
