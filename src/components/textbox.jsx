import { useState, useRef } from 'react';

function getCaretCoordinates(textareaRef) {
  const textarea = textareaRef.current

  if (!textarea) return
  if (window.getSelection && window.getSelection().rangeCount > 0) {
	  const start = textarea.selectionStart
      const end = textarea.selectionEnd
	  const selectedText = textarea.value.substring(start, end)	

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

	  const textUntilCaret = textarea.value.substring(0, textarea.selectionStart)
	  div.textContent = textUntilCaret;
	  const caretSpan = document.createElement('span');
	  caretSpan.textContent = selectedText.length ? selectedText : '.';
	  caretSpan.style.backgroundColor = 'transparent';
	  caretSpan.style.color = 'transparent';
	  div.appendChild(caretSpan);
	  div.appendChild(document.createTextNode(textarea.value.substring(end)));
	  document.body.appendChild(div)

	  const caretRect = caretSpan.getBoundingClientRect();
	  const divRect = div.getBoundingClientRect()
	  console.log(caretRect, divRect)
	  
	  // Calculate relative position to the textarea
	  const x = caretRect.left - divRect.left;
	  const y = caretRect.top - divRect.top;
	  const height = caretRect.height
	  
	  // Clean up
	  document.body.removeChild(div);
	  return { left: x, top: y, height: height}
  }
}


function TextBox({onChange, value, placeholder, isFocused}) {
  const [caretPos, setCaretPos] = useState({left: 0, top: 0, height: 0});
  const textareaRef = useRef(null);

  const handleChange = (e => {
      console.log(getCaretCoordinates(textareaRef))
	  setCaretPos(getCaretCoordinates(textareaRef));
	  onChange(e.target.value);
  });

  return (<div className="relative">
	  <textarea 
		ref={textareaRef}
		className="border-none outline-none caret-transparent resize-none font-size-15px w-full"
	    onChange={handleChange}
		value={value}
	    placeholder={placeholder}
		onMouseUp={handleChange}
	    />
	  {isFocused && (<div 
		className="absolute bg-sky-400"
		style={{...caretPos, width: '2px'}}/>)}
	</div>)
}

export default TextBox;

