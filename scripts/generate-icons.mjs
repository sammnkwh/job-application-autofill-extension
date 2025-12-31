import sharp from 'sharp'
import { readFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '../public/icons')

const sizes = [16, 48, 128]
const variants = ['', '-active']

async function generateIcons() {
  // Ensure output directory exists
  if (!existsSync(iconsDir)) {
    mkdirSync(iconsDir, { recursive: true })
  }

  for (const size of sizes) {
    for (const variant of variants) {
      const svgPath = join(iconsDir, `icon-${size}${variant}.svg`)
      const pngPath = join(iconsDir, `icon-${size}${variant}.png`)

      try {
        const svgBuffer = readFileSync(svgPath)
        await sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toFile(pngPath)
        console.log(`Generated: icon-${size}${variant}.png`)
      } catch (error) {
        console.error(`Error generating icon-${size}${variant}.png:`, error.message)
      }
    }
  }
}

generateIcons()
