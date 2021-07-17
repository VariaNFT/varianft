import React from 'react'
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
`
const StyledButton = styled(Button)`
  margin-left: 10px !important;
  background: rgb(169, 221, 214) !important;
  color: rgb(38, 95, 88) !important;

  &:hover {
    background: rgb(95, 191, 178) !important;
  }
`

export default function Setting (): React.ReactElement {
  return (
    <Root>
      <Container>
        <h2 style={{ marginBottom: '20px' }}>Setting</h2>
        <InputRow>
          <InputLabel>
            Template:
          </InputLabel>
          <InputControl>
            Some.svg
            <StyledButton variant="contained" size="small">Select</StyledButton>
          </InputControl>
        </InputRow>
        <InputRow>
          <InputLabel>
            Data:
          </InputLabel>
          <InputControl>
            Some.csv
            <StyledButton variant="contained" color="primary" size="small">Select</StyledButton>
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
              <MenuItem>Thirty</MenuItem>
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
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '10rem', fontWeight: 700 }}>Attribute</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>
                      <Tooltip title="You can use {<column>} to embed dynamic content" placement="right">
                        <span>Value</span>
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
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <TextField
                        defaultValue="Owner"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        multiline
                        maxRows={4}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <a onClick={() => alert('C')} style={{ fontStyle: 'italic', fontSize: '0.825rem', opacity: '0.95' }}>
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
