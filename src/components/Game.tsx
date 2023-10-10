import { useEffect, useReducer, useRef } from 'react'
import { Card } from './Card'
import { CardStatus, ICardState } from '../types.d'
import styled from 'styled-components'

interface IProps {
  symbols: string[]
}

enum ActionType {
  setStatus = 'setStatus',
  setMatched = 'setMatched',
  restart = 'restart',
  shuffle = 'shuffle',
  setAllFacedown = 'setAllFacedown',
  setAllFaceUp = 'setAllFaceUp',
  setGameStarted = 'setGameStarted',
}

type CardStatePayload = Omit<ICardState, symbol>
type IsGameStartedPayload = boolean
type ActionPayload = CardStatePayload | IsGameStartedPayload
interface Action {
  type: ActionType
  payload?: ActionPayload
}

interface GameState {
  cardsState: ICardState[]
  started: boolean
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

function gameReducer(state: GameState, action: Action) {
  switch (action.type) {
    case ActionType.setStatus: {
      if (!action.payload) return state
      const index = state.cardsState.findIndex((item) => item.id === (action.payload as CardStatePayload).id)
      state.cardsState[index].status = (action.payload as CardStatePayload).status
      return { ...state }
    }
    case ActionType.setMatched: {
      if (!action.payload) return state
      const index = state.cardsState.findIndex((item) => item.id === (action.payload as CardStatePayload).id)
      state.cardsState[index].matched = (action.payload as CardStatePayload).matched
      return { ...state }
    }

    case ActionType.shuffle: {
      const cardsState = initCards(state.cardsState.map((card) => card.symbol))
      // cardsState.forEach((c) => (c.status = CardStatus.faceup))
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
      return { ...state }
    }

    case ActionType.restart: {
      const cardsState = initCards(state.cardsState.map((card) => card.symbol))
      // 显示 3 秒
      cardsState.forEach((c) => (c.status = CardStatus.faceup))
      const _state = { ...state, cardsState }
      setTimeout(() => {
        _state.cardsState.forEach((c) => (c.status = CardStatus.facedown))
      }, 3000)
      return _state
    }
    default:
      return state
  }
}

const initState: GameState = {
  cardsState: [],
  started: false,
}

const Game = ({ symbols }: IProps) => {
  const [gameState, dispatch] = useReducer(gameReducer, initState, () => {
    return { ...initState, cardsState: initCards(symbols) }
  })

  const startTimer = useRef<number | null>(null)

  const toggleCard = (card: ICardState) => {
    const _card: ICardState = { ...card, status: card.status === CardStatus.facedown ? CardStatus.faceup : CardStatus.facedown }
    dispatch({ type: ActionType.setStatus, payload: _card })
  }

  const toggleMatched = (card: ICardState) => {
    const _card: ICardState = { ...card, matched: !card.matched }
    dispatch({ type: ActionType.setMatched, payload: _card })
  }

  const onClickCard = (card: ICardState) => {
    if (!gameState.started) return
    toggleCard(card)
    toggleMatched(card)
  }

  const restartGame = () => {
    dispatch({ type: ActionType.setGameStarted, payload: false })
    dispatch({ type: ActionType.shuffle })

    startGame()
  }

  const startGame = () => {
    const _fn = () => {
      dispatch({ type: ActionType.setAllFaceUp })
      startTimer.current = setTimeout(() => {
        dispatch({ type: ActionType.setAllFacedown })
        dispatch({ type: ActionType.setGameStarted, payload: true })
        if (startTimer.current) clearTimeout(startTimer.current)
      }, 3000)
    }
    if (startTimer.current) {
      clearTimeout(startTimer.current)
    }

    _fn()
  }

  useEffect(() => {
    startGame()
  }, [])

  const cardsExist = gameState.cardsState.length > 0
  if (!cardsExist) return null

  return (
    <S.Container>
      <div className="grid grid-cols-5 ">
        {gameState.cardsState.map((cardData) => (
          <Card key={cardData.id} status={cardData.status} symbol={cardData.symbol} onClickCard={() => onClickCard(cardData)} matched={cardData.matched}></Card>
        ))}
      </div>
      <S.StartButton onClick={restartGame} className="mt-5 rounded-lg px-5 py-1 tracking-widest bg-pink-500 hover:bg-pink-400 active:bg-pink-300 text-white font-bold text-[20px] font-serif italic">
        restart
      </S.StartButton>
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
