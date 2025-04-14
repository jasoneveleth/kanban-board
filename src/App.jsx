import Board from './components/board.jsx'
import { TaskProvider } from './components/StateManager.jsx';

function App() {
  return (
    <>
      <h1 className="m-20">Hello Corinne!!</h1>
	  <br/>
	  <TaskProvider>
		<Board/>
	  </TaskProvider>
    </>
  )
}

export default App
