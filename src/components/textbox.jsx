import { useState, useRef, useEffect } from 'react';

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
	console.log('caretRect.top, divRect.top, textarea.scrollTop, y, height, divRect.height');
	console.log(caretRect.top, divRect.top, textarea.scrollTop, y, height, divRect.height);

	// Clean up
	document.body.removeChild(div);
	const onScreen = y >= 0 && (y+height) <= textarea.offsetHeight

	// IMPORTANT: Adjust for textarea scroll position
	return { 
	  left: x, 
	  top: y, 
	  height: height,
	  onScreen: onScreen
	};
  }
}

function TextBox({onChange, value, placeholder, isEditing, minHeight, cursorStyle, onDoubleClick, onClick}) {
  const [caretPos, setCaretPos] = useState({left: 0, top: 0, height: 0, onScreen: false});
  const [textareaHeight, setTextareaHeight] = useState(0);
  const textareaRef = useRef(null);

  const updateCaretPosition = () => {
	const coordinates = getCaretCoordinates(textareaRef);
	if (coordinates) {
	  setCaretPos(coordinates);
	}
  };

  const handleChange = (e) => {
	updateCaretPosition();
	setTextareaHeight(e.target.scrollHeight);
	onChange(e.target.value);
  };

  // Handle scroll events to update caret position
  useEffect(() => {
	const textarea = textareaRef.current;
	if (textarea && isEditing) {
	  textarea.addEventListener('scroll', updateCaretPosition);
	  return () => {
		textarea.removeEventListener('scroll', updateCaretPosition);
	  };
	}
  }, [isEditing]);

  if (isEditing) {
	console.log(caretPos)
  }

  let height = minHeight || 32;

  return (
	<div className="relative flex flex-col">
	  <textarea 
		ref={textareaRef}
		className="border-none outline-none caret-transparent resize-none font-size-15px w-full placeholder-gray-400 font-sans"
		onChange={handleChange}
		style={{
		  height: textareaHeight,
		  minHeight: height + 'px',
		  lineHeight: height + 'px',
		  cursor: cursorStyle || 'text',
		}}
		value={value}
		placeholder={placeholder}
		onMouseUp={updateCaretPosition}
		onKeyUp={updateCaretPosition}
		onDoubleClick={onDoubleClick}
		onClick={onClick}
	  />
	  {isEditing && (
		<div 
		  className="absolute bg-sky-400 blinking"
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

export default TextBox;
