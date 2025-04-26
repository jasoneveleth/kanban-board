import React, { useRef, useState, useLayoutEffect } from 'react'
import Textbox from './textbox.jsx'
import { useTaskContext } from './StateManager.jsx'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'

function Card({ id, isplaceholder }) {
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
  } = useTaskContext()

  const task = taskData[id]
  if (!task) {
    return null
  }
  const { title, notes, deadline } = task
  const isExpanded = isTaskEditing(id)
  const isSelected = isTaskSelected(id)

  const state = useRef('rest') // rest, dragging, settling
  const mouseDownPosRef = useRef({ x: null, y: null })
  const [absPos, setAbsPos] = useState({ x: null, y: null })

  const ref = useRef()
  const placeholderRef = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(0)

  const handleMouseDown = (e) => {
    if (!isExpanded) {
      mouseDownPosRef.current = { x: e.clientX, y: e.clientY }
      const { x: rectX, y: rectY } = ref.current.getBoundingClientRect()
      setAbsPos({ x: rectX, y: rectY })
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
  }

  const handleMouseMove = (e) => {
    if (state.current === 'dragging') {
      const { x: startX, y: startY } = mouseDownPosRef.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY

      x.set(dx)
      y.set(dy)
      rotate.set(3) // 3 degree rotation during drag
    } else {
      const dx = Math.abs(e.clientX - mouseDownPosRef.current.x)
      const dy = Math.abs(e.clientY - mouseDownPosRef.current.y)
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance > 1) {
        state.current = 'dragging'
        startDragging(id)
      }
    }
  }

  const handleMouseUp = (e) => {
    if (state.current === 'dragging') {
      dropped(id)
      // Reset motion values with animation
      x.set(0)
      y.set(0)
      rotate.set(0)
    }
    state.current = 'settling'
    mouseDownPosRef.current = { x: null, y: null }
    setAbsPos({ x: null, y: null })
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  let classNameList = [
    'rounded-lg shadow-sm w-260 bg-white card select-none hover:shadow-md transition-shadow duration-200 ease-in-out',
  ]
  if (isExpanded) {
    classNameList.push('px-13 py-8 border-3 border-pink-300')
  } else if (isSelected) {
    classNameList.push('px-13 py-8 border-3 border-blue-400')
  } else {
    classNameList.push('px-15 py-10 border border-gray-300')
  }

  if (state.current === 'dragging') {
    classNameList.push('cursor-grabbing')
  } else {
    classNameList.push('cursor-pointer')
  }
  const className = classNameList.join(' ')

  const getHeight = () => {
    if (!ref.current) return 18
    let height = ref.current.getBoundingClientRect().height || 18
    if (
      ref.current.style.transform &&
      ref.current.style.transform.includes('rotate(3deg)')
    ) {
      const threeDeg = (3 * Math.PI) / 180
      height = (height - Math.sin(threeDeg) * 260) / Math.cos(threeDeg)
    }
    return height
  }

  const springTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  }

  const instantTransition = {
    duration: 0,
  }

  const cardContent = (
    <motion.div
      layoutId={`card-${id}`}
      transition={
        state.current !== 'dragging' ? springTransition : instantTransition
      }
      ref={ref}
      className={className}
      onClick={() => selectTask(id)}
      onDoubleClick={() => startEditing(id, 'title')}
      onMouseDown={handleMouseDown}
      style={{
        x,
        y,
        rotate,
        position: state.current === 'dragging' ? 'fixed' : 'relative',
        top: state.current === 'dragging' ? absPos.y : 'auto',
        left: state.current === 'dragging' ? absPos.x : 'auto',
        zIndex: state.current === 'dragging' ? 1000 : 'auto',
      }}
    >
      {/* Regular div for title to prevent layout animation */}
      <div>
        <Textbox
          value={title}
          placeholder="New Task"
          acceptingClicks={isExpanded}
          isEditing={isFieldEditing(id, 'title')}
          onChange={(x) => updateTask(id, 'title', x)}
          onClick={() => startEditing(id, 'title')}
          cursorStyle={isExpanded ? 'text' : 'pointer'}
        />
      </div>

      {isExpanded && (
        <>
          <div className="h-9" />
          <Textbox
            value={notes}
            placeholder="Notes"
            minHeight={54}
            acceptingClicks={isExpanded}
            isEditing={isFieldEditing(id, 'notes')}
            onChange={(x) => updateTask(id, 'notes', x)}
            onClick={() => startEditing(id, 'notes')}
            cursorStyle={isExpanded ? 'text' : 'pointer'}
          />
        </>
      )}
    </motion.div>
  )

  const shadow = () => (
    <div
      ref={placeholderRef}
      className="rounded-lg shadow-sm w-260 bg-gray-200"
      style={{ height: `${getHeight()}px` }}
    />
  )

  return (
    <>
      {isplaceholder ? createPortal(cardContent, document.body) : cardContent}
      {isplaceholder ? shadow() : null}
    </>
  )
}

export default Card
