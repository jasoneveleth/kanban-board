import React, { useState } from 'react';
import Card from './card.jsx';
import { useTaskContext } from './StateManager.jsx';

function Board() {
  const {taskData, colState, handleKeyDown} = useTaskContext();
  const colNames = Object.keys(colState)
  const tasks = (colName) => {
	return colState[colName].map((taskId) => taskData[taskId])
  }

  return (
	<div 
	  className="w-full h-full relative flex flex-row gap-20"
	  onKeyDown={handleKeyDown}>
	  {colNames.map((name) => (
		<div key={name} className="flex flex-col gap-10">
		  <h2 className="font-semibold ml-5">{name}</h2>
		  {tasks(name).map((task) => (
			<Card
			  key={task.id}
			  id={task.id}
			/>
		  ))}
		  <h2 className="pl-20">+ Add Task</h2>
		</div>
	  ))}
	</div>
  )
}

export default Board;
