const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'electronStore', {
  // Task operations
  getTasks: () => ipcRenderer.invoke('store:getTasks'),
  getTask: (id) => ipcRenderer.invoke('store:getTask', id),
  getColumns: () => ipcRenderer.invoke('store:getColumns'),

  // Mutating operations
  createTask: (taskData, columnName) => ipcRenderer.invoke('store:createTask', taskData, columnName),
  updateTask: (id, task) => ipcRenderer.invoke('store:updateTask', id, task),
  moveTaskBtwnCol: (taskId, fromColumn, toColumn, newIndex) =>
    ipcRenderer.invoke('store:moveTaskBtwnCol', taskId, fromColumn, toColumn, newIndex),
  moveTaskInCol: (taskId, columnName, isUp) =>
    ipcRenderer.invoke('store:moveTaskInCol', taskId, columnName, isUp),
  deleteTask: (id) => ipcRenderer.invoke('store:deleteTask', id),
  updateColumns: (newIdLists, operationDetails) =>
    ipcRenderer.invoke('store:updateColumns', newIdLists, operationDetails),

  // Undo/Redo
  canUndo: () => ipcRenderer.invoke('store:canUndo'),
  canRedo: () => ipcRenderer.invoke('store:canRedo'),
  undo: () => ipcRenderer.invoke('store:undo'),
  redo: () => ipcRenderer.invoke('store:redo'),
  getUndoStack: () => ipcRenderer.invoke('store:getUndoStack')
}
);
