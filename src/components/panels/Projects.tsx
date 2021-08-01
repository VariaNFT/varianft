import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { AiOutlinePlus } from 'react-icons/ai'
import {
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@material-ui/core'
import { DatabaseContext } from '../../contexts/DatabaseContext'
import { useLiveQuery } from 'dexie-react-hooks'
import { AppAction, AppContext, Page } from '../../contexts/AppContext'
import { ProjectContext } from '../../contexts/ProjectContext'
import { useEthers } from '@usedapp/core'

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
  const { loadProject } = useContext(ProjectContext)!
  const projects = useLiveQuery(
    () => db.projects.toArray()
  )
  const [openForm, setOpenForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const { activateBrowserWallet, error } = useEthers()

  useEffect(() => {
    if (!error) return
    dispatchAppState({
      action: AppAction.PUSH_TOAST,
      payload: {
        color: 'error',
        message: 'Cannot connect to wallet, be sure you are using Mainnet, Ropsten, or Rinkeby, others are not supported yet'
      }
    })
  }, [error])

  function createProject () {
    db.projects.add({
      name: newProjectName,
      preview: 'https://i.imgur.com/pM68iou.jpeg', // Default preview img
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path d="M30,1h40l29,29v40l-29,29h-40l-29-29v-40z" stroke="#000" fill="none"/>
          <path d="M31,3h38l28,28v38l-28,28h-38l-28-28v-38z" fill="#a23"/>
          <text x="50" y="68" font-size="48" fill="#FFF" text-anchor="middle"><![CDATA[410]]></text>
        </svg>
      `, // Default SVG Placeholder
      csv: '',
      data: [],
      attributes: {},
      collection: -1,
    }).then(id => {
      dispatchAppState({
        action: AppAction.OPEN_PROJECT,
        payload: { projectId: id }
      })
      dispatchAppState({
        action: AppAction.SWITCH_PAGE,
        payload: { page: Page.SETTING }
      })
      setNewProjectName('')
      dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'success',
          message: 'Successfully Created Project!'
        }
      })
      loadProject(id)
    }).catch(err => {
      setOpenForm(false)
      console.error(err)
      dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'error',
          message: 'Something Went Wrong!'
        }
      })
    })
  }

  return (
    <Root>
      <Container>
        <h2 style={{ marginBottom: '10px' }}>Projects</h2>
        {projects?.map(project => (
          <Card component={ProjectCard} key={project.id} onClick={() => {
            activateBrowserWallet()
            dispatchAppState({
              action: AppAction.OPEN_PROJECT,
              payload: { projectId: project.id }
            })
            loadProject(project.id!)
          }}>
            <PreviewImg img={project.preview}/>
            <ProjectInfo>{project.name}</ProjectInfo>
          </Card>
        ))}
        <Card component={CreateProjectButton} onClick={() => setOpenForm(true)}>
          <AiOutlinePlus /> <span>Create Project</span>
        </Card>
      </Container>
      <Dialog open={openForm} onClose={() => setOpenForm(false)} scroll="paper" fullWidth={true}>
        <DialogTitle>Create Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Project Name"
            fullWidth
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button color="default" onClick={() => setOpenForm(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={createProject}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  )
}
