import React, { useContext } from 'react'
import styled, { css } from 'styled-components'
import { AppAction, AppContext } from '../contexts/AppContext'
import { AiTwotoneFolderOpen } from 'react-icons/ai'
import { GoGear } from 'react-icons/go'
import { IoCreate, IoHelpCircle } from 'react-icons/io5'
import Page from '../types/Page'

const Root = styled.div`
  width: 82px;
  height: 100%;
  scrollbar-width: thin;
  overflow: hidden auto;
  border-right: 2px solid rgb(244, 232, 229);
`
const Container = styled.div`
  width: 80px;
  min-height: 100%;
  padding: 30px 0 90px;
  position: relative;
`

const Button = styled.button<{ active: boolean }>`
  background: transparent;
  border: none;
  text-align: center;
  color: rgb(180, 180, 180);
  margin-bottom: 20px;
  display: block;
  width: 100%;
  svg {
    color: rgb(190, 190, 190);
    font-size: 25px;
    width: 40px;
    height: 40px;
    padding: 8px;
    border-radius: 50%;
  }
  span {
    font-size: 12px;
    display: block;
  }

  ${(props) => props.active
? css`
    color: rgb(67, 168, 155);
    svg {
      color: rgb(67, 168, 155);
      background-color: rgb(169, 221, 214);
    }
  `
: css`
  &:hover {
    svg {
      color: rgb(180, 180, 180);
      background-color: rgb(240, 240, 240);
    }
  }
  `}
`

const DocsButton = styled.a`
  background: transparent;
  border: none;
  text-align: center;
  color: rgb(180, 180, 180);
  position: absolute;
  bottom: 30px;
  left: 29px;
  svg {
    color: rgb(190, 190, 190);
    width: 22px;
    height: 22px;
    border-radius: 50%;
  }

  &:hover {
    svg {
      color: rgb(180, 180, 180);
    }
  }
`

export default function Sidebar (): React.ReactElement {
  const { appState, dispatchAppState } = useContext(AppContext)!
  return (
    <Root>
      <Container>
        <Button
          active={appState.page === Page.PROJECT}
          onClick={() => dispatchAppState({
            action: AppAction.SWITCH_PAGE,
            payload: { page: Page.PROJECT }
          })}
        >
          <AiTwotoneFolderOpen />
          <span>Projects</span>
        </Button>
        <Button
          active={appState.page === Page.SETTING}
          onClick={() => dispatchAppState({
            action: AppAction.SWITCH_PAGE,
            payload: { page: Page.SETTING }
          })}
        >
          <GoGear />
          <span>Setting</span>
        </Button>
        <Button
          active={appState.page === Page.MINT}
          onClick={() => dispatchAppState({
            action: AppAction.SWITCH_PAGE,
            payload: { page: Page.MINT }
          })}
        >
          <IoCreate style={{ transform: 'translateX(1px) translateY(-2px)' }}/>
          <span>Mint</span>
        </Button>
        <DocsButton href="https://docs.memberory.limaois.me/" target="_blank" referrerPolicy="no-referrer">
          <IoHelpCircle />
        </DocsButton>
      </Container>
    </Root>
  )
}
