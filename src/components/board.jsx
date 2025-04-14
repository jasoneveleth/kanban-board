import React, { useState } from 'react';
import Card from './card.jsx';
import { useTaskContext } from './StateManager.jsx';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function Board() {
  const {taskData, colNames, isTaskSelected} = useTaskContext();
  const handleKey = (e) => {
	if (e.key === 'Escape') {
	  setIsEditing({taskId: null, field: null});
	} else if (e.key === 'Enter') {
	  setIsEditing({taskId: selectedTaskId, field: 'title'});
	}
  }

  return (
	<div 
	  className="w-full h-full relative"
	  onKeyDown={handleKey}>
	  {colNames.map((colName, index) => (
		<div key={index} className="col">
		  <h2>{colName}</h2>
		</div>
	  ))}
	  {Object.values(taskData).map((task) => (
		<Card
		  key={task.id}
		  id={task.id}
		  isSelected={isTaskSelected(task.id)}
		  title={task.title}
		  notes={task.notes}
		  deadline={task.deadline}
		/>
	  ))}
	</div>
  )
}

export default Board;
