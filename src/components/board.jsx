import React, { useState } from 'react';
import Card from './card.jsx';
import { useTaskContext } from './StateManager.jsx';

function Board() {
  const {taskData, colState, handleKeyDown, dragging, createNewTask} = useTaskContext();
  const colNames = Object.keys(colState);

  const tasks = (colName) => {
	let taskList = colState[colName].map((id) => 
	  <Card 
		key={id} 
		id={id} 
		isplaceholder={id === dragging.id}/>
	)
	return taskList
  };

  const addTaskClicked = (name) => {
	createNewTask(name)
  }

  return (
	<div 
	  className="w-full h-full relative flex flex-row gap-20"
	  onKeyDown={handleKeyDown}>
	  {colNames.map((name) => (
		<div key={name} className="flex flex-col gap-10 w-260">
		  <h2 className="font-semibold ml-5">{name}</h2>
		  {tasks(name)}
		  <h2 onClick={() => addTaskClicked(name)} className="pl-20">+ Add Task</h2>
		</div>
	  ))}
	</div>
  )
}

export default Board;
