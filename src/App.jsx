import Board from './components/board.jsx'
import { TaskProvider } from './components/StateManager.jsx'

function App() {
  return (
    <div className="pl-32">
      <div className="h-20" />
      <h1>Go Off King</h1>
      <br />
      <TaskProvider>
        <Board />
      </TaskProvider>
    </div>
  )
}

export default App
