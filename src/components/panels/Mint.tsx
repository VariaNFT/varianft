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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@material-ui/core'
import { ProjectContext, ProjectState } from '../../contexts/ProjectContext'
import { IoOpenOutline } from 'react-icons/io5'
import { AiOutlineLock, AiOutlineUnlock } from 'react-icons/ai'
import { BsCheckCircle } from 'react-icons/bs'
import openDataURL from '../../utils/openDataURL'
import { AppAction, AppContext } from '../../contexts/AppContext'
import { uploadViaProxy } from '../../utils/uploadToNFTStorage'
import { useEthers, ChainId, useContractCalls } from '@usedapp/core'
import { useContractFunction } from '../../utils/useContractFunction'
import ERC721RaribleUser from '../../contracts/ERC721RaribleUser.json'
import { CollectionContext } from '../../contexts/CollectionContext'
import { getRaribleTokenId } from '../../utils/getRaribleTokenId'
import { Contract } from 'ethers'

const COMMON_ATTRIBUTES = [
  'name',
  'description',
  'external_url',
  'background_color',
  'animation_url',
  'youtube_url',
]

const ChainNameMap = {
  [ChainId.Mainnet]: 'Mainnet',
  [ChainId.Rinkeby]: 'Rinkeby',
  [ChainId.Ropsten]: 'Ropsten',
}

const PublicContractMap = {
  [ChainId.Mainnet]: '0xF6793dA657495ffeFF9Ee6350824910Abc21356C',
  [ChainId.Rinkeby]: '0x6ede7f3c26975aad32a475e1021d8f6f39c89d82',
  [ChainId.Ropsten]: '0xB0EA149212Eb707a1E5FC1D2d3fD318a8d94cf05',
}

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
const ColoredListItemIcon = styled(ListItemIcon)`
  &.MuiListItemIcon-root {
    color: #4f9a94;
  }
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
      else if (name.length) {
        attributes.push({
          trait_type: name,
          value
        })
      }
    })
  return [table, { ...metadata, attributes }]
}

export default function Mint (): React.ReactElement {
  const { chainId, account, activateBrowserWallet } = useEthers()

  const { projectState, setProjectState } = useContext(ProjectContext)!
  const { appState, dispatchAppState } = useContext(AppContext)!
  const { collections } = useContext(CollectionContext)!
  const collection = projectState.collection !== -2
    ? collections.find(e => e.id === projectState.collection)
    : {
        chainId,
        address: PublicContractMap[chainId as 4 | 3]
      }

  const [table, metadata] = useMetadataGenerator(projectState)

  const [dataIndex, setDataIndex] = useState((projectState.usingData + 1).toString() || '')
  const [address, setAddress] = useState('')
  const [lockAddress, setLockAddress] = useState(false)
  const [minting, setMinting] = useState(false)
  const [ipfs, setIpfs] = useState('')
  const [tokenId, setTokenId] = useState('')

  const collectionAddress = projectState.collection === -2 ? PublicContractMap[collection?.chainId as 4 | 3] : collection?.address
  const ERC721RaribleContract = new Contract(collectionAddress || '0x0000000000000000000000000000000000000000', ERC721RaribleUser.abi)
  const { state, send } = useContractFunction(ERC721RaribleContract, 'mintAndTransfer')

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

  useEffect(() => {
    if (!minting || state.status === 'Mining') return
    else if (state.status === 'Exception') {
      dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'error',
          message: 'Mint failed due to exception: ' + state.errorMessage,
        }
      })
    } else if (state.status === 'Fail') {
      dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'error',
          message: 'Mint failed due to revert',
        }
      })
    } else if (state.status === 'Success') {
      dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'success',
          message: 'Mint success',
        }
      })

      // Drop minted data
      const data = projectState.data
      setProjectState(prev => ({
        ...prev,
        data: data.filter((_, index) => index !== projectState.usingData)
      }))
      if (+dataIndex > data.length - 1 && +dataIndex > 1) setDataIndex(idx => (+idx - 1).toString())
    }
    setMinting(false)
    setTokenId('')
    setIpfs('')
  }, [state])

  useEffect(() => {
    if (projectState.id === -1) {
      dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'error',
          message: 'You haven\'t open a project yet!'
        }
      })
    }
  }, [projectState.id])

  async function mintToken () {
    if (!collection) {
      return dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'error',
          message: 'Collection not set or not found (maybe you cleared the history)',
        }
      })
    }
    if (!chainId || chainId !== collection.chainId) {
      return dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'error',
          message: 'You are using wrong chain, switch to ' + ChainNameMap[collection.chainId as 1 | 4 | 3],
        }
      })
    }
    if (!account) {
      activateBrowserWallet()
      return dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'error',
          message: 'Cannot get wallet'
        }
      })
    }

    setMinting(true)
    const getTokenId = getRaribleTokenId(chainId, collection.address, account)
    const uploadToIPFS = uploadViaProxy(metadata, appState.previewCanvas!)
    getTokenId.then(setTokenId)
    uploadToIPFS.then(setIpfs)

    try {
      const [tokenId, ipfs] = await Promise.all([getTokenId, uploadToIPFS])
      send([
        tokenId,
        ipfs,
        [[account, 10000]],
        [],
        ['0x'],
      ], address)
    } catch (err) {
      setMinting(false)
      dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'error',
          message: 'Mint failed: ' + err.message
        }
      })
    }
  }

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
        </Body>
      </Container>
      <Controls>
          <Tooltip title="Autofill with 'address' column in csv file, lock it if you want to mint to someone only" placement="bottom">
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
          <Button variant="outlined" color="secondary" size="small" style={{ float: 'left' }} onClick={() => {
            const data = projectState.data
            setProjectState(prev => ({
              ...prev,
              data: data.filter((_, index) => index !== projectState.usingData)
            }))
          }}>
            Remove
          </Button>
          {/* <Button variant="outlined" color="primary" size="small" style={{ marginRight: '10px' }}>
            Mint All
          </Button> */}
          <Button variant="contained" color="primary" size="small" onClick={mintToken}>
            Mint
          </Button>
        </ButtonRow>
      </Controls>
      <Dialog open={minting} scroll="paper" fullWidth={true}>
        <DialogTitle>Minting...</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ColoredListItemIcon>
                <BsCheckCircle size={25} />
              </ColoredListItemIcon>
              <ListItemText primary="Create file" />
            </ListItem>
            <ListItem>
              <ColoredListItemIcon>
                {ipfs.length
                  ? <BsCheckCircle size={25} />
                  : <CircularProgress size={25} />}
              </ColoredListItemIcon>
              <ListItemText primary="Upload to NFT.storage" />
            </ListItem>
            <ListItem>
              <ColoredListItemIcon>
                {tokenId.length
                  ? <BsCheckCircle size={25} />
                  : <CircularProgress size={25} />}
              </ColoredListItemIcon>
              <ListItemText primary="Obtain token id from Rarible" />
            </ListItem>
            <ListItem>
              <ColoredListItemIcon>
                <CircularProgress size={25} />
              </ColoredListItemIcon>
              <ListItemText primary="Submit transaction" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
        </DialogActions>
      </Dialog>
    </Root>
  )
}
