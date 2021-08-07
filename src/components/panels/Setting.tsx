import React, { ChangeEvent, useContext, useState, useEffect, useRef } from 'react'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
} from '@material-ui/core'
import { AiOutlinePlus, AiOutlineFileAdd } from 'react-icons/ai'
import { IoHelpCircleOutline } from 'react-icons/io5'
import { ProjectContext } from '../../contexts/ProjectContext'
import { AppAction, AppContext } from '../../contexts/AppContext'
import { parse } from 'papaparse'
import openDataURL from '../../utils/openDataURL'
import { CollectionContext } from '../../contexts/CollectionContext'
import { DatabaseContext } from '../../contexts/DatabaseContext'
import { useEthers, ChainId } from '@usedapp/core'
import ERC721RaribleUser from '../../contracts/ERC721RaribleUser.json'
import { ContractFactory } from 'ethers'
import { Interface } from '@ethersproject/abi'
import { uploadViaProxy } from '../../utils/uploadToNFTStorage'

const ChainNameMap = {
  [ChainId.Mainnet]: 'Mainnet',
  [ChainId.Rinkeby]: 'Rinkeby',
  [ChainId.Ropsten]: 'Ropsten',
}

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
const DialogTextField = styled(TextField)`
  &.MuiTextField-root {
    margin: 8px 0;
  }
`
const ProjectNameTextField = styled(TextField)`
  width: 75%;
  &.MuiFormControl-root {
    vertical-align: middle;
  }
`

interface CollectionData {
  name: string
  symbol: string
  description: string
  'external_link': string
  'seller_fee_basis_points': string
  'fee_recipient': string
}

