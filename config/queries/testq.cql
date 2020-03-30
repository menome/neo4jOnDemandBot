// name: Test Query
MERGE (m:TestNode {name: "derp"}) SET m.time = apoc.date.currentTimestamp(),m.op=1,m.password=$password,m.email=$username RETURN m
