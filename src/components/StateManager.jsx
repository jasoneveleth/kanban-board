import React, { createContext, useContext, useState, useEffect } from 'react';

// Access the store via the preload bridge
const electronStore = window.electronStore;

const TaskContext = createContext();

export function useTaskContext() {
  return useContext(TaskContext);
}

export function TaskProvider({ children }) {
  const [taskData, setTaskData] = useState({});
  const [colState, setColState] = useState({});
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState({taskId: null, field: null});
  const [dragging, setDragging] = useState({id: null, height: null});

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setTaskData(await electronStore.getTasks());
        setColState(await electronStore.getColumns());
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  const selectTask = (id) => {
    // if we're editing another task, stop editing when we select a new one
    if (editingTask.taskId && editingTask.taskId !== id) {
      setEditingTask({taskId: null, field: null});
    }
    setSelectedTaskId(id);
  }

  const updateTask = (taskId, field, value) => {
    setTaskData(prevData => {
      const updatedTask = {
        ...prevData[taskId],
        [field]: value
      };
      
      // Update task in persistent storage with the full task object (async)
      // We don't await this since we want the UI to be responsive
      electronStore.updateTask(taskId, updatedTask)
        .catch(error => {
          console.error('Failed to update task:', error);
        });
      
      // Return the updated state
      return {
        ...prevData,
        [taskId]: updatedTask
      };
    });
  };

  const createNewTask = async (columnName = 'Plan') => {
    try {
      const id = await electronStore.createTask({
        title: '',
        notes: '',
        deadline: null,
        startDate: null
      }, columnName);
      
      setTaskData(await electronStore.getTasks());
      setColState(await electronStore.getColumns());
      
      return id;
    } catch (error) {
      console.error('Failed to create task:', error);
      return null;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      // Delete task in persistent storage
      await electronStore.deleteTask(taskId);
      
      setTaskData(await electronStore.getTasks());
      setColState(await electronStore.getColumns());
      
      // If the deleted task was selected, clear selection
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
      
      // If the deleted task was being edited, clear editing state
      if (editingTask.taskId === taskId) {
        setEditingTask({taskId: null, field: null});
      }
      
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const moveTask = async (taskId, fromColumn, toColumn, newIndex = -1) => {
    try {
      await electronStore.moveTaskBtwnCol(taskId, fromColumn, toColumn, newIndex);
      setColState(await electronStore.getColumns());
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const moveTaskUpDown = async (taskId, columnName, isUp) => {
    try {
      await electronStore.moveTaskInCol(taskId, columnName, isUp);
      
      setColState(await electronStore.getColumns());
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const undo = async () => {
    try {
      const canUndoVal = await electronStore.canUndo();
      if (!canUndoVal) return;
      
      // Perform undo in persistent storage
      await electronStore.undo();
      setTaskData(await electronStore.getTasks());
      setColState(await electronStore.getColumns());
    } catch (error) {
      console.error('Failed to undo:', error);
    }
  };

  const redo = async () => {
    try {
      const canRedoVal = await electronStore.canRedo();
      if (!canRedoVal) return;
      
      await electronStore.redo();
      setTaskData(await electronStore.getTasks());
      setColState(await electronStore.getColumns());
    } catch (error) {
      console.error('Failed to redo:', error);
    }
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
          e.preventDefault();
        }
      } else if (e.ctrlKey || e.metaKey) {
        // Handle keyboard shortcuts
        if (e.key === 'z') {
          if (e.shiftKey) {
            // Ctrl/Cmd + Shift + Z = Redo
            redo();
          } else {
            // Ctrl/Cmd + Z = Undo
            undo();
          }
          e.preventDefault();
        } else if (e.key === 'y') {
          // Ctrl/Cmd + Y = Redo (alternative)
          redo();
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTaskId, editingTask]);

  const startDragging = (id) => {
    setDragging({id});
  };

  const dropped = (id) => {
    setDragging({id: null});
    if (!editingTask.taskId) {
      setSelectedTaskId(id);
    }
  };

  // Function to find which column a task is in
  const findTaskColumn = (taskId) => {
    for (const [colName, tasks] of Object.entries(colState)) {
      if (tasks.includes(taskId)) {
        return colName;
      }
    }
    return null;
  };

  // Handle task dropping between columns
  const handleTaskDrop = (taskId, targetColumn, targetIndex = -1) => {
    const sourceColumn = findTaskColumn(taskId);
    
    if (sourceColumn && sourceColumn !== targetColumn) {
      moveTask(taskId, sourceColumn, targetColumn, targetIndex);
    }
  };

  const contextValue = {
    taskData,
    colState,
    updateTask,
    createNewTask,
    deleteTask,
    moveTask,
    moveTaskUpDown,
    selectTask,
    startEditing,
    stopEditing,
    isTaskSelected,
    isFieldEditing,
    isTaskEditing,
    startDragging,
    dragging,
    dropped,
    handleTaskDrop,
    undo,
    redo
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}
