'use strict'

const express = require('express')
const asyncify = require('express-asyncify')
const request = require('request-promise-native')
const api = asyncify(express.Router())

api.get('/agents', async (req, res) => {})

api.get('/agent/:uuid', async (req, res) => {})

api.get('/metrics/:uuid', async (req, res) => {})

api.get('/metrics/:uuid/:type', async (req, res) => {})

module.exports = api
