import React, { useState } from 'react';
import Textbox from './textbox.jsx';
import { useTaskContext } from './StateManager.jsx';

function Card({id}) {
  const {
	selectTask,
	startEditing,
	isFieldEditing,
	isTaskEditing,
	updateTask,
	isTaskSelected,
	taskData,
	animState,
  } = useTaskContext();
  const {title, notes, deadline, state} = taskData[id];
  const isExpanded = isTaskEditing(id);
  const isSelected = isTaskSelected(id)

  let className = "";
  let shared = "rounded-lg shadow-sm w-260 bg-white cursor-pointer card select-none";
  if (isExpanded) {
    className = "px-13 py-8 border-3 border-pink-300 " + shared;
  } else if (isSelected) {
    className = "px-13 py-8 border-3 border-blue-400 " + shared;
  } else {
	className = "px-15 py-10 border border-gray-300 " + shared
  }

  return (
	<div 
	  className={className} 
	  onClick={() => selectTask(id)} 
	  onDoubleClick={() => startEditing(id, 'title')}>
	  <Textbox 
		value={title} 
		placeholder="New Task" 
		acceptingClicks={isExpanded}
		isEditing={isFieldEditing(id, 'title')} 
		onChange={(x) => updateTask(id, 'title', x)}
	    cursorStyle={isExpanded ? 'text' : 'pointer'}/>
	  {isExpanded ? (
	  <Textbox 
		value={notes}
		placeholder="Notes" 
		height={54}
		acceptingClicks={isExpanded}
		isEditing={isFieldEditing(id, 'notes')}
		onChange={(x) => updateTask(id, 'notes', x)}
	    cursorStyle={isExpanded ? 'text' : 'pointer'}/>
	  ) : null}
	</div>
  )
}

export default Card;