export default function Setting (): React.ReactElement {
  const { dispatchAppState } = useContext(AppContext)!
  const db = useContext(DatabaseContext)!
  const { projectState, setProjectState } = useContext(ProjectContext)!
  const { collections } = useContext(CollectionContext)!

  const [attributes, setAttributes] = useState<Array<[string, string]>>(Object.entries(projectState.attributes))
  const [openCollectionForm, setOpenCollectionForm] = useState(false)
  const [collectionForm, setCollectionForm] = useState<CollectionData>({
    name: '',
    symbol: '',
    description: '',
    external_link: '',
    seller_fee_basis_points: '',
    fee_recipient: '',
  })
  const [collectionImageFileName, setCollectionImageFileName] = useState('')
  // -1 for not creating, >= 0 for creating
  const [collectionCreating, setCollectionCreating] = useState(-1)

  const svgInput = useRef<HTMLInputElement>(null)
  const csvInput = useRef<HTMLInputElement>(null)
  const collectionImage = useRef<HTMLInputElement>(null)

  const { chainId, library, account, activateBrowserWallet } = useEthers()

  useEffect(() => {
    const newAttributes = Object.fromEntries(attributes)
    setProjectState((prev) => ({
      ...prev,
      attributes: newAttributes,
    }))
  }, [JSON.stringify(attributes)])

  function handleAttributeKeyChange (index: number) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let copy = [...attributes]
      copy[index][0] = event.target.value
      if (copy[index][0].length === 0 && copy[index][1].length === 0) {
        copy = copy.filter((_, idx) => idx !== index)
      }
      setAttributes(copy)
    }
  }

  function handleAttributeValueChange (index: number) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let copy = [...attributes]
      copy[index][1] = event.target.value
      if (copy[index][0].length === 0 && copy[index][1].length === 0) {
        copy = copy.filter((_, idx) => idx !== index)
      }
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

  async function deployCollection () {
    if (!library || !account) {
      activateBrowserWallet()
      return dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'error',
          message: 'Cannot get wallet'
        }
      })
    }

    if (!collectionImage.current?.files?.[0]) {
      return dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'error',
          message: 'Image not set'
        }
      })
    }

    setCollectionCreating(0)

    const raribleUser = new ContractFactory(new Interface(ERC721RaribleUser.abi), ERC721RaribleUser.bytecode, library.getSigner())
    // TODO: following two promise can be parallel but if contract created and
    //       file upload failed, it should use created one instead of deploy another
    const uri = await uploadViaProxy(collectionForm, collectionImage.current?.files[0]).then(any => {
      setCollectionCreating(prev => prev + 1)
      return any
    })

    const contract = await raribleUser.deploy().then(any => {
      setCollectionCreating(prev => prev + 1)
      return any
    })

    const tx = await contract.__ERC721RaribleUser_init(
      collectionForm.name,
      collectionForm.symbol,
      'ipfs:/',
      'ipfs:/' + uri,
      [],
      { from: account }
    )
    await tx.wait().then(() => setCollectionCreating(prev => prev + 1))

    await db.collections.add({
      name: collectionForm.name,
      address: contract.address,
      chainId: chainId!,
    }).then(id => {
      setProjectState(prev => ({
        ...prev,
        collection: id,
      }))
      setOpenCollectionForm(false)
    })

    dispatchAppState({
      action: AppAction.PUSH_TOAST,
      payload: {
        color: 'success',
        message: 'Deployed new ERC721 contract!',
      }
    })
    setCollectionCreating(-1)
    setCollectionForm({
      name: '',
      symbol: '',
      description: '',
      external_link: '',
      seller_fee_basis_points: '',
      fee_recipient: '',
    })
    setCollectionImageFileName('')
    collectionImage.current.value = ''
  }

  async function tryDeployCollection () {
    try {
      await deployCollection()
    } catch (err) {
      console.log(err)
      dispatchAppState({
        action: AppAction.PUSH_TOAST,
        payload: {
          color: 'error',
          message: 'Deploy failed: ' + err.message,
        }
      })
      setCollectionCreating(-1)
    }
  }

  return (
    <Root>
      <Container>
        <h2 style={{ marginBottom: '20px' }}>Setting</h2>
        <InputRow>
          <InputLabel>
            Name:
          </InputLabel>
          <InputControl>
            <ProjectNameTextField
              value={projectState.name}
              onChange={(event) => event.target.value && setProjectState(prev => ({
                ...prev,
                name: event.target.value
              }))}
            />
          </InputControl>
        </InputRow>
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
            >View</Button>
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
            >View</Button>
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
              style={{ width: '75%', textAlign: 'left' }}
              value={projectState.collection === -1 ? '' : projectState.collection}
              onChange={(event) => setProjectState(prev => ({
                ...prev,
                collection: event.target.value as number || -1
              }))}
            >
              {chainId && [ChainId.Mainnet, ChainId.Ropsten, ChainId.Rinkeby].includes(chainId) && (
                <MenuItem value={-2}> {/* Only show for Mainnet, Ropsten and Rinkeby */}
                  <Tooltip title="Rarible Protocol provides a contract everyone can mint zir tokens. By using Rarible, you won't need to deploy your own contract, but the token name and symbol will use Rarible" placement="right">
                    <span>
                      Rarible
                      <IoHelpCircleOutline style={{ marginLeft: '0.5rem', transform: 'translateY(3px)' }} />
                    </span>
                  </Tooltip>
                </MenuItem>
              )}
              {collections.map(collection => (
                <MenuItem value={collection.id!} key={collection.id!}>
                  {collection.name} ({ChainNameMap[collection.chainId as 1 | 4 | 3]})
                </MenuItem>
              ))}
              <MenuItem onClick={() => setOpenCollectionForm(true)}><em>Create New Collection</em></MenuItem>
            </Select>
          </InputControl>
        </InputRow>
        <InputRow style={{ marginTop: '30px' }}>
          <InputLabel style={{ width: '100%' }}>
            Metadata Attributes:
            <Tooltip title="Check out our document for details" placement="right">
              <a
                style={{ float: 'right', fontSize: '.9rem', color: '#000', verticalAlign: 'middle' }}
                href="https://docs.varianft.studio/docs/guide/metadata"
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
      <Dialog open={openCollectionForm} onClose={() => {
        if (collectionCreating === -1) setOpenCollectionForm(false)
      }} scroll="paper" fullWidth={true}>
        <DialogTitle>
          Create Collection
          <Tooltip title="Check out Opensea's document for details" placement="right">
            <a
              style={{ float: 'right', color: '#000', verticalAlign: 'middle' }}
              href="https://docs.opensea.io/docs/contract-level-metadata"
              target="_blank"
              rel="noreferrer"
            >
              <IoHelpCircleOutline />
            </a>
          </Tooltip>
        </DialogTitle>
        <DialogContent>
          <DialogTextField
            label="Name"
            fullWidth
            value={collectionForm.name}
            onChange={(event) => setCollectionForm(prev => ({ ...prev, name: event.target.value }))}
          />
          <DialogTextField
            label="Symbol"
            fullWidth
            value={collectionForm.symbol}
            onChange={(event) => setCollectionForm(prev => ({ ...prev, symbol: event.target.value }))}
          />
          <DialogTextField
            label="Description"
            fullWidth
            multiline
            maxRows={4}
            value={collectionForm.description}
            onChange={(event) => setCollectionForm(prev => ({ ...prev, description: event.target.value }))}
          />
          <input type="file" accept="image/*" ref={collectionImage} hidden onChange={(event) => {
            setCollectionImageFileName(event.target.files?.[0].name || '')
          }}/>
          <DialogTextField
            label="Image"
            fullWidth
            maxRows={4}
            helperText={'Select a file for this collection'}
            value={collectionImageFileName}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => collectionImage.current?.click()}
                  >
                    <AiOutlineFileAdd />
                  </IconButton>
                </InputAdornment>)
            }}
          />
          <DialogTextField
            label="External Link"
            fullWidth
            value={collectionForm.external_link}
            onChange={(event) => setCollectionForm(prev => ({ ...prev, external_link: event.target.value }))}
          />
          <DialogTextField
            label="Seller Fee (‱)"
            fullWidth
            value={collectionForm.seller_fee_basis_points}
            onChange={(event) => setCollectionForm(prev => ({ ...prev, seller_fee_basis_points: event.target.value }))}
          />
          <DialogTextField
            label="Fee Recipient"
            fullWidth
            value={collectionForm.fee_recipient}
            onChange={(event) => setCollectionForm(prev => ({ ...prev, fee_recipient: event.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button color="default" onClick={() => setOpenCollectionForm(false)} disabled={collectionCreating >= 0}>
            Cancel
          </Button>
          <Button color="primary" onClick={tryDeployCollection} disabled={collectionCreating >= 0}>
            {collectionCreating >= 0 ? `Creating... (${collectionCreating}/4)` : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  )
}
