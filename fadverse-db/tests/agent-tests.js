'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const agentFixtures = require('./fixtures/agent')

const config = {
  logging: function () {}
}

const MetricStub = {
  belongsTo: sinon.spy()
}

const single = Object.assign({}, agentFixtures.single)
const id = 1
const uuid = 'yyy-yyy-yyy'
let AgentStub = null
let db = null
let sandbox = null
const uuidArgs = {
  where: {
    uuid
  }
}
const connectedArgs = {
  where: {
    connected: true
  }
}
const usernameArgs = {
  where: {
    username: 'armando',
    connected: true
  }
}
const newAgentArgs = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgentArgs).returns(
    Promise.resolve({
      toJSON () {
        return newAgentArgs
      }
    })
  )

  // Model findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne
    .withArgs(uuidArgs)
    .returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById
    .withArgs(id)
    .returns(Promise.resolve(agentFixtures.byId(id)))

  // Model update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // Model findAll Stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll
    .withArgs(connectedArgs)
    .returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll
    .withArgs(usernameArgs)
    .returns(Promise.resolve(agentFixtures.username))

  const setupDatabase = proxyquire('../src/index', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Agent', (t) => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', (t) => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    'Argument should be the MerticModel'
  )
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    'Argument should be the AgentModel'
  )
})

test.serial('Agent#findById', async (t) => {
  const agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(
    AgentStub.findById.calledWith(id),
    'findById should be called with specified id'
  )

  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})

test.serial('Agent#createOrUpdate - exists', async (t) => {
  const agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice')
  t.true(AgentStub.update.calledOnce, 'update should be called once')
  t.deepEqual(agent, single, 'agent should be the same')
})

test.serial('Agent#createOrUpdate - new', async (t) => {
  const agent = await db.Agent.createOrUpdate(newAgentArgs)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'update should be called once')
  t.true(
    AgentStub.findOne.calledWith({
      where: { uuid: newAgentArgs.uuid }
    }),
    'findOne should be called with uuid args'
  )

  t.true(AgentStub.create.called, 'create should be called')
  t.true(AgentStub.create.calledOnce, 'create should be called once')
  t.true(
    AgentStub.create.calledWith(newAgentArgs),
    'create should be called with new agent args'
  )

  t.deepEqual(agent, newAgentArgs, 'agent should be the same')
})

test.serial('Agent#findConnected', async (t) => {
  const agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(
    AgentStub.findAll.calledWith(connectedArgs),
    'findAll should be called with connected args'
  )

  t.is(
    agents.length,
    agentFixtures.connected.length,
    'agents should be the same length'
  )
  t.deepEqual(agents, agentFixtures.connected, 'agents should be the same')
})

test.serial('Agent#findAll', async (t) => {
  const agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(
    AgentStub.findAll.calledWith(),
    'findAll should be called without args'
  )

  t.is(
    agents.length,
    agentFixtures.all.length,
    'agents should be the same length'
  )
  t.deepEqual(agents, agentFixtures.all, 'agents should be the same')
})

test.serial('Agent#findByUsername', async (t) => {
  const agents = await db.Agent.findByUsername('armando')

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(
    AgentStub.findAll.calledWith(usernameArgs),
    'findAll should be called with username args'
  )

  t.is(
    agents.length,
    agentFixtures.username.length,
    'agents should be the same length'
  )
  t.deepEqual(agents, agentFixtures.username, 'agents should be the same')
})
