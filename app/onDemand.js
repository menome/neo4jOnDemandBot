/**
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Schedules queries using cron.
 */
'use strict'
var decypher = require('decypher/loader')
var util = require('util')

module.exports = function (bot) {
  var _tasks = []

  // This is like JSON.stringify, except property keys are printed without quotes around them
  // And we only include properties that are primitives.
  function buildObjectStr(obj) {
    var paramStrings = []

    for (var p in obj) {
      if (typeof obj[p] === 'object' || typeof obj[p] === 'function') continue
      else if (typeof obj[p] === 'string') paramStrings.push(util.format('%s: "%s"', p, obj[p]))
      else paramStrings.push(util.format('%s: %s', p, obj[p]))
    }

    return util.format('{%s}', paramStrings.join(','))
  }

  this.loadTasks = function (tasks) {
    bot.logger.info('Getting all queries in config')
    _tasks = tasks
  }

  // Get a list of our runnable tasks.
  this.getTasks = function () {
    var retVal = []

    _tasks.forEach((task) => {
      retVal.push({
        'queryId': task.queryId,
        'desc': task.desc,
        'queryParams': Object.keys(task.queryParams)
      })
    })

    return retVal
  }

  this.runTask = function (queryId, payload) {
    bot.changeState({ state: 'working' })
    bot.logger.info("processing query",{queryId:queryId})
    // find queryId in task list
    var task = _tasks.find(t => {
      if (t.queryId === queryId) {
        return t
      }
    })

    // couldn't find anything so reject
    if (typeof task !== 'object' && task === undefined) {
      return Promise.reject('Could not find query id')
    }

    var query = task.query
    var params = task.queryParams

    // only one task in a query file
    if (task.queryFile) {
      var taskQuery
      try {
        taskQuery = decypher('./config/queries/' + task.queryFile)
      } catch (err) {
        return Promise.reject(err)
      }
      query = taskQuery
      params = task.queryParams
    }

    if (typeof payload === 'object' && payload !== null) {
      params = payload
    }
    
    bot.logger.info("query request initiated",{queryId:queryId})

    return bot.neo4j.query(query, params)
  }

}
