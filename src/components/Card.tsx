import { CardStatus } from '../types.d'
import { cardStyling } from '../globalStyles'
import styled from 'styled-components'
import { useState } from 'react'

interface IProps {
  status: CardStatus // faceup or facedown
  symbol: string
  matched: boolean // matched : card exam result
  gameStarted: boolean
  onClickCard: () => void
  isCurrentPairing: boolean
}

export const Card = ({ status, symbol, onClickCard, matched, gameStarted, isCurrentPairing }: IProps) => {
  const [isFlipping, setIsFlipping] = useState(false)

  const _onClick = () => {
    if (!gameStarted) return
    onClickCard()
    flipCardAnimate()
  }

  const flipCardAnimate = () => {
    if (matched) return
    setIsFlipping(true)
    const x = setTimeout(() => {
      setIsFlipping(false)
      if (x) clearTimeout(x)
    }, 500)
  }

  return (
    <S.Card onClick={_onClick} matched={matched} isFlipping={isFlipping} isCurrentPairing={isCurrentPairing} className="grid place-content-center bg-yellow-400">
      {status === CardStatus.faceup ? symbol : ''}
    </S.Card>
  )
}

const S = {
  Card: styled.div<{ matched: boolean; isFlipping: boolean; isCurrentPairing: boolean }>`
    ${cardStyling}
    border-color: ${(p) => (p.matched || p.isFlipping ? '#FF9A00' : 'violet')};
    background-color: ${(p) => (p.matched || (p.isFlipping && !p.isCurrentPairing) ? '#AB0097' : p.isCurrentPairing ? 'rgb(251, 191, 36)' : '#ffCFCF')};
    animation: ${(p) => (p.isFlipping ? 'flipInY' : p.matched ? 'tada' : 'swing')};
    animation-duration: 0.5s;
  `,
}
