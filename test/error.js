'use strict';

var Lab = require('lab');
var Code = require('code');
var lab = exports.lab = Lab.script();
var caber = require('../');

lab.experiment('Invalid data', function () {
    lab.test('Empty string', function (done) {
        var workout = caber.parse('');
        Code.expect(workout, 'parsed results').to.be.empty();
        done();
    });

    lab.test('Non strings', function (done) {
        Code.expect(function () {
            caber.parse();
        }).to.throw(TypeError);
        Code.expect(function () {
            caber.parse(5);
        }).to.throw(TypeError);
        Code.expect(function () {
            caber.parse(undefined);
        }).to.throw(TypeError);
        Code.expect(function () {
            caber.parse(null);
        }).to.throw(TypeError);
        done();
    });

});
