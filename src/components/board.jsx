import React, { useState } from 'react';
import Card from './card.jsx';

function Board() {
  const [taskData, setTaskData] = useState({
	"task1": {
	  id: "task1",
	  title: "Task 1",
	  notes: "Notes for Task 1",
	  deadline: null,
	  startDate: null,
	  col: 0,
	},
	"task2": {
	  id: "task2",
	  title: "",
	  notes: "",
	  deadline: null,
	  startDate: null,
	  col: 0,
	}
  })
  const [colNames, setColNames] = useState(["Plan", "Doing", "Review", "Done"]);
  return (
	<div className="w-full h-full relative">
	  {colNames.map((colName, index) => (
		<div key={index} className="col">
		  <h2>{colName}</h2>
		</div>
	  ))}
	  {Object.values(taskData).map((task) => (
		<Card
		  key={task.id}
		  title={task.title}
		  notes={task.notes}
		  deadline={task.deadline}
		/>
	  ))}
	</div>
  )
}

export default Board;
