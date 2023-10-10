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
  setCurrentPairingCard = 'setCurrentPairingCard',
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
  currentPairingCard: ICardState | null
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

    case ActionType.setCurrentPairingCard: {
      state.currentPairingCard = action.payload as PairingCardPayload
      return { ...state }
    }
    default:
      return state
  }
}

const initState: GameState = {
  cardsState: [],
  currentPairingCard: null,
  started: false,
}

const Game = ({ symbols }: IProps) => {
  const [gameState, dispatch] = useReducer(gameReducer, initState, () => {
    return { ...initState, cardsState: initCards(symbols) }
  })

  // current pairing card
  // const [currentPairingCard, setCurrentPairingCard] = useState<ICardState | null>(null)

  const startTimer = useRef<number | null>(null)

  const flipCard = (card: ICardState) => {
    // if (card.matched) return
    // const _card: ICardState = { ...card, status: card.status === CardStatus.facedown ? CardStatus.faceup : CardStatus.facedown }
    dispatch({ type: ActionType.setStatus, payload: { ...card, status: CardStatus.faceup } })
  }

  // const toggleMatched = (card: ICardState) => {
  //   const _card: ICardState = { ...card, matched: !card.matched }
  //   dispatch({ type: ActionType.setMatched, payload: _card })
  // }

  const onClickCard = (card: ICardState) => {
    if (!gameState.started) return
    flipCard(card)
    checkMatched(card)
    // toggleMatched(card)
  }

  const checkMatched = (card: ICardState) => {
    if (card.matched) return

    if (gameState.currentPairingCard && card.id === gameState.currentPairingCard.id) return

    // set current pairing card
    if (gameState.currentPairingCard === null && !card.matched) {
      dispatch({ type: ActionType.setCurrentPairingCard, payload: card })
      dispatch({ type: ActionType.setStatus, payload: { ...card, status: CardStatus.faceup } })
    }

    // check card if match current pairing card
    if (gameState.currentPairingCard && !card.matched) {
      if (gameState.currentPairingCard.symbol === card.symbol) {
        dispatch({ type: ActionType.setMatched, payload: { ...card, matched: true } })
        dispatch({ type: ActionType.setMatched, payload: { ...gameState.currentPairingCard, matched: true } })
        dispatch({ type: ActionType.setCurrentPairingCard, payload: null })
      } else {
        setTimeout(() => {
          dispatch({ type: ActionType.setStatus, payload: { ...card, status: CardStatus.facedown } })
        }, 500)
      }
    }
  }

  const restartGame = () => {
    dispatch({ type: ActionType.setGameStarted, payload: false })
    dispatch({ type: ActionType.setCurrentPairingCard, payload: null })
    dispatch({ type: ActionType.shuffle })

    startGame()
  }

  const startGame = () => {
    const _fn = () => {
      dispatch({ type: ActionType.setAllFaceUp })
      startTimer.current = setTimeout(() => {
        dispatch({ type: ActionType.setAllFacedown })
        dispatch({ type: ActionType.setCurrentPairingCard, payload: null })
        dispatch({ type: ActionType.setGameStarted, payload: true })
        if (startTimer.current) clearTimeout(startTimer.current)
      }, 3000)
    }
    if (startTimer.current) {
      clearTimeout(startTimer.current)
    }

    _fn()
  }

  const isCurrentPairing = (card: ICardState) => {
    return gameState.currentPairingCard !== null && card.id === gameState.currentPairingCard.id
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
          <Card key={cardData.id} isCurrentPairing={isCurrentPairing(cardData)} status={cardData.status} symbol={cardData.symbol} gameStarted={gameState.started} onClickCard={() => onClickCard(cardData)} matched={cardData.matched}></Card>
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
