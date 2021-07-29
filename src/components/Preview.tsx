import React, { useEffect, useState, useRef, useContext } from 'react'
import styled from 'styled-components'
import $ from 'jquery'
import { ProjectContext } from '../contexts/ProjectContext'

const Root = styled.div`
  width: calc(100% - 484px);
  height: 100%;
  background: rgb(249, 247, 244);
  display: inline-block;
  position: relative;
  vertical-align: top;
`
const PreviewerContainer = styled.div`
  text-align: center;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;

  svg {
    max-width: 70%;
    max-height: 70%;
  }
`

export default function Preview (): React.ReactElement {
  const previewer = useRef<HTMLDivElement>(null)
  const { projectState, setProjectState } = useContext(ProjectContext)!

  // TODO: Replace with placeholder image
  const [svgContent, setSvgContent] = useState(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M30,1h40l29,29v40l-29,29h-40l-29-29v-40z" stroke="#000" fill="none"/>
      <path d="M31,3h38l28,28v38l-28,28h-38l-28-28v-38z" fill="#a23"/>
      <text x="50" y="68" font-size="48" fill="#FFF" text-anchor="middle"><![CDATA[410]]></text>
    </svg>
  `)
  useEffect(() => {
    if (!projectState.svg) return // TODO: Replace preview with error message image

    const data = projectState.data[projectState.usingData]
    if (!data) {
      setSvgContent(projectState.svg)
      return
    }

    // Replace text
    let copy = projectState.svg
    Object.entries(data).forEach(([key, value]) => {
      copy = copy.replaceAll(`{${key}}`, value)
    })

    // Replace Image
    const $svg = $($.parseXML(copy))
    if (!$svg) return // TODO: Replace preview with error message image

    $svg.find('image').each((_, element) => {
      if (element.id && data[element.id]) {
        const $element = $(element)
        $element.attr('xlink:href', '')
        $element.attr('href', data[element.id])
      }
    })
    const svgElement = $svg.find('svg')[0]
    setSvgContent(svgElement.outerHTML)

    // Update preview image
    if (!previewer.current) return
    const svgDataURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgElement.outerHTML)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      context?.drawImage(img, 0, 0)
      setProjectState(prev => ({
        ...prev,
        preview: canvas.toDataURL()
      }))
      canvas.remove()
    }
    img.src = svgDataURL
  }, [projectState.usingData, projectState.data, projectState.svg])

  return (
    <Root>
      <PreviewerContainer dangerouslySetInnerHTML={{ __html: svgContent }} ref={previewer} />
    </Root>
  )
}
