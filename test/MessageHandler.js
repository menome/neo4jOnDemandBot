'use strict'
var assert = require('chai').assert
const Bot = require('@menome/botframework')
var messageHandler = require('../app/messageHandler')

var bot = new Bot({
  config: {
    name: 'theLink Data Refinery Service',
    desc: 'Converts sync messages into graph updates.'
  },
  configSchema: {
    inferDates: {
      doc: 'Should we try to infer whether strings are ISO dates, based on a regex?',
      format: 'Boolean',
      default: false,
      env: 'INFER_DATES'
    },
    mergeSchema: {
      doc: 'Should we merge the nodes or created dated links?',
      format: 'Boolean',
      default: false,
      env: 'MERGE_SCHEMA'
    }
  }
})

var connectedMsg = {
  'Name': 'Konrad Aust',
  'NodeType': 'Employee',
  'Priority': 1,
  'ConformedDimensions': {
    'Email': 'konrad.aust@menome.com',
    'EmployeeId': 12345
  },
  'Properties': {
    'Status': 'active'
  },
  'Connections': [
    {
      'Name': 'Menome Victoria',
      'NodeType': 'Office',
      'RelType': 'LocatedInOffice',
      'ForwardRel': true,
      'ConformedDimensions': {
        'City': 'Victoria'
      }
    },
    {
      'Name': 'theLink',
      'NodeType': 'Project',
      'RelType': 'WorkedOnProject',
      'ForwardRel': true,
      'ConformedDimensions': {
        'Code': '5'
      }
    }
  ]
}

var connectionlessMsg = {
  'Name': 'Konrad Aust',
  'NodeType': 'Employee',
  'Priority': 1,
  'ConformedDimensions': {
    'Email': 'konrad.aust@menome.com',
    'EmployeeId': 12345
  },
  'Properties': {
    'Status': 'active'
  }
}
var mh = new messageHandler(bot)

describe('BuildObjectStr', function () {
  it('Builds a string from an object.', function () {
    var str = mh.fuckThisBuildObj({key1: 'string', key2: 21, key3: false, key4: {}, key5: []})
    assert.equal(str, '{key1: "string",key2: 21,key3: false}')
  })
})

describe('GetMergeQuery', function () {
  it('Generates a create cql query with parameters for a node without connections', function () {
    var expectedQueryStr = 'CREATE (node:Card:Employee {Email: "konrad.aust@menome.com",EmployeeId: 12345})\nON CREATE SET node.Uuid = $newUuid\nSET node += $nodeParams\nSET node.TheLinkAddedDate = datetime();'
    var expectedParams = {
      nodeParams:
      {
        Status: 'active',
        Email: 'konrad.aust@menome.com',
        EmployeeId: 12345,
        Name: 'Konrad Aust',
        PendingMerge: false
      }
    }
    var queryProps = { // If we don't encounter a node to merge with, this is our initial priority info.
      SourceSystems: ['TestSystem'],
      SourceSystemPriorities: [1],
      Properties: connectionlessMsg.Properties
    }

    var mergeQuery = mh.fuckThisCreateQuery(connectionlessMsg, queryProps)
    assert.equal(expectedQueryStr, mergeQuery.compile())
    var agnosticParams = mergeQuery.params()
    delete agnosticParams.newUuid
    // assert.equal(JSON.stringify(expectedParams), JSON.stringify(agnosticParams));
    assert.equal(expectedParams.Status, agnosticParams.Status)
    assert.equal(expectedParams.Email, agnosticParams.Email)
    assert.equal(expectedParams.EmployeeId, agnosticParams.EmployeeId)
    assert.equal(expectedParams.Name, agnosticParams.Name)
    assert.equal(expectedParams.PendingMerge, agnosticParams.PendingMerge)
  })

  it('Generates a merge cql query with parameters for a node with connections', function () {
    var expectedQueryStr = 'CREATE(node:Card:Employee{Email:"konrad.aust@menome.com",EmployeeId:12345})ONCREATESETnode.Uuid=$newUuidSETnode+=$nodeParamsSETnode.TheLinkAddedDate=datetime()CREATE(node0:Card:Office{City:"Victoria"})ONCREATESETnode0.Uuid=$node0_newUuid,node0.PendingMerge=trueCREATE(node)-[node0_rel:LocatedInOffice]->(node0)SETnode0_rel+=$node0_relProps,node0+=$node0_nodeParamsCREATE(node1:Card:Project{Code:"5"})ONCREATESETnode1.Uuid=$node1_newUuid,node1.PendingMerge=trueCREATE(node)-[node1_rel:WorkedOnProject]->(node1)SETnode1_rel+=$node1_relProps,node1+=$node1_nodeParams;'
    var expectedParams = {
      node0_nodeParams: { City: 'Victoria', Name: 'Menome Victoria' },
      node1_nodeParams: { Code: '5', Name: 'theLink' },
      nodeParams: {
        Status: 'active',
        Email: 'konrad.aust@menome.com',
        EmployeeId: 12345,
        Name: 'Konrad Aust'
      }
    }

    var queryProps = { // If we don't encounter a node to merge with, this is our initial priority info.
      SourceSystems: ['TestSystem'],
      SourceSystemPriorities: [1],
      Properties: connectedMsg.Properties
    }

    var mergeQuery = mh.fuckThisCreateQuery(connectedMsg, queryProps)
    var actualQueryStr = mergeQuery.compile().replace(/\s/g, '')
    assert.equal(expectedQueryStr, actualQueryStr)
    var agnosticParams = mergeQuery.params()
    delete agnosticParams.newUuid
    delete agnosticParams.node0_newUuid
    delete agnosticParams.node1_newUuid
    assert.equal(JSON.stringify(expectedParams.node0_nodeParams), JSON.stringify(agnosticParams.node0_nodeParams))
    assert.equal(JSON.stringify(expectedParams.node1_nodeParams), JSON.stringify(agnosticParams.node1_nodeParams))
    assert.equal(expectedParams.nodeParams.Email, agnosticParams.nodeParams.Email)
    assert.equal(expectedParams.nodeParams.EmployeeId, agnosticParams.nodeParams.EmployeeId)
    assert.equal(expectedParams.nodeParams.Name, agnosticParams.nodeParams.Name)
  })
})
