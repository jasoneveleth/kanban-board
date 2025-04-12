import React, { useState } from 'react';
import Textbox from './textbox.jsx';

function Card({isSelected, title, notes, deadline, handlers}) {
  if (!handlers) {
		handlers = [() => {}, () => {}, () => {}];
  }
  const [onDoubleClick, onClick, onChange] = handlers;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  let shared = "rounded-lg shadow-sm w-full bg-white cursor-pointer select-none card";
  
  let className = "";
  if (isSelected) {
    className = "px-3 py-2 border-3 border-blue-400 " + shared;
  } else if (isEditingTitle || isEditingNotes) {
    className = "px-3 py-2 border-3 border-pink-300 " + shared;
  } else {
	className = "px-4 py-2.5 border border-gray-300 " + shared
  }

  return (
	<div className={className} onDoubleClick={() => setIsEditingTitle(true)}>
	  <Textbox 
		value={title} 
		placeholder="New Task" 
		isEditing={isEditingTitle} 
		minHeight={20}
	    cursorStyle={isEditingTitle ? 'text' : 'pointer'}/>
	  {isEditingTitle || isEditingNotes ? (
	  <Textbox 
		onDoubleClick={() => setIsEditingNotes(true)} 
		onChange={onChange} 
		value={notes}
		placeholder="Notes" 
		minHeight={60}
		isEditing={isEditingNotes}
	    cursorStyle={isEditingNotes ? 'text' : 'pointer'}/>)
		: null}
	</div>
  )
}

export default Card;
