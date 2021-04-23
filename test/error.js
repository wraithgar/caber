'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const Caber = require('../')

lab.experiment('Invalid data', function () {
  lab.test('Empty string', function () {
    const workout = Caber.parse('')
    Code.expect(workout, 'parsed results').to.be.empty()
  })

  lab.test('Non strings', function () {
    Code.expect(function () {
      Caber.parse()
    }).to.throw(TypeError)
    Code.expect(function () {
      Caber.parse(5)
    }).to.throw(TypeError)
    Code.expect(function () {
      Caber.parse(undefined)
    }).to.throw(TypeError)
    Code.expect(function () {
      Caber.parse(null)
    }).to.throw(TypeError)
  })
})
