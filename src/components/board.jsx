import React, { useState } from 'react';
import Card from './card.jsx';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function Board() {
  const [taskData, setTaskData] = useState({
	"task1": {
	  id: "task1",
	  title: "Task 1",
	  notes: "",
	  deadline: null,
	  startDate: null,
	  col: 0,
	},
	"task2": {
	  id: "task2",
	  title: "",
	  notes: "",
	  deadline: null,
	  startDate: null,
	  col: 0,
	}
  })

  const onChange = (taskId, newData) => {
	const task = taskData[taskId];
	assert(task, "Task not found");
	let newfield;
	if (isEditing.field === 'title') {
	  newfield = {title: newData};
	} else if (isEditing.field === 'notes') {
	  newfield = {notes: newData};
	}
	setTaskData({...taskData, [taskId]: {...task, ...newfield}})
  }

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isEditing, setIsEditing] = useState({taskId: null, field: null});

  const [colNames, setColNames] = useState(["Plan", "Doing", "Review", "Done"]);

  const onDoubleClick = (taskId, field) => {
	setSelectedTaskId(taskId);
	setIsEditing({taskId: taskId, field: field || 'title'});
  };
  const onClick = (taskId) => {
	setSelectedTaskId(taskId);
  };

  const handleKey = (e) => {
	if (e.key === 'Escape') {
	  setIsEditing({taskId: null, field: null});
	} else if (e.key === 'Enter') {
	  setIsEditing({taskId: selectedTaskId, field: 'title'});
	}
  }

  return (
	<div 
	  className="w-full h-full relative"
	  onKeyDown={handleKey}>
	  {colNames.map((colName, index) => (
		<div key={index} className="col">
		  <h2>{colName}</h2>
		</div>
	  ))}
	  {Object.values(taskData).map((task) => (
		<Card
		  isSelected={selectedTaskId === task.id}
		  key={task.id}
		  title={task.title}
		  notes={task.notes}
		  deadline={task.deadline}
		  editingInfo={isEditing.taskId === task.id ? isEditing : null}
		  handlers={[(field) => onDoubleClick(task.id, field), () => onClick(task.id), (x) => onChange(task.id, x)]}
		/>
	  ))}
	</div>
  )
}

export default Board;
