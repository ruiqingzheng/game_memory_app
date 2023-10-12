import Game from './components/Game'
function App() {
  // const symbolsLib = ['🤡', '🤖', '🎃', '🧠', '👑', '🦄', '🍀', '🐲', '🦋', '❤️‍🔥', '😀', '🐸', '🦆', '🐢', '🐠']
  const symbolsLib = ['🍓', '🍉','🫐', '⏰', '🔑', '🌽','🐸','🦆', '🐢', '🐠']
  const symbols = [...symbolsLib, ...symbolsLib]
  const memoryTime = 1000 * 5
  return <Game symbols={symbols} memoryTime={memoryTime} />
}

export default App
