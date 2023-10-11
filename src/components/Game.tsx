import { useCallback, useEffect, useReducer, useRef } from 'react'
import { Card } from './Card'
import { CardStatus, ICardState } from '../types.d'
import styled from 'styled-components'

interface IProps {
  symbols: string[]
  memoryTime: number
}

enum ActionType {
  setStatus = 'setStatus',
  setMatched = 'setMatched',
  restart = 'restart',
  resetGame = 'resetGame',
  shuffle = 'shuffle',
  setAllFacedown = 'setAllFacedown',
  setAllFaceUp = 'setAllFaceUp',
  setGameStarted = 'setGameStarted',
  setCurrentPairingCard = 'setCurrentPairingCard',
  setGameFinished = 'setGameFinished',
}

type CardStatePayload = Omit<ICardState, symbol>
type PairingCardPayload = ICardState | null
type IsGameStartedPayload = boolean
type ActionPayload = CardStatePayload | IsGameStartedPayload | PairingCardPayload
interface Action {
  type: ActionType
  payload?: ActionPayload
}

interface GameState {
  cardsState: ICardState[]
  started: boolean
  startedTime: number | null
  finishedTime: number | null
  totalTime: number | 0
  currentPairingCard: ICardState | null
  score: number
}

const initCards = (symbols: string[]): ICardState[] => {
  const _tmpArray = [...symbols]
  // 每次随机产生一个下标和最后位置的元素进行互换
  for (let i = 0; i < _tmpArray.length; i++) {
    const randomIndex = Math.floor(Math.random() * _tmpArray.length)
    const randomElement = _tmpArray[randomIndex]
    const tailElement = _tmpArray.pop()
    _tmpArray.push(randomElement)
    _tmpArray[randomIndex] = tailElement as string
  }

  const result = _tmpArray.reduce((acc, ele, i) => {
    acc.push({
      id: i,
      symbol: ele,
      status: CardStatus.facedown,
      matched: false,
    } as ICardState)
    return acc
  }, [] as ICardState[])
  // console.log('symbols :>> ', result)
  return result
}

const initState: GameState = {
  cardsState: [],
  currentPairingCard: null,
  started: false,
  startedTime: null,
  finishedTime: null,
  totalTime: 0,
  score: 0,
}

function gameReducer(state: GameState, action: Action) {
  switch (action.type) {
    case ActionType.setStatus: {
      if (!action.payload) return state
      const index = state.cardsState.findIndex((item) => item.id === (action.payload as CardStatePayload).id)
      state.cardsState[index].status = (action.payload as CardStatePayload).status
      return { ...state }
    }

    // setMatched and check game finished
    case ActionType.setMatched: {
      if (!action.payload) return state
      const index = state.cardsState.findIndex((item) => item.id === (action.payload as CardStatePayload).id)
      state.cardsState[index].matched = (action.payload as CardStatePayload).matched
      isGameFinished()
      return { ...state }
    }

    case ActionType.shuffle: {
      const cardsState = initCards(state.cardsState.map((card) => card.symbol))
      const _state = { ...state, cardsState }
      return _state
    }

    case ActionType.setAllFacedown: {
      state.cardsState.forEach((c) => (c.status = CardStatus.facedown))
      return { ...state }
    }

    case ActionType.setAllFaceUp: {
      state.cardsState.forEach((c) => (c.status = CardStatus.faceup))
      return { ...state }
    }

    case ActionType.setGameStarted: {
      state.started = action.payload as IsGameStartedPayload
      if (state.started) {
        state.startedTime = new Date().getTime()
        state.finishedTime = null
      }
      return { ...state }
    }

    case ActionType.resetGame: {
      return { ...initState, cardsState: state.cardsState }
    }

    case ActionType.setCurrentPairingCard: {
      state.currentPairingCard = action.payload as PairingCardPayload
      return { ...state }
    }
    default:
      return state
  }

  function isGameFinished() {
    const isFinish = state.cardsState.reduce((result, item) => result && item.matched, true)
    isFinish && gameFinishedEffect()
    return isFinish
  }

  function gameFinishedEffect() {
    state.finishedTime = new Date().getTime()
    state.currentPairingCard = null
    state.totalTime = state.startedTime ? state.finishedTime - state.startedTime : 0
    state.started = false
  }
}

