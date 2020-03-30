# Neo4j On Demand Bot

> Like the Crony Bot but when you want it *RIGHT NOW*

This is a bot that lets you run queries whenever on a given graph database one task at a time.

Does not batch queries.

#### Example JSON Configuration:
```json
{
  "neo4j": {
    "url": "bolt://neo4j",
    "user": "neo4j",
    "pass": "swordfish"
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
Returns a list of queries with their queryId, description and any required queries.

##### Post:
```
/demand?=queryId
```
Body:
```
payload = {a : "foo", b = "bar"}
```
Runs the query specified with queryId. A query might have built in queryParams. They can be over written by proving a payload in the body of the request as a Json object.

It will error if query parameters are required but not specified.
