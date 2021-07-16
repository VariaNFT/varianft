import React from 'react'
import styled from 'styled-components'

const Root = styled.div`
  width: 302px;
  height: 100%;
  scrollbar-width: thin;
  overflow: hidden auto;
  border-right: 2px solid rgb(234, 232, 229);
  display: inline-block;
`
const Container = styled.div`
  width: 300px;
  min-height: 100%;
  padding: 30px 20px 90px;
  position: relative;
`

export default function Mint (): React.ReactElement {
  return (
    <Root>
      <Container>
        <h2>Mint</h2>
      </Container>
    </Root>
  )
}
