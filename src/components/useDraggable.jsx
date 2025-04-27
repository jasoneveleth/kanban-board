import { useRef, useState, useEffect } from 'react'
import { useMotionValue } from 'framer-motion'
import { useTaskContext } from './StateManager.jsx'

function useDraggable({ id, onDragEnd, isExpanded }) {
  const { startDragging } = useTaskContext()
  const elementRef = useRef(null)
  const dragState = useRef('rest') // rest, dragging, settling
  const mouseDownPosRef = useRef({ x: null, y: null })
  const [absPos, setAbsPos] = useState({ x: null, y: null })

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(0)

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const getElementHeight = () => {
    if (!elementRef.current) return 18
    let height = elementRef.current.getBoundingClientRect().height || 18

    if (
      elementRef.current.style.transform &&
      elementRef.current.style.transform.includes('rotate(3deg)')
    ) {
      const threeDeg = (3 * Math.PI) / 180
      height = (height - Math.sin(threeDeg) * 260) / Math.cos(threeDeg)
    }
    return height
  }

  const handleMouseDown = (e) => {
    if (!isExpanded) {
      mouseDownPosRef.current = { x: e.clientX, y: e.clientY }

      if (elementRef.current) {
        const { x: rectX, y: rectY } =
          elementRef.current.getBoundingClientRect()
        setAbsPos({ x: rectX, y: rectY })
      }

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
        startDragging(id)
      }
    }
  }

  const handleMouseUp = (e) => {
    if (dragState.current === 'dragging') {
      dragState.current = 'settling'
      x.set(0)
      y.set(0)
      rotate.set(0)
      onDragEnd && onDragEnd()
    }

    mouseDownPosRef.current = { x: null, y: null }
    setAbsPos({ x: null, y: null })
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  const handleAnimationComplete = () => {
    if (dragState.current === 'settling') {
      dragState.current = 'rest'
    }
  }

  return {
    elementRef,
    dragState,
    getElementHeight,
    dragProps: {
      onLayoutAnimationComplete: handleAnimationComplete,
      onMouseDown: handleMouseDown,
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
    isDragging: dragState.current === 'dragging',
    isSettling: dragState.current === 'settling',
  }
}

export default useDraggable
