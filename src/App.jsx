import Board from './components/board.jsx'
import { TaskProvider } from './components/StateManager.jsx';

function App() {
  return (
    <>
      <h1>Hello Corinne!!</h1>
	  <TaskProvider>
		<Board/>
	  </TaskProvider>
    </>
  )
}

export default App