const Game = ({ symbols, memoryTime }: IProps) => {
  const [gameState, dispatch] = useReducer(gameReducer, initState, () => {
    return { ...initState, cardsState: initCards(symbols) }
  })

  const timeCount = useRef(0)
  const gameFinished = useRef(false)
  const escapedTime = useRef<HTMLSpanElement>(null)

  const startTimer = useRef<number | null>(null)

  const flipCardUp = (card: ICardState) => {
    dispatch({ type: ActionType.setStatus, payload: { ...card, status: CardStatus.faceup } })
  }

  const onClickCard = (card: ICardState) => {
    if (!gameState.started) return
    flipCardUp(card)
    checkMatched(card)
  }

  const checkMatched = (card: ICardState) => {
    if (card.matched) return

    // 1. cancel current pairing card if click pairingCard self
    if (gameState.currentPairingCard && card.id === gameState.currentPairingCard.id) {
      dispatch({ type: ActionType.setCurrentPairingCard, payload: null })
      dispatch({ type: ActionType.setStatus, payload: { ...card, status: CardStatus.facedown } })
      return
    }

    // 2. set current pairing card if have no currentPairing card yet
    if (gameState.currentPairingCard === null && !card.matched) {
      dispatch({ type: ActionType.setCurrentPairingCard, payload: card })
      dispatch({ type: ActionType.setStatus, payload: { ...card, status: CardStatus.faceup } })
    }

    // 3. check the card if match current pairing card when currentPairing card existed
    if (gameState.currentPairingCard && !card.matched) {
      // matched -> setMatched , and reset current pairing card null
      if (gameState.currentPairingCard.symbol === card.symbol) {
        dispatch({ type: ActionType.setMatched, payload: { ...card, matched: true } })
        dispatch({ type: ActionType.setMatched, payload: { ...gameState.currentPairingCard, matched: true } })
        dispatch({ type: ActionType.setCurrentPairingCard, payload: null })
      } else {
        // flip facedown when is not matched
        setTimeout(() => {
          dispatch({ type: ActionType.setStatus, payload: { ...card, status: CardStatus.facedown } })
        }, 500)
      }
    }
  }

  const restartGame = () => {
    dispatch({ type: ActionType.resetGame })
    dispatch({ type: ActionType.shuffle })
    startGame()
  }

  useEffect(() => {
    gameFinished.current = gameState.finishedTime !== null
  }, [gameState.finishedTime])

  const updateTimeCount = useCallback(() => {
    if (gameFinished.current) return
    const timeCounting = gameState.startedTime !== null && gameState.startedTime > 0
    if (gameState.started && timeCounting && gameState.startedTime) {
      timeCount.current = Date.now() - gameState.startedTime
      // update dom
      if (escapedTime.current) {
        escapedTime.current.innerText = timeCount.current.toString()
      }
    }

    // console.log(timeCount.current, 'timestamp:', timestamp)
    // console.log(timeCount.current)
    requestAnimationFrame(updateTimeCount)
  }, [gameState.started, gameState.startedTime])

  // count escape time since game started
  useEffect(() => {
    const timeCounting = !!timeCount.current
    if (gameState.started && !timeCounting) {
      requestAnimationFrame(updateTimeCount)
    }
  }, [gameState.started, updateTimeCount])

  const startGame = useCallback(() => {
    const _fn = () => {
      dispatch({ type: ActionType.setAllFaceUp })
      // start game after user memory time
      startTimer.current = setTimeout(() => {
        dispatch({ type: ActionType.setAllFacedown })
        dispatch({ type: ActionType.setCurrentPairingCard, payload: null })
        dispatch({ type: ActionType.setGameStarted, payload: true })
        timeCount.current = 0
        // requestAnimationFrame(updateTimeCount)
        if (startTimer.current) clearTimeout(startTimer.current)
      }, memoryTime)
    }
    if (startTimer.current) {
      clearTimeout(startTimer.current)
    }

    _fn()
  }, [memoryTime])

  const isCurrentPairing = (card: ICardState) => {
    return gameState.currentPairingCard !== null && card.id === gameState.currentPairingCard.id
  }

  useEffect(() => {
    startGame()
  }, [startGame])

  const cardsExist = gameState.cardsState.length > 0
  if (!cardsExist) return null

  return (
    <S.Container>
      <div className="grid grid-cols-5 ">
        {gameState.cardsState.map((cardData) => (
          <Card key={cardData.id} isCurrentPairing={isCurrentPairing(cardData)} status={cardData.status} symbol={cardData.symbol} gameStarted={gameState.started} onClickCard={() => onClickCard(cardData)} matched={cardData.matched}></Card>
        ))}
      </div>

      <div className="flex gap-5">
        <S.StartButton
          onClick={restartGame}
          disabled={!gameFinished.current && gameState.started}
          className={`${!gameFinished.current && gameState.started ? 'bg-gray-500' : ''} mt-5 rounded-lg px-5 py-1 tracking-widest bg-pink-500 hover:bg-pink-400 active:bg-pink-300 text-white font-bold text-[20px] font-serif italic`}
        >
          restart
        </S.StartButton>
        <S.StartButton className={`${!gameState.started && !gameState.finishedTime ? 'hidden' : 'flex'} w-60 mt-5 rounded-lg px-5 py-1 tracking-widest bg-pink-500 hover:bg-pink-400 active:bg-pink-300 text-white font-bold text-[20px] font-serif italic`}>
          <span className={`${gameState.finishedTime ? 'hidden' : 'block'}`}>
            escaped: <span ref={escapedTime}></span>
          </span>
          <span className={`${gameState.finishedTime ? 'block' : 'hidden'}`}>total: {(timeCount.current / 1000).toFixed(2)} s</span>
        </S.StartButton>
      </div>
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `,
  StartButton: styled.button`
    &:hover {
      animation: headShake;
      animation-duration: 1s;
    }
  `,
}

export default Game
