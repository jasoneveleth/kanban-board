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
	},
	"task3": { id: "task3", title: "asdfjk", notes: "", deadline: null, startDate: null, col: 1, },
	"task4": { id: "task4", title: "djskfl", notes: "", deadline: null, startDate: null, col: 1, },
	"task5": { id: "task5", title: "lkdjsaf", notes: "", deadline: null, startDate: null, col: 2, },
	"task6": { id: "task6", title: "iewuo", notes: "", deadline: null, startDate: null, col: 3, },
	"task7": { id: "task7", title: "cxnmvcx", notes: "", deadline: null, startDate: null, col: 3, },
	"task8": { id: "task8", title: "yyrvr", notes: "", deadline: null, startDate: null, col: 1, },
	"task9": { id: "task9", title: "moukh", notes: "", deadline: null, startDate: null, col: 2, },
  })

  const [animState, setAnimState] = useState({
    "task1": {
	  dest: {x: null, y: null},
	  pos: {x: null, y: null},
	  state: 'idle',
	  m: 123,
	  v: {x: 0, y: 0},
	  }, 
	"task2": {
	  dest: {x: null, y: null},
	  pos: {x: null, y: null},
	  state: 'idle',
	  m: 123,
	  v: {x: 0, y: 0},
	}
  })

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isEditing, setIsEditing] = useState({taskId: null, field: null});
  const [colNames, setColNames] = useState(["Plan", "Doing", "Review", "Done"]);

  const selectTask = (id) => {
	if (isEditing.taskId && isEditing.taskId !== id) {
	  setIsEditing({taskId: null, field: null});
	}
	setSelectedTaskId(id);
  }

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

