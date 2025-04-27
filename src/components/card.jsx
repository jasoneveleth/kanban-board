import Textbox from './textbox.jsx'
import { useTaskContext } from './StateManager.jsx'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
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
  const { title, notes, deadline } = task
  const isExpanded = isTaskEditing(id)
  const isSelected = isTaskSelected(id)

  const { dragState, getElementHeight, dragProps } = useDraggable({
    onDragEnd: () => dropped(id),
    isExpanded,
  })

  let className = clsx(
    'rounded-lg shadow-sm w-260 bg-white card select-none overflow-hidden',
    'hover:shadow-lg transition-shadow duration-200 ease-in-out',
    {
      'px-13 py-8 border-3 border-pink-300': isExpanded,
      'px-13 py-8 border-3 border-blue-400': !isExpanded && isSelected,
      'px-15 py-10 border border-gray-300': !isExpanded && !isSelected,
      'cursor-grabbing': dragState.current === 'dragging',
      'cursor-pointer': dragState.current !== 'dragging',
    },
  )

  const springTransition = {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  }
  const instantTransition = { duration: 0 }

  const cardContent = (
    <motion.div
      layoutId={`card-${id}`}
      transition={
        dragState.current !== 'dragging' ? springTransition : instantTransition
      }
      className={className}
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

  // this needs to be a function since we need to delay the call to getHeight()
  const shadow = () => {
    const opacity = dragState.current === 'settling' ? 'opacity-20' : ''
    return (
      <div
        className={`rounded-lg shadow-sm w-260 bg-gray-200 ${opacity}`}
        style={{ height: `${getElementHeight()}px` }}
      />
    )
  }

  const isDragging = dragState.current === 'dragging'
  const hasShadow = isDragging || dragState.current === 'settling'

  return (
    <div className="grid grid-cols-1 grid-rows-1">
      {hasShadow && (
        <div className="col-start-1 row-start-1 z-0">{shadow()}</div>
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
