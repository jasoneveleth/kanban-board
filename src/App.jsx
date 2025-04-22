import Board from './components/board.jsx'
import { TaskProvider } from './components/StateManager.jsx';

function App() {
  return (
    <>
      <div className="h-20"/>
      <h1>Hello Corinne!!</h1>
	  <br/>
	  <TaskProvider>
		<Board/>
	  </TaskProvider>
    </>
  )
}

export default App
