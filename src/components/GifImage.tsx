import type { ImgHTMLAttributes } from 'react'
import { useState } from 'react'

type GifImageProps = ImgHTMLAttributes<HTMLImageElement>

function GifImage({ className = '', onLoad, onError, ...props }: GifImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <img
      {...props}
      className={`gif-image ${loaded ? 'gif-image-loaded' : 'gif-image-loading'} ${className}`}
      decoding="async"
      onLoad={(event) => {
        setLoaded(true)
        onLoad?.(event)
      }}
      onError={(event) => {
        setLoaded(true)
        onError?.(event)
      }}
    />
  )
}

export default GifImage
