```
o.     O                          
Oo     o             o   O    O    _____        ______                               _ 
O O    O             O   o        |  _  |       |  _  \                             | |
O  o   o             o   o        | | | |_ __   | | | |___ _ __ ___   __ _ _ __   __| |
O   o  O .oOo. .oOo. OooOOo  'o   | | | | '_ \  | | | / _ \ '_ ` _ \ / _` | '_ \ / _` |
o    O O OooO' O   o     O    O   \ \_/ / | | | | |/ /  __/ | | | | | (_| | | | | (_| |
o     Oo O     o   O     o    o    \___/|_| |_| |___/ \___|_| |_| |_|\__,_|_| |_|\__,_|
O     `o `OoO' `OoO'     O    O   
                              o                        _|_|_|                _|      
                            oO'                        _|    _|    _|_|    _|_|_|_|  
                                                       _|_|_|    _|    _|    _|       
                                                       _|    _|  _|    _|    _|         
                                                       _|_|_|      _|_|        _|_|              
```
# Neo4j On Demand Bot

> Like the Crony Bot but when you want it *RIGHT NOW*

This is a bot that lets you run queries whenever on a given graph database one task at a time.
and... now it also listens to rabbit for bulk sql events... maybe this functionality should move.. or we should rename it... ourNeo4jLoadMasterBlaster. 

Does not batch queries.

#### Example JSON Configuration:
```json
{
  "neo4j": {
    "url": "bolt://neo4j",
    "user": "neo4j",
    "pass": "swordfish"
  },
  "rabbit": {
    "enable": true,
    "url": "amqp://rabbitmq:CodaGlenBaronyMonk@localhost:5672?heartbeat=3600",
    "routingKey": "syncevents.bulk.*",
    "exchange": "syncevents",
    "exchangeType": "topic",
    "prefetch": 18
  },
  "tasks": [
    {
      "queryId": "titleCaseConverter",
      "name": "Title Case Converter",
      "desc": "Makes sure all Name properties on Cards begin with an uppercase letter.",
      "query": "MATCH (c:Card) WHERE c.Name =~ $nameregex WITH c, left(c.Name, 1) as firstLetter, right(c.Name, length(c.Name)-1) as rest SET c.Name = (toUpper(firstLetter) + rest) RETURN c",
      "queryParams": {
        "nameregex": "^[a-z]+"
      }
    },
    {
      "queryId": "testQuery",
      "name": "Test Query",
      "desc": "ASDF",
      "queryFile": "testq.cql",
      "queryParams": {
        "nameregex": "^[a-z]+"
      }
    }
  ]
}
```

Of the above, name, desc, and query and queryId are required properties. If a query requires queryParams then they are also required else the query will throw an error.

#### SWAGGER Calls

##### Get:
```
/demand
```
Returns a list of queries with their queryId, description and any required query parameters.

##### Post:
```
/demand?=queryId
```
Body:
```
payload = {a : "foo", b = "bar"}
```
Runs the query specified with queryId. A query might have built in queryParams. They can be over written by providing a payload in the body of the request as a Json object.

It will error if query parameters are required but not specified.


# NOTE:
decypher supports multiple queries in a file, putting a comment like "//name: AQueryName"
putting this above your cypher will result in returning an object map of the queries in your file, and this currently breaks the method. So.. one per file. no fancy name. We should fix that. TODO. TechDebt?

