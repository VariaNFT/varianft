import React, { useContext, useEffect, useState, MouseEvent } from 'react'
import styled from 'styled-components'
import { AiOutlinePlus, AiOutlineClose } from 'react-icons/ai'
import {
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  DialogContentText,
} from '@material-ui/core'
import { DatabaseContext } from '../../contexts/DatabaseContext'
import { useLiveQuery } from 'dexie-react-hooks'
import { AppAction, AppContext, Page } from '../../contexts/AppContext'
import { ProjectContext } from '../../contexts/ProjectContext'
import { useEthers } from '@usedapp/core'
import defaultData from '../../contexts/defaultData.json'

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
  > button {
    position: relative;
  }
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
const RemoveBtn = styled.button`
  background: transparent;
  border: none;
  opacity: 0.2;
  transition: opacity .2s;
  position: absolute;
  right: 5px;
  top: 5px;

  :hover {
    opacity: 1;
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
  const [removeProject, setRemoveProject] = useState(0)
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
      preview: defaultData.preview, // Default preview img
      svg: defaultData.svg,
      csv: defaultData.csv,
      data: defaultData.data,
      attributes: defaultData.attributes,
      collection: -1,
    }).then(async (id) => {
      dispatchAppState({
        action: AppAction.OPEN_PROJECT,
        payload: { projectId: id }
      })
      setNewProjectName('')
      dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'success',
          message: 'Successfully Created Project!'
        }
      })
      await loadProject(id)
      dispatchAppState({
        action: AppAction.SWITCH_PAGE,
        payload: { page: Page.SETTING }
      })
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

  function clickRemoveProject (event: MouseEvent<HTMLButtonElement>, projectId: number): void {
    event.stopPropagation()
    setRemoveProject(projectId)
  }

  function confirmRemoveProject (): void {
    db.projects.delete(removeProject)
      .then(() => {
        setRemoveProject(0)
        dispatchAppState({
          action: AppAction.OPEN_PROJECT,
          payload: { projectId: -1 }
        })
        loadProject(-1)
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
            <RemoveBtn onClick={(event) => clickRemoveProject(event, project.id!)}>
              <AiOutlineClose />
            </RemoveBtn>
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
      <Dialog open={removeProject > 0} onClose={() => setRemoveProject(0)} scroll="paper" fullWidth={true}>
        <DialogTitle>Remove Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are going to remove the project <b>{projects?.find(e => e.id === removeProject)?.name}</b>. This action cannot be undone, are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="default" onClick={() => setRemoveProject(0)}>
            Cancel
          </Button>
          <Button color="secondary" onClick={() => confirmRemoveProject()}>
            Yes, Delete It
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  )
}
