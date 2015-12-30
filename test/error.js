'use strict';

var Lab = require('lab');
var Code = require('code');
var lab = exports.lab = Lab.script();
var Caber = require('../');

lab.experiment('Invalid data', function () {

  lab.test('Empty string', function (done) {

    var workout = Caber.parse('');
    Code.expect(workout, 'parsed results').to.be.empty();
    done();
  });

  lab.test('Non strings', function (done) {

    Code.expect(function () {

      Caber.parse();
    }).to.throw(TypeError);
    Code.expect(function () {

      Caber.parse(5);
    }).to.throw(TypeError);
    Code.expect(function () {

      Caber.parse(undefined);
    }).to.throw(TypeError);
    Code.expect(function () {

      Caber.parse(null);
    }).to.throw(TypeError);
    done();
  });

});
