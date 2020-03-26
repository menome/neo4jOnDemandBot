var helpers = require('@menome/botframework/helpers')

module.exports.swaggerDef = {
  '/query': {
    'x-swagger-router-controller': 'query',
    'post': {
      'summary': 'Get latest US State Cannabis Regulations',
      'description': 'Get latest US State Cannabis Regulations and put them in a graph',
      'parameters': [{
        'name': 'query',
        'in': 'body',
        'description': 'The CQL query ID  and payload',
        'required': true,
        'schema': {
          'type': 'object',
          'properties': {
            'queryId': {
              'type': 'string'
            },
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
    }
  }
}

module.exports.post = function (req, res) {
  var state = req.swagger.params.state.value
  if (['oregon', 'washington', 'colorado'].indexOf(state) == -1) {
    return res.send(
      helpers.responseWrapper({
        status: 'failure',
        message: 'This state doesnt exist'
      })
    )
  } else {
    req.bot.logger.info(req.swagger.params.state.value)
    res.send(
      helpers.responseWrapper({
        status: 'success',
        message: 'Starting harvest'
      })
    )
    return req.sw.harvestState(state)
  }
}
