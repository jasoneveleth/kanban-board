import React, { useState } from 'react'
import Card from './card.jsx'
import { useTaskContext } from './StateManager.jsx'

function KeyIcon({ letter, tooltip, ...props }) {
  return (
    <span
      className="inline-flex items-center justify-center bg-white h-20 w-20 border border-gray-300 rounded shadow-sm text-xs font-medium mr-8"
      {...props}>
      {letter}
    </span>
  )
}

// Usage
function Board() {
  const { colState, dragging, createNewTask } = useTaskContext()
  const colNames = Object.keys(colState)

  const tasks = (colName) => {
    let taskList = colState[colName].map((id) => (
      <Card key={id} id={id} isplaceholder={id === dragging.id} />
    ))
    return taskList
  }

  const addTaskClicked = (name) => {
    createNewTask(name)
  }

  return (
    <div className="w-full h-full relative flex flex-row gap-20">
      {colNames.map((name) => (
        <div key={name} className="flex flex-col gap-10 min-w-260">
          <h2 className="font-semibold ml-5">{name}</h2>
          {tasks(name)}

          <div
            className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded"
            onClick={() => addTaskClicked(name)}>
            <KeyIcon letter="A" tooltip="Press A" />
            <span>Add Task</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Board
