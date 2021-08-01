import axios from 'axios'

export function uploadViaProxy (meta: Object, image: HTMLCanvasElement | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const data = new FormData()
    if (image instanceof File) {
      data.append('img', image, 'image.png')
      data.append('meta', JSON.stringify(meta))
      axios.post('https://varianft-to-nftstorage.herokuapp.com/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }).then(({ data }) => {
        resolve(data.tokenURI.replace(/^ipfs:\//, ''))
      }).catch(err => {
        if (err.response && err.response.status === 413) reject(new Error('File too large'))
        else if (err.response && err.response.data) reject(new Error(err.response.data))
        else {
          reject(new Error('Unknown error'))
          console.error(err)
        }
      })
      return
    }
    image.toBlob(blob => {
      data.append('img', blob!, 'image.png')
      data.append('meta', JSON.stringify(meta))
      axios.post('https://varianft-to-nftstorage.herokuapp.com/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }).then(({ data }) => {
        resolve(data.tokenURI.replace(/^ipfs:\//, ''))
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
