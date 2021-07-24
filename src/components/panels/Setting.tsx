import React, { ChangeEvent, useContext, useState, useEffect, useRef, RefObject } from 'react'
import styled from 'styled-components'
import {
  Button,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core'
import { AiOutlinePlus } from 'react-icons/ai'
import { IoHelpCircleOutline } from 'react-icons/io5'
import { ProjectContext } from '../../contexts/ProjectContext'
import { AppAction, AppContext } from '../../contexts/AppContext'
import { parse, parse as parseCSV } from 'papaparse'
import openDataURL from '../../utils/openDataURL'

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
  padding: 30px 20px 60px;
  position: relative;
`
const InputRow = styled.div`
  width: auto;
  font-size: 1.1rem;
  font-weight: 200;
  margin-bottom: 15px;
  min-height: 35px;
`
const InputLabel = styled.label`
  display: inline-block;
  vertical-align: middle;
  width: 30%;
`
const InputControl = styled.div`
  display: inline-block;
  text-align: right;
  width: 70%;
  button {
    margin-left: 10px;
  }
`

export default function Setting (): React.ReactElement {
  const { dispatchAppState } = useContext(AppContext)!
  const { projectState, setProjectState } = useContext(ProjectContext)!
  const [attributes, setAttributes] = useState<Array<[string, string]>>(Object.entries(projectState.attributes))
  const svgInput = useRef<HTMLInputElement>(null)
  const csvInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const newAttributes = Object.fromEntries(attributes)
    setProjectState((prev) => ({
      ...prev,
      attributes: newAttributes,
    }))
  }, [JSON.stringify(attributes)])

  function handleAttributeKeyChange (index: number) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const copy = [...attributes]
      copy[index][0] = event.target.value
      setAttributes(copy)
    }
  }

  function handleAttributeValueChange (index: number) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const copy = [...attributes]
      copy[index][1] = event.target.value
      setAttributes(copy)
    }
  }

  function handleRequiredAttributeValueChange (name: string) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProjectState((prev) => {
        const { attributes } = prev
        attributes[name] = event.target.value
        return {
          ...prev,
          attributes,
        }
      })
    }
  }

  function handleFileUpload (name: 'svg' | 'csv') {
    return (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || event.target.files.length === 0) return
      const fr = new FileReader()
      fr.onerror = (error) => {
        dispatchAppState({
          action: AppAction.PUSH_TOAST,
          payload: {
            color: 'error',
            message: 'Unable to read file: ' + error
          }
        })
      }
      fr.onload = () => {
        setProjectState((prev) => ({
          ...prev,
          [name]: fr.result
        }))
        if (name === 'csv' && fr.result) {
          setProjectState((prev) => ({
            ...prev,
            data: parse(fr.result as string, {
              header: true
            }).data as { [key: string]: string }[],
          }))
        }
      }
      fr.readAsText(event.target.files[0])
    }
  }

  return (
    <Root>
      <Container>
        <h2 style={{ marginBottom: '20px' }}>Setting</h2>
        <InputRow>
          <InputLabel>
            Template:
          </InputLabel>
          <InputControl>
            <Button
              color="primary"
              variant="outlined"
              size="small"
              onClick={() => openDataURL('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(projectState.svg))}
            >Open</Button>
            <input type="file" hidden ref={svgInput} accept="image/svg+xml" onChange={handleFileUpload('svg')} />
            <Button color="primary" variant="contained" size="small" onClick={() => svgInput.current?.click()}>Select</Button>
          </InputControl>
        </InputRow>
        <InputRow>
          <InputLabel>
            Data:
          </InputLabel>
          <InputControl>
            <Button
              color="primary"
              variant="outlined"
              size="small"
              onClick={() => openDataURL('data:text/csv;charset=utf-8,' + encodeURIComponent(projectState.csv))}
            >Open</Button>
            <input type="file" hidden ref={csvInput} accept="text/csv" onChange={handleFileUpload('csv')} />
            <Button color="primary" variant="contained" size="small" onClick={() => csvInput.current?.click()}>Select</Button>
          </InputControl>
        </InputRow>
        <InputRow>
          <InputLabel>
            Collection:
          </InputLabel>
          <InputControl>
            <Select
              style={{ width: '75%' }}
            >
              <MenuItem> {/* Only show for Ropsten and Rinkeby */}
                <Tooltip title="Rarible Protocol provides a contract everyone can mint zir token. By using Rarible, you won't need to deploy your own contract, but the token name and symbol will use Rarible" placement="right">
                  <span>
                    Rarible
                    <IoHelpCircleOutline style={{ marginLeft: '0.5rem', transform: 'translateY(3px)' }} />
                  </span>
                </Tooltip>
              </MenuItem>
              <MenuItem onClick={() => alert()}><em>Create New Collection</em></MenuItem>
            </Select>
          </InputControl>
        </InputRow>
        <InputRow style={{ marginTop: '30px' }}>
          <InputLabel style={{ width: '100%' }}>
            Metadata Attributes:
            <Tooltip title="Check out our document for details" placement="right">
              <a
                style={{ float: 'right', fontSize: '.9rem', color: '#000', verticalAlign: 'middle' }}
                href="https://docs.memberory.limaois.me/"
                target="_blank"
                rel="noreferrer"
              >
                <IoHelpCircleOutline />
              </a>
            </Tooltip>
          </InputLabel>
          <InputControl style={{ width: '100%', marginTop: '10px' }}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '10rem', fontWeight: 700 }}>Attribute</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>
                      <Tooltip title="You can use {<column>} to embed dynamic content from csv file" placement="right">
                        <span>
                          Value
                          <IoHelpCircleOutline style={{ marginLeft: '0.5rem', transform: 'translateY(3px)' }} />
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>
                      <TextField
                        multiline
                        maxRows={4}
                        size="small"
                        value={projectState.attributes.name}
                        onChange={handleRequiredAttributeValueChange('name')}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>
                      <TextField
                        multiline
                        maxRows={4}
                        size="small"
                        value={projectState.attributes.description}
                        onChange={handleRequiredAttributeValueChange('description')}
                      />
                    </TableCell>
                  </TableRow>
                  {attributes.map((entry, index) =>
                    ['name', 'description', 'token_uri'].includes(entry[0])
                      ? null
                      : (<TableRow key={index}>
                          <TableCell>
                            <TextField
                              value={entry[0]}
                              size="small"
                              onChange={handleAttributeKeyChange(index)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              multiline
                              maxRows={4}
                              size="small"
                              value={entry[1]}
                              onChange={handleAttributeValueChange(index)}
                            />
                          </TableCell>
                        </TableRow>)
                  )}
                  <TableRow>
                    <TableCell colSpan={2}>
                      <a onClick={() => setAttributes((prev) => ([...prev, ['Attr', 'Value']])) } style={{ fontStyle: 'italic', fontSize: '0.825rem', opacity: '0.95' }}>
                        <AiOutlinePlus style={{ transform: 'translateY(2px)' }} /> <span>Add Attribute</span>
                      </a>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </InputControl>
        </InputRow>
      </Container>
    </Root>
  )
}
