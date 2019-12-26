'use strict';

var Lab = require('@hapi/lab');
var Code = require('@hapi/code');
var lab = exports.lab = Lab.script();
var Caber = require('../');

lab.experiment('Invalid data', function () {

  lab.test('Empty string', function () {

    var workout = Caber.parse('');
    Code.expect(workout, 'parsed results').to.be.empty();
  });

  lab.test('Non strings', function () {

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
  });

});
