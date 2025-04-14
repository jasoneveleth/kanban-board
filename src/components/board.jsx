import React, { useState } from 'react';
import Card from './card.jsx';
import { useTaskContext } from './StateManager.jsx';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function Board() {
  const {taskData, colNames, isTaskSelected, handleKeyDown} = useTaskContext();

  return (
	<div 
	  className="w-full h-full relative flex flex-row gap-20"
	  onKeyDown={handleKeyDown}>
	  {colNames.map((colName, index) => (
		<div key={index} className="flex flex-col gap-10">
		  <h2 className="font-semibold ml-5">{colName}</h2>
		  {Object.values(taskData).map((task) => task.col == index && (
			<Card
			  key={task.id}
			  id={task.id}
			  isSelected={isTaskSelected(task.id)}
			  title={task.title}
			  notes={task.notes}
			  deadline={task.deadline}
			/>
		  ))}
		  <h2 className="pl-20">+ Add Task</h2>
		</div>
	  ))}
	</div>
  )
}

export default Board;
