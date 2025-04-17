import React, { useRef, useLayoutEffect } from 'react';
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
	moved,
  } = useTaskContext();
  const {title, notes, deadline} = taskData[id];
  const isExpanded = isTaskEditing(id);
  const isSelected = isTaskSelected(id)

  const mouseDownPosRef = useRef({x: null, y: null, dragging: null});
  const absPosRef = useRef({x: null, y: null});

  const ref = useRef();
  const rectRef = useRef();

  // cache the bounding rects of cards
  useLayoutEffect(() => {
    const { width, height } = ref.current.getBoundingClientRect();
	rectRef.current = { width, height };
  }, []);

  const handleMouseDown = (e) => {
	if (!isExpanded) {
	  mouseDownPosRef.current = {x: e.clientX, y: e.clientY, dragging: false}
	  window.addEventListener('mousemove', handleMouseMove)
	  window.addEventListener('mouseup', handleMouseUp)
	}
  }

  const handleMouseMove = (e) => {
	const {x, y, dragging} = mouseDownPosRef.current;
	if (dragging) {
	  absPosRef.current = {x: e.clientX, y: e.clientY};
	} else if (x !== null && y !== null) {
      const [dx, dy] = [e.clientX - x, e.clientY - y]
      const distance = Math.sqrt(dx * dx + dy * dy);
	  const height = e.target.getBoundingClientRect().height;

	  // bug: we need to do this because React doesn't update state fast enough for mouseMoves
	  if (distance > 1) {
		mouseDownPosRef.current.dragging = true
		startDragging(id, height);
	  }
	}
  }

  const handleMouseUp = (e) => {
    if (mouseDownPosRef.current.dragging) {
	  dropped(id, { clientX: e.clientX, clientY: e.clientY });
    }
    mouseDownPosRef.current = null;
	absPosRef.current = null
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);

  };

  const {x, y, dragging} = mouseDownPosRef.current;
  // state can be either rest, dragging, or settling
  let style = {}
  if (dragging) {
	const {x: absX, y: absY} = absPosRef.current;
	style = {
	  position: 'absolute',
	  top: 0,
	  left: 0,
	  transition: 'none',
	  zIndex: 1000,
	  transform: `translate(${absX - x}px, ${absY - y}px, 3deg)`,
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

  const placeholder = (
	<div className="rounded-lg shadow-sm w-260 bg-gray-200" style={{height: `${rectRef.current?.height || 18}px`}}/>
  )

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
	  {isplaceholder ? placeholder : card}
	  {isplaceholder ? createPortal(card, document.body) : null}
	</>
  )
}

export default Card;

