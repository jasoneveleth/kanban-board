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
  const {title, notes, deadline} = taskData[id];
  const {state, pos} = animState[id];
  const isExpanded = isTaskEditing(id);
  const isSelected = isTaskSelected(id)

  // state can be either rest, dragging, or moving
  let style = {}
  if (state === 'dragging') {
	style = {
	  position: 'absolute',
	  top: 0,
	  left: 0,
	  transition: 'none',
	  transform: `translate(${pos.x}px, ${pos.y}px, 3deg)`,
	}
  }

  let className = "rounded-lg shadow-sm w-260 bg-white cursor-pointer card select-none";
  if (isExpanded) {
    className = className + " px-13 py-8 border-3 border-pink-300"
  } else if (isSelected) {
    className = className + " px-13 py-8 border-3 border-blue-400"
  } else {
	className = className + " px-15 py-10 border border-gray-300"
  }

  return (
	<div 
	  className={className} 
	  onClick={() => selectTask(id)} 
	  onDoubleClick={() => startEditing(id, 'title')}
	  {...style}>
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
