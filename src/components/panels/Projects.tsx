import React, { useContext } from 'react'
import styled from 'styled-components'
import { AiOutlinePlus } from 'react-icons/ai'
import { Card } from '@material-ui/core'
import { DatabaseContext } from '../../contexts/DatabaseContext'
import { useLiveQuery } from 'dexie-react-hooks'
import { AppAction, AppContext } from '../../contexts/AppContext'

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
  cursor: pointer;

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
  cursor: pointer;

  &:hover {
    transform: scale(1.01);
  }

  > * {
    vertical-align: middle;
  }
`

export default function Projects (): React.ReactElement {
  const db = useContext(DatabaseContext)!
  const { dispatchAppState } = useContext(AppContext)!
  const projects = useLiveQuery(
    () => db.projects.toArray()
  )

  return (
    <Root>
      <Container>
        <h2 style={{ marginBottom: '10px' }}>Projects</h2>
        {projects?.map(project => (
          <Card component={ProjectCard} key={project.id} onClick={() => dispatchAppState({
            action: AppAction.OPEN_PROJECT,
            payload: { projectId: project.id }
          })}>
            <PreviewImg img={project.preview}/>
            <ProjectInfo>{project.name}</ProjectInfo>
          </Card>
        ))}
        <Card component={CreateProjectButton}>
          <AiOutlinePlus /> <span>Create Project</span>
        </Card>
      </Container>
    </Root>
  )
}
