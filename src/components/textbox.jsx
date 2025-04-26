import { useState, useRef, useEffect } from 'react'

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const lineHeight = 18 // px

function TextBox({
  onChange,
  onClick,
  value,
  placeholder,
  isEditing,
  minHeight = 18,
  cursorStyle,
  acceptingClicks,
}) {
  const [caretPos, setCaretPos] = useState({
    left: 0,
    top: 0,
    height: 0,
    onScreen: false,
  })
  const [height, setHeight] = useState(0)
  const [isIdle, setIsIdle] = useState(false)
  const textareaRef = useRef(null)
  const idleTimerRef = useRef(null)

  assert(
    !isEditing || acceptingClicks,
    'acceptingClicks should be true only when isEditing is true',
  )

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      const length = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(length, length)
      updateCaretAndHeight()
      resetIdleTimer()
    } else if (!isEditing && textareaRef.current) {
      textareaRef.current.blur()
      updateCaretAndHeight()
      clearIdleTimer()
    }
  }, [isEditing])

  // Clean up the timer when component unmounts
  useEffect(() => {
    return () => clearIdleTimer()
  }, [])

  const resetIdleTimer = () => {
    clearIdleTimer()
    setIsIdle(false)
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true)
    }, 500)
  }

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }

  const updateCaretAndHeight = (e) => {
    const metrics = measureTextarea(textareaRef)
    if (!metrics) return
    const { left, top, caretHeight, onScreen, divHeight } = metrics
    setCaretPos({ left, top, height: caretHeight, onScreen })
    setHeight(divHeight)
  }

  const handleChange = (e) => {
    updateCaretAndHeight()
    onChange(e.target.value)
    resetIdleTimer()
  }

  const handleClick = (e) => {
    if (acceptingClicks) {
      e.stopPropagation()
      resetIdleTimer()
      onClick && onClick(e)
    } else {
      e.preventDefault()
    }
    updateCaretAndHeight()
  }

  const handleKeyUp = (e) => {
    resetIdleTimer()
    updateCaretAndHeight()
  }

  const handleKeyDown = (e) => {
    resetIdleTimer()
    updateCaretAndHeight()
    if (isEditing && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.stopPropagation()
    }
  }

  const selectableClass = acceptingClicks ? '' : 'pointer-events-none'
  const className = `border-none outline-none resize-none text-[15px] caret-transparent w-full placeholder-gray-400 font-sans ${selectableClass}`
  const blinkingClass = isIdle ? 'blinking' : ''

  return (
    <div className={`relative flex flex-col ${selectableClass}`}>
      <textarea
        ref={textareaRef}
        className={className}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        style={{
          height: height,
          minHeight: minHeight + 'px',
          lineHeight: `${lineHeight}px`,
          cursor: cursorStyle || 'text',
        }}
        value={value}
        placeholder={placeholder}
        onMouseUp={updateCaretAndHeight}
        onDoubleClick={handleClick}
        onClick={handleClick}
      />
      {isEditing && (
        <div
          className={`absolute bg-sky-400 ${blinkingClass} pointer-events-none`}
          style={{
            left: `${caretPos.left}px`,
            top: `${caretPos.top}px`,
            height: `${caretPos.height}px`,
            width: '2px',
          }}
        />
      )}
    </div>
  )
}

function measureTextarea(textareaRef) {
  const textarea = textareaRef.current
  if (!textarea) return

  // create mirror div
  const div = document.createElement('div')
  div.style.position = 'absolute'
  div.style.visibility = 'hidden'
  div.style.width = `${textarea.offsetWidth}px`

  // styles to match textarea
  const computedStyle = window.getComputedStyle(textarea)
  const stylesToCopy = [
    'font-family',
    'font-size',
    'font-weight',
    'letter-spacing',
    'line-height',
    'text-transform',
    'word-spacing',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border-width',
    'box-sizing',
    'overflow',
    'white-space',
    'min-height',
  ]

  stylesToCopy.forEach((style) => {
    div.style[style] = computedStyle[style]
  })

  const charOffset =
    textarea.selectionDirection === 'backward'
      ? textarea.selectionStart
      : textarea.selectionEnd
  const textUntilCaret = textarea.value.substring(0, charOffset)
  const textWithLineBreaks = textUntilCaret.replace(/\n/g, '<br>')
  div.innerHTML = textWithLineBreaks

  const caretSpan = document.createElement('span')
  caretSpan.innerHTML = '.'
  caretSpan.style.backgroundColor = 'transparent'
  caretSpan.style.color = 'transparent'
  div.appendChild(caretSpan)

  const remainingText = textarea.value
    .substring(charOffset)
    .replace(/\n/g, '<br>')
  const remainingSpan = document.createElement('span')
  remainingSpan.innerHTML = remainingText
  div.appendChild(remainingSpan)

  document.body.appendChild(div)

  const caretRect = caretSpan.getBoundingClientRect()
  const divRect = div.getBoundingClientRect()
  const divHeight = div.offsetHeight

  // Calculate relative position to the textarea
  const x = caretRect.left - divRect.left - textarea.scrollLeft
  const y = caretRect.top - divRect.top - textarea.scrollTop
  const caretHeight = caretRect.height

  // Clean up
  document.body.removeChild(div)
  const onScreen = y >= 0 && y + caretHeight <= textarea.offsetHeight

  // IMPORTANT: Adjust for textarea scroll position
  return {
    left: x,
    top: y,
    caretHeight: lineHeight,
    onScreen: onScreen,
    divHeight,
  }
}

export default TextBox
