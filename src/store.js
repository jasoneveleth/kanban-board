import Store from 'electron-store'

const store = new Store({
  name: 'task-manager-data',
  defaults: {
    tasks: {},
    columns: {
      "Plan": [],
      "Doing": [],
      "Review": [],
      "Done": []
    },
    undoStack: [],
    redoStack: [],
  }
});

// Action types for undo/redo operations
const ActionTypes = {
  CREATE_TASK: 'CREATE_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  UPDATE_COLUMNS: 'UPDATE_COLUMNS',
};

const todoStore = {
  // Core Data Operations
  getTasks: () => {
    return store.get('tasks');
  },

  getTask: (id) => {
    const tasks = store.get('tasks');
    return tasks[id];
  },

  getColumns: () => {
    return store.get('columns');
  },

  // Mutating Operations
  createTask: (taskData, columnName) => {
    const columns = store.get('columns');
    columnName = columnName || Object.keys(columns)[0];

    const tasks = store.get('tasks');
    const id = `task${Date.now()}`;

    const newTask = {
      id,
      title: taskData.title || "",
      notes: taskData.notes || "",
      deadline: taskData.deadline || null,
      startDate: taskData.startDate || null,
      ...taskData
    };

    // Save the new task
    store.set('tasks', {
      ...tasks,
      [id]: newTask
    });

    columns[columnName] = [...columns[columnName], id];
    store.set('columns', columns);

    // Add to undo stack
    todoStore._addToUndoStack({
      type: ActionTypes.CREATE_TASK,
      payload: {
        taskId: id,
        column: columnName
      }
    });

    return id;
  },

  updateTask: (id, newState) => {
    const tasks = store.get('tasks');
    if (!tasks[id]) {
      console.error(`Task with ID ${id} not found`);
      return false;
    }

    // Save the original state for undo
    const originalState = { ...tasks[id] };

    // Update the task
    const updatedTask = {
      ...tasks[id],
      ...newState
    };

    // Save to store
    store.set('tasks', {
      ...tasks,
      [id]: updatedTask
    });

    // Add to undo stack
    todoStore._addToUndoStack({
      type: ActionTypes.UPDATE_TASK,
      payload: {
        taskId: id,
        oldState: originalState,
        newState
      }
    });

    return true;
  },

  moveTaskBtwnCol: (taskId, fromColumn, toColumn, newIndex = -1) => {
    const columns = store.get('columns');

    // Validate columns exist
    if (!columns[fromColumn] || !columns[toColumn]) {
      console.error(`Invalid column name: ${fromColumn} or ${toColumn}`);
      return false;
    }

    // Make sure task exists in fromColumn
    if (!columns[fromColumn].includes(taskId)) {
      console.error(`Task ${taskId} not found in column ${fromColumn}`);
      return false;
    }

    // Create new column state
    const newColumns = { ...columns };

    // Remove from old column
    newColumns[fromColumn] = newColumns[fromColumn].filter(id => id !== taskId);

    // Add to new column at specified index
    if (newIndex === -1 || newIndex >= newColumns[toColumn].length) {
      // Add to the end if not specified or out of bounds
      newColumns[toColumn] = [...newColumns[toColumn], taskId];
    } else {
      // Insert at specified index
      newColumns[toColumn] = [
        ...newColumns[toColumn].slice(0, newIndex),
        taskId,
        ...newColumns[toColumn].slice(newIndex)
      ];
    }

    // Update columns
    return todoStore.updateColumns(newColumns, {
      type: 'moveTaskBtwnCol',
      taskId,
      fromColumn,
      toColumn,
      newIndex
    });
  },

  moveTaskInCol: (taskId, columnName, isUp) => {
    const columns = store.get('columns');

    // Validate column exists
    if (!columns[columnName]) {
      console.error(`Invalid column name: ${columnName}`);
      return false;
    }

    const column = columns[columnName];
    const currentIndex = column.indexOf(taskId);

    // Make sure task exists in column
    if (currentIndex === -1) {
      console.error(`Task ${taskId} not found in column ${columnName}`);
      return false;
    }

    // Calculate new index
    const clip = (x) => Math.max(0, Math.min(column.length - 1, x));
    let newIndex = clip(currentIndex + (isUp ? -1 : 1));

    // If no change in position, return
    if (newIndex === currentIndex) {
      return false;
    }

    // Create new column state
    const newColumns = { ...columns };

    // Remove task from current position
    newColumns[columnName] = [...column];
    newColumns[columnName].splice(currentIndex, 1);
    newColumns[columnName].splice(newIndex, 0, taskId);

    return todoStore.updateColumns(newColumns, {
      type: 'moveTaskInCol',
      taskId,
      columnName,
      oldIndex: currentIndex,
      newIndex
    });
  },

  deleteTask: (id) => {
    const tasks = store.get('tasks');
    const columns = store.get('columns');

    if (!tasks[id]) {
      console.error(`Task with ID ${id} not found`);
      return false;
    }

    // Save original state for undo
    const originalTask = tasks[id];

    // Find which column contains this task
    let taskColumn = null;
    let taskIndex = -1;

    Object.entries(columns).forEach(([colName, taskIds]) => {
      const index = taskIds.indexOf(id);
      if (index !== -1) {
        taskColumn = colName;
        taskIndex = index;
      }
    });

    // Create new tasks object without this task
    const newTasks = { ...tasks };
    delete newTasks[id];

    // Create new columns without this task
    const newColumns = { ...columns };
    if (taskColumn) {
      newColumns[taskColumn] = newColumns[taskColumn].filter(taskId => taskId !== id);
    }

    // Save to store
    store.set('tasks', newTasks);
    store.set('columns', newColumns);

    // Add to undo stack
    todoStore._addToUndoStack({
      type: ActionTypes.DELETE_TASK,
      payload: {
        taskId: id,
        task: originalTask,
        column: taskColumn,
        index: taskIndex
      }
    });

    return true;
  },

  updateColumns: (newColumns, operationDetails = null) => {
    const oldColumns = store.get('columns');

    // Save to store
    store.set('columns', newColumns);

    // Add to undo stack
    todoStore._addToUndoStack({
      type: ActionTypes.UPDATE_COLUMNS,
      payload: {
        oldColumns,
        newColumns,
        operationDetails
      }
    });

    return true;
  },

  // Undo/Redo Operations
  canUndo: () => {
    const undoStack = store.get('undoStack');
    return undoStack.length > 0;
  },

  canRedo: () => {
    const redoStack = store.get('redoStack');
    return redoStack.length > 0;
  },

  undo: () => {
    const undoStack = store.get('undoStack');
    if (undoStack.length === 0) {
      return null;
    }

    // Get the last action from undo stack
    const lastAction = undoStack[undoStack.length - 1];

    // Remove from undo stack
    store.set('undoStack', undoStack.slice(0, -1));

    // Add to redo stack
    const redoStack = store.get('redoStack');
    store.set('redoStack', [...redoStack, lastAction]);

    // Perform the inverse operation
    todoStore._undoAction(lastAction);

    return lastAction;
  },

  redo: () => {
    const redoStack = store.get('redoStack');
    if (redoStack.length === 0) {
      return null;
    }

    // Get the last action from redo stack
    const lastAction = redoStack[redoStack.length - 1];

    // Remove from redo stack
    store.set('redoStack', redoStack.slice(0, -1));

    // Add to undo stack
    const undoStack = store.get('undoStack');
    store.set('undoStack', [...undoStack, lastAction]);

    // Perform the operation
    todoStore._redoAction(lastAction);

    return lastAction;
  },

  getUndoStack: () => {
    return store.get('undoStack');
  },

  // Internal methods for undo/redo operations
  _addToUndoStack: (action) => {
    const undoStack = store.get('undoStack');
    store.set('undoStack', [...undoStack, action]);

    // Clear redo stack when new action is performed
    store.set('redoStack', []);
  },

  _undoAction: (action) => {
    switch (action.type) {
      case ActionTypes.CREATE_TASK: {
        const { taskId, column } = action.payload;

        // Remove task from tasks
        const tasks = store.get('tasks');
        const newTasks = { ...tasks };
        delete newTasks[taskId];
        store.set('tasks', newTasks);

        // Remove task from column
        const columns = store.get('columns');
        const newColumns = { ...columns };
        newColumns[column] = newColumns[column].filter(id => id !== taskId);
        store.set('columns', newColumns);

        break;
      }

      case ActionTypes.UPDATE_TASK: {
        const { taskId, oldState } = action.payload;

        // Restore previous state
        const tasks = store.get('tasks');
        store.set('tasks', {
          ...tasks,
          [taskId]: oldState
        });

        break;
      }

      case ActionTypes.DELETE_TASK: {
        const { taskId, task, column, index } = action.payload;

        // Add task back to tasks
        const tasks = store.get('tasks');
        store.set('tasks', {
          ...tasks,
          [taskId]: task
        });

        // Add task back to column
        const columns = store.get('columns');
        const newColumns = { ...columns };

        if (column) {
          const columnTasks = [...newColumns[column]];
          columnTasks.splice(index, 0, taskId);
          newColumns[column] = columnTasks;
          store.set('columns', newColumns);
        }

        break;
      }

      case ActionTypes.UPDATE_COLUMNS: {
        const { oldColumns } = action.payload;

        // Restore previous columns state
        store.set('columns', oldColumns);

        break;
      }

      default:
        console.error(`Unknown action type: ${action.type}`);
    }
  },

  _redoAction: (action) => {
    switch (action.type) {
      case ActionTypes.CREATE_TASK: {
        const { taskId, column } = action.payload;

        // Need to restore the task data
        // Since we don't store the full task data in the action, 
        // this is a partial implementation
        // In a real app, you'd want to store the full task data in the action
        const tasks = store.get('tasks');
        if (!tasks[taskId]) {
          console.error(`Cannot redo create task: Task ${taskId} not found`);
          return;
        }

        // Add task back to column
        const columns = store.get('columns');
        const newColumns = { ...columns };
        if (!newColumns[column].includes(taskId)) {
          newColumns[column] = [...newColumns[column], taskId];
          store.set('columns', newColumns);
        }

        break;
      }

      case ActionTypes.UPDATE_TASK: {
        const { taskId, newState } = action.payload;

        // Re-apply update
        const tasks = store.get('tasks');
        if (!tasks[taskId]) {
          console.error(`Cannot redo update task: Task ${taskId} not found`);
          return;
        }

        store.set('tasks', {
          ...tasks,
          [taskId]: {
            ...tasks[taskId],
            ...newState
          }
        });

        break;
      }

      case ActionTypes.DELETE_TASK: {
        const { taskId } = action.payload;

        // Remove task from tasks
        const tasks = store.get('tasks');
        const newTasks = { ...tasks };
        delete newTasks[taskId];
        store.set('tasks', newTasks);

        // Remove task from columns
        const columns = store.get('columns');
        const newColumns = { ...columns };

        Object.keys(newColumns).forEach(column => {
          newColumns[column] = newColumns[column].filter(id => id !== taskId);
        });

        store.set('columns', newColumns);

        break;
      }

      case ActionTypes.UPDATE_COLUMNS: {
        const { newColumns } = action.payload;

        // Re-apply columns update
        store.set('columns', newColumns);

        break;
      }

      default:
        console.error(`Unknown action type: ${action.type}`);
    }
  }
};

export default todoStore;
