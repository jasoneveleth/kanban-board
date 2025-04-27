import { useRef, useState } from 'react'
import { useMotionValue } from 'framer-motion'

function useDraggable({ onDragStart, onDragEnd, onSettle, isExpanded }) {
  const dragState = useRef('rest') // rest, dragging, settling
  const mouseDownPosRef = useRef({ x: null, y: null })
  const [absPos, setAbsPos] = useState({ x: null, y: null })

  const ref = useRef()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(0)

  const getElementHeight = () => {
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
    if (dragState.current === 'dragging') {
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
        dragState.current = 'dragging'
        onDragStart && onDragStart(id)
      }
    }
  }

  const handleMouseUp = (e) => {
    if (dragState.current === 'dragging') {
      dragState.current = 'settling'

      x.set(0)
      y.set(0)
      rotate.set(0)
      onDragEnd && onDragEnd(e)
    }

    mouseDownPosRef.current = { x: null, y: null }
    setAbsPos({ x: null, y: null })
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  const handleAnimationComplete = () => {
    if (dragState.current == 'settling') {
      dragState.current = 'rest'
      onSettle && onSettle()
    }
  }

  return {
    dragState,
    getElementHeight,
    dragProps: {
      ref,
      onMouseDown: handleMouseDown,
      onLayoutAnimationComplete: handleAnimationComplete,
      style: {
        x,
        y,
        rotate,
        position: dragState.current === 'dragging' ? 'fixed' : 'relative',
        top: dragState.current === 'dragging' ? absPos.y : 'auto',
        left: dragState.current === 'dragging' ? absPos.x : 'auto',
        zIndex: dragState.current === 'dragging' ? 1000 : 'auto',
      },
    },
  }
}

export default useDraggable
