import React, { useRef, useState, useLayoutEffect } from 'react';
import Textbox from './textbox.jsx';
import { useTaskContext } from './StateManager.jsx';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
  const mouseDownPosRef = useRef({x: null, y: null});
  const [absPos, setAbsPos] = useState({x: null, y: null});

  const ref = useRef();
  const placeholderRef = useRef(null)

  const handleMouseDown = (e) => {
	if (!isExpanded) {
	  mouseDownPosRef.current = {x: e.clientX, y: e.clientY}
	  const {x, y} = ref.current.getBoundingClientRect()
	  setAbsPos({x, y})
	  window.addEventListener('mousemove', handleMouseMove)
	  window.addEventListener('mouseup', handleMouseUp)
	}
  }

  const handleMouseMove = (e) => {
	if (state.current === 'dragging') {
	  const {x, y} = mouseDownPosRef.current;
	  const {x: realx, y: realy} = placeholderRef.current.getBoundingClientRect()
	  setAbsPos({x: e.clientX - x + realx, y: e.clientY - y + realy})
	} else {
      const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
      const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 1) {
        state.current = 'dragging'
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

  let classNameList = ["rounded-lg shadow-sm w-260 bg-white card select-none hover:shadow-md transition-shadow duration-200 ease-in-out"]
  if (isExpanded) {
	classNameList.push("px-13 py-8 border-3 border-pink-300")
  } else if (isSelected) {
	classNameList.push("px-13 py-8 border-3 border-blue-400")
  } else {
	classNameList.push("px-15 py-10 border border-gray-300")
  }

  if (state.current === 'dragging') {
	classNameList.push("cursor-grabbing")
  } else {
	classNameList.push("cursor-pointer")
  }
  const className = classNameList.join(' ')

  const getHeight = () => {
	let height = ref.current.getBoundingClientRect().height || 18
	if (ref.current.style.transform.includes('rotate(3deg)')) {
	  const threeDeg = 3 * Math.PI / 180
	  // height = (boundingHeight - sin(3deb) * 260) / cos(3deg)
	  // https://stackoverflow.com/a/54112751/13394797
	  height = (height - Math.sin(threeDeg) * 260) / Math.cos(threeDeg)
	}
	return height
  }

  const cardContent = (
	<div
	  ref={ref}
	  className={className} 
	  onClick={() => selectTask(id)} 
	  onDoubleClick={() => startEditing(id, 'title')}
	  onMouseDown={handleMouseDown}
	  style={style}>
	  {/* Regular div for title to prevent layout animation */}
	  <div>
		<Textbox 
		  value={title} 
		  placeholder="New Task" 
		  acceptingClicks={isExpanded}
		  isEditing={isFieldEditing(id, 'title')} 
		  onChange={(x) => updateTask(id, 'title', x)}
          onClick={() => startEditing(id, 'title')}
		  cursorStyle={isExpanded ? 'text' : 'pointer'}/>
	  </div>

	  <AnimatePresence>
		{isExpanded && (
		  <motion.div
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			exit={{ opacity: 0, height: 0 }}
			transition={{ duration: 0.075 }}
		  >
			<Textbox 
			  value={notes}
			  placeholder="Notes" 
			  minHeight={54}
			  acceptingClicks={isExpanded}
			  isEditing={isFieldEditing(id, 'notes')}
			  onChange={(x) => updateTask(id, 'notes', x)}
              onClick={() => startEditing(id, 'notes')}
			  cursorStyle={isExpanded ? 'text' : 'pointer'}/>
		  </motion.div>
		)}
	  </AnimatePresence>
	</div>
  )

  return (
	<>
	  {isplaceholder ? createPortal(cardContent, document.body) : cardContent}
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
