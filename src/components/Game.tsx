import { useReducer } from 'react'
import { Card } from './Card'
import { CardStatus, ICardState } from '../types.d'
import styled from 'styled-components'

interface IProps {
  symbols: string[]
}

enum ActionType {
  setStatus = 'setStatus',
  setMatched = 'setMatched',
}

interface Action {
  type: ActionType
  payload: Omit<ICardState, symbol>
}

interface GameState {
  cardsState: ICardState[]
}

const initCards = (symbols: string[]): ICardState[] => {
  const _tmpArray = [...symbols]
  const result = []
  for (let i = 0; i < _tmpArray.length; i++) {
    const randomIndex = Math.floor(Math.random() * _tmpArray.length)
    const [_symbol] = _tmpArray.splice(randomIndex, 1)
    result.push({
      id: i,
      symbol: _symbol,
      status: CardStatus.faceup,
      matched: false,
    } as ICardState)
  }
  return result
}

function gameReducer(state: GameState, action: Action) {
  switch (action.type) {
    case ActionType.setStatus: {
      const index = state.cardsState.findIndex((item) => item.id === action.payload.id)
      state.cardsState[index].status = action.payload.status
      return { ...state }
    }
    case ActionType.setMatched: {
      const index = state.cardsState.findIndex((item) => item.id === action.payload.id)
      state.cardsState[index].matched = action.payload.matched
      return { ...state }
    }
    default:
      return state
  }
}

const Game = ({ symbols }: IProps) => {
  const [gameState, dispatch] = useReducer(gameReducer, { cardsState: [] }, () => {
    return { cardsState: initCards(symbols) }
  })
  // const cardsInitState = initCards(symbols)

  const toggleCard = (card: ICardState) => {
    const _card: ICardState = { ...card, status: card.status === CardStatus.facedown ? CardStatus.faceup : CardStatus.facedown }
    dispatch({ type: ActionType.setStatus, payload: _card })
  }

  const toggleMatched = (card: ICardState) => {
    const _card: ICardState = { ...card, matched: !card.matched }
    dispatch({ type: ActionType.setMatched, payload: _card })
  }

  const onClickCard = (card: ICardState) => {
    toggleCard(card)
    toggleMatched(card)
  }

  const cardsExist = gameState.cardsState.length > 0

  return <S.Container>{cardsExist && gameState.cardsState.map((cardData) => <Card key={cardData.id} status={cardData.status} symbol={cardData.symbol} onClickCard={() => onClickCard(cardData)} matched={cardData.matched}></Card>)}</S.Container>
}

const S = {
  Container: styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
}

export default Game
