import React from 'react'
import styled from 'styled-components'
import { AiOutlinePlus } from 'react-icons/ai'
import { Card } from '@material-ui/core'

const Root = styled.div`
  width: 402px;
  height: 100%;
  scrollbar-width: thin;
  overflow: hidden auto;
  border-right: 2px solid rgb(234, 232, 229);
  display: inline-block;
`
const Container = styled.div`
  width: 400px;
  min-height: 100%;
  padding: 30px 20px 90px;
  position: relative;
`
const ProjectCard = styled.button`
  background: transparent;
  width: 100%;
  height: 180px;
  border: 1px solid rgb(234, 232, 229);
  margin-top: 20px;
  transition: transform 0.15s ease-in-out !important;

  &:hover {
    transform: scale(1.01);
  }
`
const PreviewImg = styled.div<{ img: string }>`
  background: url(${(props) => props.img}) rgb(234, 232, 229);
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  width: 100%;
  height: 150px;
`
const ProjectInfo = styled.div`
  width: 100%;
  height: 30px;
  line-height: 25px;
  font-size: 14px;
  padding: 0 10px;
  text-align: left;
`
const CreateProjectButton = styled.button`
  background: transparent;
  width: 100%;
  height: 40px;
  border: 1px solid rgb(234, 232, 229);
  margin-top: 20px;
  transition: transform 0.15s ease-in-out !important;

  &:hover {
    transform: scale(1.01);
  }

  > * {
    vertical-align: middle;
  }
`

export default function Projects (): React.ReactElement {
  return (
    <Root>
      <Container>
        <h2 style={{ marginBottom: '10px' }}>Projects</h2>
        <Card component={ProjectCard}>
          <PreviewImg img="https://i.imgur.com/pM68iou.jpeg"/>
          <ProjectInfo>Project Name</ProjectInfo>
        </Card>
        <Card component={ProjectCard}>
          <PreviewImg img="https://i.imgur.com/pM68iou.jpeg"/>
          <ProjectInfo>Project Name</ProjectInfo>
        </Card>
        <Card component={CreateProjectButton}>
          <AiOutlinePlus /> <span>Create Project</span>
        </Card>
      </Container>
    </Root>
  )
}
