export default function openDataURL (url: string) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const objectURL = URL.createObjectURL(blob)
      const w = open(objectURL)
      w?.addEventListener('load', () => {
        URL.revokeObjectURL(objectURL)
      })
    })
}
