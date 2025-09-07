import { useCallback, useEffect, useRef, useState } from 'react';

function getResourceSize(url) {
  const entry = window?.performance?.getEntriesByName(url)?.[0];
  if (entry) {
    const size = entry?.encodedBodySize;
    return size || undefined;
  } else {
    return undefined;
  }
}

export function ImageWithSizeOverlay({ src, srcSet, sizes, alt = "Image", overlayPosition = "left" }) {
  const imageRef = useRef();
  const [imgSize, setImgSize] = useState(undefined);

  const handleImageLoad = useCallback(() => {
    const imgElement = imageRef.current;
    console.log("complete: ", imgElement?.complete);

    if (imgElement?.complete) {
      const size = getResourceSize(imgElement?.currentSrc || imgElement?.src);
      console.log("size: ", size);
      setImgSize(size);
    } else {
      setImgSize(undefined);
    }
  }, []);

  useEffect(() => {
    handleImageLoad();
  }, [handleImageLoad]);

  return (
    <div>
      {imgSize && (
        <span
          className={`absolute z-10 py-1.5 px-2.5 text-sm text-white rounded bg-neutral-900/70 top-2.5 ${
            overlayPosition === 'right' ? 'right-2.5' : 'left-2.5'
          }`}
        >
          {`Size: ${Math.ceil(imgSize / 1024)}KB`}
        </span>
      )}

      <img 
        src={src} 
        srcSet={srcSet} 
        sizes={sizes} 
        alt={alt}
        onLoad={handleImageLoad} 
        ref={imageRef}
        className="max-w-full h-auto"
      />
    </div>
  );
}