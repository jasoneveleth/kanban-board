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

function TextBox({onChange, value, placeholder, isFocused, isEditing}) {
  const [caretPos, setCaretPos] = useState({left: 0, top: 0, height: 0, onScreen: false});
  const textareaRef = useRef(null);

  const updateCaretPosition = () => {
	const coordinates = getCaretCoordinates(textareaRef);
	if (coordinates) {
	  setCaretPos(coordinates);
	}
  };

  const handleChange = (e) => {
	updateCaretPosition();
	onChange(e.target.value);
  };

  // Handle scroll events to update caret position
  useEffect(() => {
	const textarea = textareaRef.current;
	if (textarea && isFocused) {
	  textarea.addEventListener('scroll', updateCaretPosition);
	  return () => {
		textarea.removeEventListener('scroll', updateCaretPosition);
	  };
	}
  }, [isFocused]);

  return (
	<div className="relative">
	  <textarea 
		ref={textareaRef}
		className="border-none outline-none caret-transparent resize-none font-size-15px w-full"
		onChange={handleChange}
		value={value}
		placeholder={placeholder}
		onMouseUp={updateCaretPosition}
		onKeyUp={updateCaretPosition}
	  />
	  {isEditing && caretPos.onScreen && (
		<div 
		  className="absolute bg-sky-400"
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
