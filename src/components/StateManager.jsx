import React, { createContext, useContext, useState, useEffect } from 'react';

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
	},
	"task2": {
	  id: "task2",
	  title: "",
	  notes: "",
	  deadline: null,
	  startDate: null,
	},
	"task3": { id: "task3", title: "asdfjk", notes: "", deadline: null, startDate: null, },
	"task4": { id: "task4", title: "djskfl", notes: "", deadline: null, startDate: null, },
	"task5": { id: "task5", title: "lkdjsaf", notes: "", deadline: null, startDate: null, },
	"task6": { id: "task6", title: "iewuo", notes: "", deadline: null, startDate: null, },
	"task7": { id: "task7", title: "cxnmvcx", notes: "", deadline: null, startDate: null, },
	"task8": { id: "task8", title: "yyrvr", notes: "", deadline: null, startDate: null, },
	"task9": { id: "task9", title: "moukh", notes: "", deadline: null, startDate: null, },
  })
  const [colState, setColState] = useState({
	"Plan": ["task1", "task2", "task3"], 
	"Doing": ["task4", "task5", "task6"],
	"Review": ["task7", "task8", "task9"],
	"Done": []
  });

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState({taskId: null, field: null});

  const selectTask = (id) => {
	// if we're editing another task, stop editing when we select a new one
	if (editingTask.taskId && editingTask.taskId !== id) {
	  setEditingTask({taskId: null, field: null});
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
    if (taskId === editingTask.taskId && field === editingTask.field) {
      // already editing this task and field
      return;
    }
    setSelectedTaskId(taskId);
    setEditingTask({taskId, field});
  };

  const stopEditing = () => {
    setEditingTask({taskId: null, field: null});
  };

  const isTaskSelected = (taskId) => selectedTaskId === taskId;
  const isFieldEditing = (taskId, field) => editingTask.taskId === taskId && editingTask.field === field;
  const isTaskEditing = (taskId) => editingTask.taskId === taskId;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopEditing();
      } else if (e.key === 'Enter') {
		if (!editingTask.taskId) {
		  setEditingTask({taskId: selectedTaskId, field: 'title'});
		  e.preventDefault()
		}
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTaskId, editingTask]);


  const [dragging, setDragging] = useState({id: null, height: null});
  const startDragging = (id) => {
	setDragging({id})
  }

  const dropped = (id) => {
	setDragging({id: null})
	if (!editingTask.taskId) {
	  setSelectedTaskId(id);
	}
  }

  const contextValue = {
    taskData,
    colState,
    updateTask,
    selectTask,
    startEditing,
    stopEditing,
    isTaskSelected,
    isFieldEditing,
	isTaskEditing,
	startDragging,
	dragging,
	dropped,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

