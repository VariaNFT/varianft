import React, { useEffect, useState, useRef, useContext } from 'react'
import styled from 'styled-components'
import $ from 'jquery'
import { ProjectContext } from '../contexts/ProjectContext'
import { AppAction, AppContext } from '../contexts/AppContext'
import { svg } from '../contexts/defaultData.json'
import { loadImageAsDataUrl } from '../utils/loadImageAsDataUrl'

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
  const canvas = useRef<HTMLCanvasElement>(null)
  const { projectState, setProjectState } = useContext(ProjectContext)!
  const { dispatchAppState } = useContext(AppContext)!

  // TODO: Replace with placeholder image
  const [svgContent, setSvgContent] = useState(svg)
  useEffect(() => {
    (async () => {
      if (!projectState.svg) return // TODO: Replace preview with error message image

      const data = projectState.data[projectState.usingData]
      let $svgElement
      if (!data) {
        setSvgContent(projectState.svg)
      } else {
        // Replace text
        let copy = projectState.svg
        Object.entries(data).forEach(([key, value]) => {
          copy = copy.replaceAll(`{${key}}`, value)
        })

        // Replace Image
        const $svg = $($.parseXML(copy))
        if ($svg) {
          const loadImages = $svg.find('image').map((_, element) => {
            if (element.id && data[element.id]) {
              if (data[element.id].startsWith('http')) {
                return loadImageAsDataUrl(data[element.id], { width: +(element.getAttribute('width') || 50), height: +(element.getAttribute('height') || 50) })
                  .then(dataURL => {
                    const $element = $(element)
                    $element.attr('xlink:href', '')
                    $element.attr('href', dataURL)
                  })
                  .catch(dataURL => {
                    const $element = $(element)
                    $element.attr('xlink:href', '')
                    $element.attr('href', dataURL)
                    dispatchAppState({
                      action: AppAction.PUSH_TOAST,
                      payload: {
                        color: 'error',
                        message: 'Unable to get the image, check out the document "Troubleshooting > Unable to Get the Image"',
                      }
                    })
                  })
              } else {
                const $element = $(element)
                $element.attr('xlink:href', '')
                $element.attr('href', data[element.id])
              }
            }
            return Promise.resolve(null)
          })
          await Promise.all(loadImages)
          $svgElement = $svg.find('svg')

          // Firefox Fix for SVGs without height and width, use last 2 value of view box
          if ((!$svgElement.attr('width') || !$svgElement.attr('height')) && $svgElement.attr('viewBox')) {
            const { width, height } = $svgElement.attr('viewBox')?.match(/\d+ \d+ (?<width>[\d.]+) (?<height>[\d.]+)/)?.groups || { width: 0, height: 0 }
            $svgElement.attr('width', width)
            $svgElement.attr('height', height)
          }
          setSvgContent($svgElement[0].outerHTML)
        } else {
          // TODO: Svg error
        }
      }

      // Update preview image
      if (!previewer.current) return
      const svgDataURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent($svgElement?.[0].outerHTML.trim() || svgContent.trim())
      const img = new Image()
      img.onload = () => {
        const context = canvas.current!.getContext('2d')
        canvas.current!.width = img.width
        canvas.current!.height = img.height
        context?.drawImage(img, 0, 0)
        setProjectState(prev => ({
          ...prev,
          preview: canvas.current!.toDataURL()
        }))
      }
      img.src = svgDataURL
    })()
  }, [projectState.usingData, projectState.data, projectState.svg])

  useEffect(() => {
    dispatchAppState({
      action: AppAction.SET_CANVAS,
      payload: { canvas: canvas.current },
    })
  }, [canvas])

  return (
    <Root>
      <PreviewerContainer dangerouslySetInnerHTML={{ __html: svgContent }} ref={previewer} />
      <canvas hidden ref={canvas} />
    </Root>
  )
}
