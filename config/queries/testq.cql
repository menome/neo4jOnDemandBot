// Test Query
MERGE (m:TestNode {name: "derp"}) SET m.time = apoc.date.currentTimestamp() RETURN m;
