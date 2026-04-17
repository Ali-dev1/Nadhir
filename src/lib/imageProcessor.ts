export const processProductImage = async (
  file: File
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onerror = reject

    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target?.result as string
      img.onerror = reject

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const TARGET_WIDTH = 1200
        const TARGET_HEIGHT = 1600  // 3:4 portrait
        canvas.width = TARGET_WIDTH
        canvas.height = TARGET_HEIGHT

        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas not supported'))

        // Fill with ivory background
        ctx.fillStyle = '#FAF8F4'
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT)

        // CONTAIN mode — never crop, always fit fully inside
        // The full image always shows, padded with ivory
        // This prevents the zoomed-in over-cropped problem
        const imgRatio = img.width / img.height
        const canvasRatio = TARGET_WIDTH / TARGET_HEIGHT

        let drawWidth: number
        let drawHeight: number
        let offsetX: number
        let offsetY: number

        if (imgRatio > canvasRatio) {
          // Image is wider — fit by width, pad top and bottom
          drawWidth = TARGET_WIDTH
          drawHeight = TARGET_WIDTH / imgRatio
          offsetX = 0
          offsetY = (TARGET_HEIGHT - drawHeight) / 2
        } else {
          // Image is taller — fit by height, pad left and right
          drawHeight = TARGET_HEIGHT
          drawWidth = TARGET_HEIGHT * imgRatio
          offsetX = (TARGET_WIDTH - drawWidth) / 2
          offsetY = 0
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Processing failed'))
            const processedFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, '.jpg'),
              { type: 'image/jpeg' }
            )
            resolve(processedFile)
          },
          'image/jpeg',
          0.88
        )
      }
    }
  })
}
