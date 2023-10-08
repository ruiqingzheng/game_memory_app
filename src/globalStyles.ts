import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0; 
    box-sizing: border-box;
    height: 100vh;
    width: 100vw;
    background-color: #010203
  }
`

// card base style
export const cardStyling = `
  height: 100px;
  width: 75px;
  border-radius: 12px;
  border-width: 3px;
  margin: 10px;
  font-size: 50px;
  border-color: violet;
  background-color: #fff
`
