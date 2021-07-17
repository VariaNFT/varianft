import React from 'react'
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
} from '@material-ui/core'

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

export default function Mint (): React.ReactElement {
  return (
    <Root>
      <Container>
        <Header>
          <h2>Mint</h2>
          <Selector>
            <SelectorButton>
              <BiChevronLeft />
            </SelectorButton>
            <TextField
              style={{ width: '4rem', transform: 'translateY(-4px)' }}
              size="small"
              InputProps={{ endAdornment: <InputAdornment position="end"> / 10</InputAdornment> }}
            />
            <SelectorButton>
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
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 700 }}>Column</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={'a'}>
                    <TableCell>Name</TableCell>
                    <TableCell>Bill</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
          <Section>
            <Tooltip title="Attributes will be applied to token" placement="right">
              <h3>Metadata</h3>
            </Tooltip>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 700 }}>Attribute</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={'a'}>
                    <TableCell>Name</TableCell>
                    <TableCell>Bill</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
        </Body>
      </Container>
      <Controls>
          <Tooltip title="Autofill with 'address' column in csv file" placement="bottom">
            <TextField
              style={{ width: '100%', marginBottom: '10px' }}
              label="Address"
              size="small"
            />
          </Tooltip>
        <ButtonRow>
          <Button variant="outlined" color="secondary" size="small" style={{ float: 'left' }}>
            Remove
          </Button>
          <Button variant="outlined" color="primary" size="small" style={{ marginRight: '10px' }}>
            Mint All
          </Button>
          <Button variant="contained" color="primary" size="small">
            Mint
          </Button>
        </ButtonRow>
      </Controls>
    </Root>
  )
}
