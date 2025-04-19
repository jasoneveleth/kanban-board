import { useState, useRef, useEffect } from 'react';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function TextBox({onChange, value, placeholder, isEditing, minHeight=18, cursorStyle, acceptingClicks}) {
  const [caretPos, setCaretPos] = useState({left: 0, top: 0, height: 0, onScreen: false});
  const [height, setHeight] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const textareaRef = useRef(null);
  const idleTimerRef = useRef(null);

  assert(!isEditing || acceptingClicks, "acceptingClicks should be true only when isEditing is true");

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
      setHeight(textareaRef.current.scrollHeight);
      updateCaretPosition();
      resetIdleTimer();
    } else if (!isEditing && textareaRef.current) {
      textareaRef.current.blur();
      clearIdleTimer();
    }
  }, [isEditing]);

  // Clean up the timer when component unmounts
  useEffect(() => {return () => clearIdleTimer()}, []);

  const resetIdleTimer = () => {
    clearIdleTimer();
    setIsIdle(false);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 500);
  };

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const updateCaretPosition = (e) => {
    const coordinates = getCaretCoordinates(textareaRef);
    if (coordinates) {
      setCaretPos(coordinates);
    }
  };

  const handleChange = (e) => {
    updateCaretPosition();
    setHeight(e.target.scrollHeight);
    onChange(e.target.value);
    resetIdleTimer();
  };

  const handleClick = (e) => {
    if (acceptingClicks) {
      e.stopPropagation();
      resetIdleTimer();
    } else {
      e.preventDefault();
    }
  }

  const selectableClass = acceptingClicks ? '' : 'pointer-events-none';
  const className = `border-none outline-none caret-transparent resize-none font-size-15px w-full placeholder-gray-400 font-sans ${selectableClass}`;
  const blinkingClass = isIdle ? 'blinking' : '';

  return (
    <div className={`relative flex flex-col ${selectableClass}`}>
      <textarea 
        ref={textareaRef}
        className={className}
        onChange={handleChange}
        onKeyDown={resetIdleTimer}
        onKeyUp={resetIdleTimer}
        style={{
          height: height,
          minHeight: minHeight + 'px',
          lineHeight: '18px',
          cursor: cursorStyle || 'text',
        }}
        value={value}
        placeholder={placeholder}
        onMouseUp={updateCaretPosition}
        onKeyUp={updateCaretPosition}
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
            width: '2px'
          }}
        />
      )}
    </div>
  );
}

function getCaretCoordinates(textareaRef) {
  const textarea = textareaRef.current;

  if (!textarea) return;

  if (window.getSelection && window.getSelection().rangeCount > 0) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.width = `${textarea.offsetWidth}px`;

    // styles to match textarea
    const computedStyle = window.getComputedStyle(textarea);
    const stylesToCopy = [
      'font-family', 'font-size', 'font-weight', 'letter-spacing',
      'line-height', 'text-transform', 'word-spacing', 'padding-top',
      'padding-right', 'padding-bottom', 'padding-left', 'border-width',
      'box-sizing', 'height', 'overflow', 'white-space'
    ];

    stylesToCopy.forEach(style => {
      div.style[style] = computedStyle[style];
    });

    const textUntilCaret = textarea.value.substring(0, textarea.selectionStart);
    div.textContent = textUntilCaret;
    const caretSpan = document.createElement('span');
    caretSpan.textContent = selectedText.length ? selectedText : '.';
    caretSpan.style.backgroundColor = 'transparent';
    caretSpan.style.color = 'transparent';
    div.appendChild(caretSpan);
    div.appendChild(document.createTextNode(textarea.value.substring(end)));
    document.body.appendChild(div);

    const caretRect = caretSpan.getBoundingClientRect();
    const divRect = div.getBoundingClientRect();

    // Calculate relative position to the textarea
    const x = caretRect.left - divRect.left - textarea.scrollLeft;
    const y = caretRect.top - divRect.top - textarea.scrollTop;
    const height = caretRect.height;

    // Clean up
    document.body.removeChild(div);
    const onScreen = y >= 0 && (y+height) <= textarea.offsetHeight;

    // IMPORTANT: Adjust for textarea scroll position
    return { 
      left: x, 
      top: y, 
      height: height,
      onScreen: onScreen
    };
  }
}

export default TextBox;
