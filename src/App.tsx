import Game from './components/Game'
function App() {
  const symbolsLib = ['🤡', '🤖', '🎃', '🧠', '👑', '🦄', '🍀', '🐲', '🦋', '❤️‍🔥']
  const symbols = [...symbolsLib,...symbolsLib]

  return <Game symbols={symbols}/>
}

export default App
