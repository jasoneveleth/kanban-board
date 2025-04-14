import React, { createContext, useContext, useState, useReducer } from 'react';

const TaskContext = createContext();

export function useTaskContext() {
  return useContext(TaskContext);
}

export function TaskProvider({ children }) {
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

  const [animState, setAnimState] = useState({
    "task1": {
	  dest: {x: null, y: null},
	  curr: {x: null, y: null},
	  m: 123,
	  v: {x: 0, y: 0},
	  }, 
	"task2": {
	  dest: {x: null, y: null},
	  curr: {x: null, y: null},
	  m: 123,
	  v: {x: 0, y: 0},
	}
  })

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isEditing, setIsEditing] = useState({taskId: null, field: null});
  const [colNames, setColNames] = useState(["Plan", "Doing", "Review", "Done"]);

  const selectTask = setSelectedTaskId;

  const updateTask = (taskId, field, value) => {
    const task = taskData[taskId];
    if (!task) throw new Error("Task not found");
    
    setTaskData({
      ...taskData, 
      [taskId]: {
        ...task, 
        [field]: value
      }
    });
  };

  const startEditing = (taskId, field) => {
    setSelectedTaskId(taskId);
    setIsEditing({taskId, field});
  };

  const stopEditing = () => {
    setIsEditing({taskId: null, field: null});
  };

  const isTaskSelected = (taskId) => selectedTaskId === taskId;
  const isFieldEditing = (taskId, field) => isEditing.taskId === taskId && isEditing.field === field;
  const isTaskEditing = (taskId) => isEditing.taskId === taskId;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      stopEditing();
    } else if (e.key === 'Enter') {
      setIsEditing({taskId: selectedTaskId, field: 'title'});
    }
  };

  const contextValue = {
    taskData,
    colNames,
    updateTask,
    selectTask,
    startEditing,
    stopEditing,
    isTaskSelected,
    isFieldEditing,
	isTaskEditing,
    handleKeyDown
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

