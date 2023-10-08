import { CardStatus } from '../types.d'
import { cardStyling } from '../globalStyles'
import styled from 'styled-components'

interface IProps {
  status: CardStatus // faceup or facedown
  symbol: string
  matched: boolean // matched : card exam result
  onClickCard: () => void
}

export const Card = ({ status, symbol, onClickCard, matched }: IProps) => {
  return (
    <S.Card onClick={onClickCard} matched={matched} className="grid place-content-center">
      {status === CardStatus.faceup ? symbol : ''}
    </S.Card>
  )
}

const S = {
  Card: styled.div<{ matched: boolean }>`
    ${cardStyling}
    border-color: ${(p) => (p.matched ? '#FF9A00' : 'violet')};
    background-color: ${(p) => (p.matched ? '#AB0097' : '#ffCFCF')};
    animation: ${(p) => (p.matched ? 'tada' : 'flipInY')};
    animation-duration: 1s;
  `,
}
