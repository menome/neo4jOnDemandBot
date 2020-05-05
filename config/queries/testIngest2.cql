// name: Query a Horseman and receive Famine, War, Pestilence and DEATH for your trouble!
WITH apoc.convert.fromJsonList($payload) as value
UNWIND value as row
MERGE (:TestNode {PROP_A: row.PROP_A, PROP_B: row.PROP_B}) 
