'use strict'

const express = require('express')
const asyncify = require('express-asyncify')
const request = require('request-promise-native')
const { requestOpts } = require('fadverse-utils')

const api = asyncify(express.Router())

api.get('/agents', async (req, res, next) => {
  let result
  const options = requestOpts.get('/agents')
  try {
    result = await request(options)
  } catch (err) {
    next(err)
  }
  res.send(result)
})

api.get('/agent/:uuid', async (req, res) => {
  const { uuid } = req.params
  const options = requestOpts.get(`/agent/${uuid}`)
  let result
  try {
    result = await request(options)
  } catch (e) {
    return next(e)
  }
  res.send(result)
})

api.get('/metrics/:uuid', async (req, res) => {
  const { uuid } = req.params
  const options = requestOpts.get(`/metrics/${uuid}`)
  let result
  try {
    result = await request(options)
  } catch (e) {
    return next(e)
  }
  res.send(result)
})

api.get('/metrics/:uuid/:type', async (req, res) => {
  const { uuid, type } = req.params
  const options = requestOpts.get(`/metrics/${uuid}/${type}`)
  let result
  try {
    result = await request(options)
  } catch (e) {
    return next(e)
  }
  res.send(result)
})

module.exports = api
