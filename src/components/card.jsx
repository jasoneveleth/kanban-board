import React from 'react'
import Textbox from './textbox.jsx'
import { useTaskContext } from './StateManager.jsx'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useDraggable from './useDraggable.jsx'
import clsx from 'clsx'

function Card({ id }) {
  const {
    selectTask,
    startEditing,
    isFieldEditing,
    isTaskEditing,
    updateTask,
    isTaskSelected,
    taskData,
    dropped,
  } = useTaskContext()

  const task = taskData[id]
  if (!task) {
    return null
  }

  const { title, notes } = task
  const [isExpanded, isSelected] = [isTaskEditing(id), isTaskSelected(id)]

  const { elementRef, getElementHeight, dragProps, isDragging, isSettling } =
    useDraggable({
      id,
      onDragEnd: () => dropped(id),
      isExpanded,
    })

  const className = clsx(
    'rounded-lg shadow-sm w-260 bg-white card select-none overflow-hidden',
    'hover:shadow-lg transition-shadow duration-200 ease-in-out',
    {
      'px-13 py-8 border-3 border-pink-300': isExpanded,
      'px-13 py-8 border-3 border-blue-400': !isExpanded && isSelected,
      'px-15 py-10 border border-gray-300': !isExpanded && !isSelected,
      'cursor-grabbing': isDragging,
      'cursor-pointer': !isDragging,
    },
  )

  const springTransition = {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  }

  const instantTransition = {
    duration: 0,
  }

  const cardContent = (
    <motion.div
      layoutId={`card-${id}`}
      transition={isDragging ? instantTransition : springTransition}
      className={className}
      ref={elementRef}
      onClick={() => selectTask(id)}
      onDoubleClick={() => startEditing(id, 'title')}
      {...dragProps}>
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

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.08 }}>
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  const shadowElement = () => {
    const opacity = isSettling ? 'opacity-20' : ''
    return (
      <div
        className={`rounded-lg shadow-sm w-260 bg-gray-200 ${opacity}`}
        style={{ height: `${getElementHeight()}px` }}
      />
    )
  }

  const hasShadow = isDragging || isSettling

  return (
    <div className="grid grid-cols-1 grid-rows-1">
      {hasShadow && (
        <div className="col-start-1 row-start-1 z-0">{shadowElement()}</div>
      )}

      {isDragging ? (
        createPortal(cardContent, document.body)
      ) : (
        <div className="col-start-1 row-start-1 z-10">{cardContent}</div>
      )}
    </div>
  )
}

export default Card
