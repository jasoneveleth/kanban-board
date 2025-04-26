const { app, BrowserWindow, ipcMain, session } = require('electron')
const path = require('path')
const os = require('os')
const url = require('url')
const fs = require('fs')
const todoStore = require('./src/store').default

let mainWindow

const reactDevToolsPath = path.join(
  os.homedir(),
  '/Library/Application Support/Arc/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/6.1.1_0',
)

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src/preload.js'),
      enableRemoteModule: false,
    },
  })

  if (fs.existsSync(reactDevToolsPath)) {
    await session.defaultSession.loadExtension(reactDevToolsPath)
  }

  if (process.env.NODE_ENV === 'development') {
    const devUrl = 'http://localhost:5173/'
    mainWindow.loadURL(devUrl)

    // Hot reload implementation
    mainWindow.webContents.on('did-fail-load', () => {
      setTimeout(() => {
        mainWindow.loadURL(devUrl)
      }, 1000)
    })
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Set up IPC handlers for the store
ipcMain.handle('store:getTasks', () => {
  return todoStore.getTasks()
})

ipcMain.handle('store:getTask', (_, id) => {
  return todoStore.getTask(id)
})

ipcMain.handle('store:getColumns', () => {
  return todoStore.getColumns()
})

ipcMain.handle('store:createTask', (_, taskData, columnName) => {
  return todoStore.createTask(taskData, columnName)
})

ipcMain.handle('store:updateTask', (_, id, task) => {
  return todoStore.updateTask(id, task)
})

ipcMain.handle(
  'store:moveTaskBtwnCol',
  (_, taskId, fromColumn, toColumn, newIndex) => {
    return todoStore.moveTaskBtwnCol(taskId, fromColumn, toColumn, newIndex)
  },
)

ipcMain.handle('store:moveTaskInCol', (_, taskId, columnName, isUp) => {
  return todoStore.moveTaskInCol(taskId, columnName, isUp)
})

ipcMain.handle('store:deleteTask', (_, id) => {
  return todoStore.deleteTask(id)
})

ipcMain.handle('store:updateColumns', (_, newIdLists, operationDetails) => {
  return todoStore.updateColumns(newIdLists, operationDetails)
})

ipcMain.handle('store:canUndo', () => {
  return todoStore.canUndo()
})

ipcMain.handle('store:canRedo', () => {
  return todoStore.canRedo()
})

ipcMain.handle('store:undo', () => {
  return todoStore.undo()
})

ipcMain.handle('store:redo', () => {
  return todoStore.redo()
})

ipcMain.handle('store:getUndoStack', () => {
  return todoStore.getUndoStack()
})
