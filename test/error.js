/*jshint expr: true*/
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var caber = require('../');

lab.experiment('Invalid data', function () {
    lab.test('Empty string', function (done) {
        var workout = caber.parse('');
        Lab.expect(workout, 'parsed results').to.be.empty;
        done();
    });

    lab.test('Non strings', function (done) {
        Lab.expect(function () {
            caber.parse();
        }).to.throw(TypeError);
        Lab.expect(function () {
            caber.parse(5);
        }).to.throw(TypeError);
        Lab.expect(function () {
            caber.parse(undefined);
        }).to.throw(TypeError);
        Lab.expect(function () {
            caber.parse(null);
        }).to.throw(TypeError);
        done();
    });

});


