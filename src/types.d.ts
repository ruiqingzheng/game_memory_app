
/*** 
  card status
	1. faceup , --- turned up
  2. facedown , ---   back 
 * **/
export enum CardStatus {
  faceup = 'faceup',
  facedown = 'facedown',
}

export interface ICardState {
  id: number | string
  symbol: string
  status: CardStatus
  matched: boolean
}
