var helpers = require('@menome/botframework/helpers')

module.exports.swaggerDef = {
  '/demand': {
    'x-swagger-router-controller': 'demand',
    'post': {
      'summary': 'On demand Neo4j Query Task Running',
      'description': 'do the queries when you want',
      'parameters': [
        {
          'name': 'queryId',
          'in': 'query',
          'required': true,
          'description': 'query name to call',
          'type': 'string'
        },
        {
          'name': 'payload',
          'in': 'body',
          'description': 'Potential payload of the query',          
          'schema': {
            'type': 'object',
            'properties': {
              'payload': {
                'type': 'object'
              }
            }
          }
        }],
      'responses': {
        '200': {
          'description': 'Success! Query started.'
        },
        'default': {
          'description': 'Error'
        }
      }
    },
    'get': {
      'description': 'Gets a list of configured tasks.',
      'tags': [
        'Tasks'
      ],
      'responses': {
        '200': {
          'description': 'Success'
        },
        'default': {
          'description': 'Error'
        }
      }
    }
  }  
}

module.exports.post = function (req, res) {
  var queryId = req.swagger.params.queryId.value
  var payload = req.swagger.params.payload.value

  req.bot.logger.info('Starting query: ', req.swagger.params.queryId.value)

  return req.on.runTask(queryId, payload).then((success) => {
    res.send(
        helpers.responseWrapper({
          status: 'success',
          message: 'Query completed'
        })
      )
  }).catch((error) => {
    console.log(error)
    res.send(
        helpers.responseWrapper({
          status: 'failure',
          message: error
        })
      )
  })
}

module.exports.get = function (req, res) {
  var taskDef = req.on.getTasks()

  res.send(helpers.responseWrapper({
    status: 'success',
    message: 'Retrieved List of Jobs',
    data: taskDef
  })
  )
}

