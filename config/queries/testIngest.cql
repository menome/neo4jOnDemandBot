// name: Query a Horseman and receive Famine, War, Pestilence and DEATH for your trouble!
WITH apoc.convert.fromJsonList($payload) as value
UNWIND value as row
MERGE (:TestNode {COL_A: row.COL_A, COL_B: row.COL_B}) 
