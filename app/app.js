/**
 * Copyright (C) 2020 Menome Technologies Inc.
 *
 * "US State Cannabis Regulation Web Crawlers"
 */
'use strict'
const Bot = require('@menome/botframework')
const configSchema = require('./config')
const config = require('../config/config.json')
const path = require('path')
const OnDemand = require('./onDemand')
// Start the actual bot here.
var bot = new Bot({
  config: {
    'name': 'On Demand Neo4j Query Task Runner',
    'desc': '.',
    ...config
  },
  configSchema
})
// Initialize our local gensim copy
// ################################
var on = new OnDemand(bot)
on.loadTasks(bot.config.get('tasks'))

// Set up controllers
// ##################
// Let our middleware use these.
// bot.registerControllers(path.join(__dirname + '/controllers'))

// bot.web.use((req, res, next) => {
//   req.on = on
//   next()
// })

var thinger = function (message){
  var newLoad = JSON.stringify(message.payload)
  bot.logger.info(newLoad)
 return on.runTask(message.sourceId,{payload:newLoad})
}

bot.rabbit.addListener('demandedQueue',thinger,"bulkLoadMessage");

// Start the bot
// #############
bot.start()
bot.changeState({state: 'idle'})
