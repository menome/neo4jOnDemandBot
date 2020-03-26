/**
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Schedules queries using cron.
 */
'use strict'
var cron = require('cron')
var decypher = require('decypher/loader')
var logger = require('./logger')

module.exports = function (bot) {
  // Keep our running jobs in here.
  var runningJobs = 0
  var _jobs = []
  var _tasks = []

  function runTask (task) {
    bot.changeState({state: 'working'})
    if (task.queryFile) {
      var taskQueries
      try {
        taskQueries = decypher('./config/queries/' + task.queryFile)
      } catch (err) {
        return Promise.reject(err)
      }

      var queryList = []
      var paramList = []

      // Put all the queries into a list for batch execution.
      var keys = Object.keys(taskQueries)
      for (var i = 0; i < keys.length; i++) {
        queryList.push(taskQueries[keys[i]])
        paramList.push(task.queryParams)
      }
      // if(paramList){
      //   bot.logger.info("Running queries:", queryList, paramList);
      // }else{
      //   bot.logger.info("Running Queries:",queryList);
      // }

      // Run them all in the same session.
      return bot.neo4j.batchQuery(queryList, paramList)
    }

    return bot.neo4j.query(task.query, task.queryParams)
  }
}
