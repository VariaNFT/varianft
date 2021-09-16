export async function loadImageAsDataUrl (src: string, defaultSize: {width: number, height: number}): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      resolve(canvas.toDataURL())
      canvas.remove()
    }
    img.onerror = () => {
      canvas.width = defaultSize.width
      canvas.height = defaultSize.height
      ctx!.fillStyle = '#ccc'
      ctx?.fillRect(0, 0, defaultSize.width, defaultSize.height)
      ctx!.fillStyle = '#000'
      ctx!.textAlign = 'center'
      ctx!.font = '8px Arial'
      ctx?.fillText('Unable to get the image', defaultSize.width / 2, defaultSize.height / 2, defaultSize.width * 0.9)
      reject(canvas.toDataURL())
      canvas.remove()
    }
    img.src = 'https://img-proxy.varianft.studio/' + src
  })
}
