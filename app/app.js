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
bot.registerControllers(path.join(__dirname + '/controllers'))

bot.web.use((req, res, next) => {
  req.on = on
  next()
})

//TODO: this would be nice as a "hey there is an object in your payload, it ain't going in the graph cuz kablooey."
var thinger = function (message) {
  //TODO: feel like we shouldn't HAVE to stringify this json array...
  bot.logger.info("processing a message")
  for (var row of message.payload) {    
    //bot.logger.info("whut",{payload:row})
    row["VDM_HashBytesKey"] = "ObjectRemovedDuringImport"
    // for (var prop in row){
    //   if(prop == "VDM_HashBytesKey"){
    //     bot.logger.info("whut",{prop:prop})
    //     prop = ""
    //   }
    // }    
  }  
  var newLoad = JSON.stringify(message.payload)    
  return on.runTask(message.sourceId, { payload: newLoad }).then((s)=>bot.logger.info("message done processing"))
}

bot.rabbit.addListener('demandedQueue', thinger, "bulkLoadMessage");

// Start the bot
// #############
bot.start()
bot.changeState({ state: 'idle' })
