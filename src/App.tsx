import { useState } from 'react'
import { Card } from './components/Card'
import { CardStatus } from './types.d'
import styled from 'styled-components'
function App() {
  const [cardState, setCardState] = useState<CardStatus>(CardStatus.faceup)
  const [cardMatched, setCardMatched] = useState<boolean>(true)

  const toggleCard = () => {
    setCardState((prevState) => {
      return prevState === CardStatus.faceup ? CardStatus.facedown : CardStatus.faceup
    })
  }

  const toggleMatched = () => {
    setCardMatched((prev) => !prev)
  }

  const onClickCard = () => {
    toggleCard()
    toggleMatched()
  }

  return (
    <S.Container>
      <Card status={cardState} symbol="😀" onClickCard={onClickCard} matched={cardMatched}></Card>
    </S.Container>
  )
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

export default App
