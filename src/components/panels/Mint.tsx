import React, { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'
import {
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Tooltip,
  IconButton,
} from '@material-ui/core'
import { ProjectContext, ProjectState } from '../../contexts/ProjectContext'
import { IoOpenOutline } from 'react-icons/io5'
import { AiOutlineLock, AiOutlineUnlock } from 'react-icons/ai'
import openDataURL from '../../utils/openDataURL'
import { AppContext } from '../../contexts/AppContext'
import axios from 'axios'

const COMMON_ATTRIBUTES = [
  'name',
  'description',
  'external_url',
  'background_color',
  'animation_url',
  'youtube_url',
]

const Root = styled.div`
  width: 402px;
  height: 100%;
  scrollbar-width: thin;
  overflow: hidden auto;
  border-right: 2px solid rgb(234, 232, 229);
  display: inline-block;
  position: relative;
  vertical-align: top;
`
const Container = styled.div`
  width: 400px;
  min-height: calc(100% - 120px);
  padding: 30px 20px 30px;
  position: relative;
`
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`
const Selector = styled.div`
`
const SelectorButton = styled.button`
  background: transparent;
  border: none;
  font-size: 20px;
  align-items: center;
  cursor: pointer;
`
const Body = styled.div`
  width: auto;
`
const Section = styled.div`
  width: 100%;
  h3 {
    margin-bottom: 10px;
  }
  margin-bottom: 20px;
`
const Controls = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  width: 400px;
  height: 120px;
  background: white;
  border-top: 1px solid rgb(234, 232, 229);
  padding: 10px 20px;
`
const ButtonRow = styled.div`
  width: auto;
  text-align: right;
`

function useMetadataGenerator (projectState: ProjectState): [Object, Object] {
  const table: { [name: string]: string } = {}
  const metadata: { [key: string ]: string } = {
    name: '',
    description: '',
  }
  const attributes: {
    'trait_type': string,
    value: string
  }[] = []
  const data = projectState.data[projectState.usingData]
  if (!data) return [{}, {}]
  Object.entries(projectState.attributes)
    .sort(pair => COMMON_ATTRIBUTES.includes(pair[0]) ? -1 : 1)
    .forEach(([name, value]) => {
      const needed = value.match(/\{[^}]*\}/g)?.map(e => e.slice(1, -1)) || []
      needed.forEach(col => {
        if (data[col]) value = value.replace(`{${col}}`, data[col])
      })
      table[name] = value
      if (COMMON_ATTRIBUTES.includes(name)) metadata[name] = value
      else {
        attributes.push({
          trait_type: name,
          value
        })
      }
    })
  return [table, { ...metadata, attributes }]
}

function uploadViaProxy (meta: Object, canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    const data = new FormData()
    canvas.toBlob(blob => {
      data.append('img', blob!, 'image.png')
      data.append('meta', JSON.stringify(meta))
      axios.post('https://c6muwv.deta.dev/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }).then(({ data }) => {
        resolve(data.tokenURI)
      }).catch(err => {
        if (err.response && err.response.status === 413) reject(new Error('File too large'))
        else if (err.response && err.response.data) reject(new Error(err.response.data))
        else {
          reject(new Error('Unknown error'))
          console.error(err)
        }
      })
    })
  })
}

export default function Mint (): React.ReactElement {
  const { projectState, setProjectState } = useContext(ProjectContext)!
  const { appState } = useContext(AppContext)!
  const [dataIndex, setDataIndex] = useState((projectState.usingData + 1).toString() || '')
  const [table, metadata] = useMetadataGenerator(projectState)
  const [address, setAddress] = useState('')
  const [lockAddress, setLockAddress] = useState(false)
  const [ipfs, setIpfs] = useState('')

  useEffect(() => {
    const newIndex = parseInt(dataIndex)
    const maxIndex = projectState.data.length
    if (maxIndex === 0) return
    if (newIndex < 1) {
      setDataIndex('1')
      setProjectState(prev => ({ ...prev, usingData: 0 }))
    } else if (newIndex <= maxIndex) {
      setProjectState(prev => ({ ...prev, usingData: newIndex - 1 }))
    } else if (newIndex > maxIndex) {
      setDataIndex(maxIndex.toString())
      setProjectState(prev => ({ ...prev, usingData: maxIndex - 1 }))
    }
  }, [dataIndex])

  useEffect(() => {
    if (lockAddress) return
    const address = projectState.data[projectState.usingData]?.address
    if (address) setAddress(address)
  }, [lockAddress, projectState.usingData])

  return (
    <Root>
      <Container>
        <Header>
          <h2>Mint</h2>
          <Selector>
            <SelectorButton onClick={() => {
              setDataIndex(prev => (parseInt(prev) - 1).toString() || (projectState.usingData.toString()) || '1')
            }}>
              <BiChevronLeft />
            </SelectorButton>
            <TextField
              style={{ width: '4rem', transform: 'translateY(-4px)' }}
              size="small"
              value={dataIndex}
              onChange={(event) => setDataIndex(event.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">{'/ ' + projectState.data.length}</InputAdornment> }}
            />
            <SelectorButton onClick={() => {
              setDataIndex(prev => (parseInt(prev) + 1).toString() || ((projectState.usingData + 2).toString()) || projectState.data.length.toString())
            }}>
              <BiChevronRight />
            </SelectorButton>
          </Selector>
        </Header>
        <Body>
          <Section>
            <Tooltip title="Data retrieved from csv file" placement="right">
              <h3>Data</h3>
            </Tooltip>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 700 }}>Column</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectState.data.length > 0
                    ? Object.entries(projectState.data[projectState.usingData] || {})
                      .map(([col, value], index) => (
                      <TableRow key={index}>
                        <TableCell>{col}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                      ))
                    : <TableRow>
                      <TableCell colSpan={2}>No data</TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
          <Section>
            <Tooltip title="Attributes will be applied to token" placement="right">
              <h3>Metadata</h3>
            </Tooltip>
            <Tooltip title="Preview metadata will generate in new tab" placement="right">
              <a
                style={{ float: 'right', fontSize: '.9rem', color: '#000', verticalAlign: 'middle' }}
                onClick={() => openDataURL('data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(metadata)))}
              >
                <IoOpenOutline />
              </a>
            </Tooltip>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 700 }}>Attribute</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(table)
                    .map(([col, value], index) => (
                      <TableRow key={index}>
                        <TableCell>{col}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                  {Object.keys(table).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2}>No data</TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
          <Section>
            <h3>IPFS:</h3>
            <p>{ipfs}</p>
          </Section>
        </Body>
      </Container>
      <Controls>
          <Tooltip title="Autofill with 'address' column in csv file" placement="bottom">
            <TextField
              style={{ width: '100%', marginBottom: '10px' }}
              label="Address"
              size="small"
              disabled={lockAddress}
              value={address}
              onChange={(event) => {
                if (!lockAddress) setAddress(event.target.value)
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setLockAddress(prev => !prev)}
                    >
                      {lockAddress ? <AiOutlineLock /> : <AiOutlineUnlock />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Tooltip>
        <ButtonRow>
          <Button variant="outlined" color="secondary" size="small" style={{ float: 'left' }}>
            Remove
          </Button>
          <Button variant="outlined" color="primary" size="small" style={{ marginRight: '10px' }}>
            Mint All
          </Button>
          <Button variant="contained" color="primary" size="small" onClick={() => {
            uploadViaProxy(metadata, appState.previewCanvas!).then(setIpfs)
          }}>
            Mint
          </Button>
        </ButtonRow>
      </Controls>
    </Root>
  )
}
