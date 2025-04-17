import React, { useRef, useState, useLayoutEffect } from 'react';
import Textbox from './textbox.jsx';
import { useTaskContext } from './StateManager.jsx';
import { createPortal } from 'react-dom';

function Card({id, isplaceholder}) {
  const {
	selectTask,
	startEditing,
	isFieldEditing,
	isTaskEditing,
	updateTask,
	isTaskSelected,
	taskData,
	startDragging,
	dropped,
  } = useTaskContext();
  const {title, notes, deadline} = taskData[id];
  const isExpanded = isTaskEditing(id);
  const isSelected = isTaskSelected(id)

  const state = useRef('rest') // rest, dragging, settling
  const mouseDownPosRef = useRef({x: null, y: null, dragging: null});
  const [absPos, setAbsPos] = useState({x: null, y: null});

  const ref = useRef();
  const placeholderRef = useRef(null)

  const handleMouseDown = (e) => {
	if (!isExpanded) {
	  mouseDownPosRef.current = {x: e.clientX, y: e.clientY}
	  setAbsPos({x: 0, y: 0})
	  window.addEventListener('mousemove', handleMouseMove)
	  window.addEventListener('mouseup', handleMouseUp)
	}
  }

  const handleMouseMove = (e) => {
	const {x, y} = mouseDownPosRef.current;
	if (state.current === 'dragging') {
	  const {x: realx, y: realy} = placeholderRef.current.getBoundingClientRect()
	  setAbsPos({x: e.clientX - x + realx, y: e.clientY - y + realy})
	} else if (x !== null && y !== null) {
      const [dx, dy] = [e.clientX - x, e.clientY - y]
      const distance = Math.sqrt(dx * dx + dy * dy);

	  // bug: we need to do this because React doesn't update state fast enough for mouseMoves
	  if (distance > 1) {
		state.current = 'dragging';
		startDragging(id);
	  }
	}
  }

  const handleMouseUp = (e) => {
    if (state.current == 'dragging') {
	  dropped(id);
    }
	state.current = 'settling'
    mouseDownPosRef.current = {x: null, y: null};
	setAbsPos({x: null, y: null})
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // state can be either rest, dragging, or settling
  let style = {}
  if (state.current === 'dragging') {
	style = {
	  position: 'absolute',
	  top: 0,
	  left: 0,
	  transition: 'none',
	  zIndex: 1000,
	  transform: `translate(${absPos.x}px, ${absPos.y}px) rotate(3deg)`,
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

  const getHeight = () => {
	let height = ref.current?.getBoundingClientRect().height || 18
	if (state.current === 'dragging') {
	  // we rorate when we drag it
	  // height = (boundingHeight - sin(3deb) * 260) / cos(3deg)
	  // https://stackoverflow.com/a/54112751/13394797
	  height = (height - Math.sin(3*Math.PI/180) * 260) / Math.cos(3*Math.PI/180)
	}
	return height
  }

  const card = (
	<div 
	  ref={ref}
	  className={className} 
	  onClick={() => selectTask(id)} 
	  onDoubleClick={() => startEditing(id, 'title')}
	  onMouseDown={handleMouseDown}
	  style={style}>
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

  return (
	<>
	  {isplaceholder ? createPortal(card, document.body) : card}
	  {isplaceholder ? 
		<div 
		  ref={placeholderRef} 
		  className="rounded-lg shadow-sm w-260 bg-gray-200" 
		  style={{height: `${getHeight()}px`}}/> 
		: null}
	</>
  )
}

export default Card;

