import React, { useState } from 'react';
import Textbox from './textbox.jsx';

function Card({isSelected, title, notes, deadline, handlers, editingInfo}) {
  if (!handlers) {
		handlers = [() => {}, () => {}, () => {}];
  }
  const [onDoubleClick, onClick, onChange] = handlers;

  const isEditingTitle = editingInfo && editingInfo.field === 'title';
  const isEditingNotes = editingInfo && editingInfo.field === 'notes';

  const isEditing = isEditingTitle || isEditingNotes;

  let shared = "rounded-lg shadow-sm w-260 bg-white cursor-pointer select-none card";
  
  let className = "";
  if (isEditing) {
    className = "px-13 py-8 border-3 border-pink-300 " + shared;
  } else if (isSelected) {
    className = "px-13 py-8 border-3 border-blue-400 " + shared;
  } else {
	className = "px-15 py-10 border border-gray-300 " + shared
  }

  return (
	<div 
	  className={className} 
	  onClick={() => { if (!isEditing) {onClick()}}} 
	  onDoubleClick={() => {if (!isEditing) {onDoubleClick('title')}}}>
	  <Textbox 
		value={title} 
		placeholder="New Task" 
		isEditing={isEditingTitle} 
		minHeight={18}
		onChange={onChange} 
	    cursorStyle={isEditing ? 'text' : 'pointer'}
		onDoubleClick={(e) => {
			e.stopPropagation();
			if (!isEditing) {
			  onDoubleClick('title');
			}
		  }}
		onClick={(e) => {
			e.stopPropagation();
			if (!isEditing) {
			  onClick();
			}
		  }}/>

	  {isEditing ? (
	  <Textbox 
		onChange={onChange} 
		value={notes}
		placeholder="Notes" 
		minHeight={54}
		isEditing={isEditingNotes}
	    cursorStyle={isEditing ? 'text' : 'pointer'}
		onDoubleClick={(e) => {
			e.stopPropagation();
			if (!isEditing) {
			  onDoubleClick('title');
			}
		  }}
		onClick={(e) => {
			e.stopPropagation();
			if (!isEditing) {
			  onClick();
			}
		  }}/>
	  ) : null}
	</div>
  )
}

export default Card;
