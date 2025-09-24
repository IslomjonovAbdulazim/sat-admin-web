// Utility functions for handling media files (logos, images, etc.)

const BASE_URL = 'https://edutizimbackend-production.up.railway.app'

/**
 * Constructs the full URL for a logo from its stored path
 * @param logoPath - The relative path stored in the database (e.g., "logos/center_3_4e879da0-0ef6-4cd9-a76d-579d695ca95d.png")
 * @returns Full URL or undefined if no path provided
 */
export const getLogoUrl = (logoPath: string | null): string | undefined => {
  if (!logoPath) return undefined
  return `${BASE_URL}/static/${logoPath}`
}

/**
 * Constructs the full URL for any static file
 * @param filePath - The relative path to the static file
 * @returns Full URL or undefined if no path provided
 */
export const getStaticFileUrl = (filePath: string | null): string | undefined => {
  if (!filePath) return undefined
  return `${BASE_URL}/static/${filePath}`
}

/**
 * Constructs the full URL for an audio file
 * @param audioPath - The relative audio path from backend (e.g., "audio/word_1_d5ada034-14a3-44f3-94d8-a52e58eedaa3.mp3")
 * @returns Full playable URL or undefined if no path provided
 */
export const getAudioUrl = (audioPath: string | null): string | undefined => {
  if (!audioPath) return undefined
  return `${BASE_URL}/static/${audioPath}`
}

/**
 * Constructs the full URL for an image file
 * @param imagePath - The relative image path from backend (e.g., "images/word_1_abc123.jpg")
 * @returns Full viewable URL or undefined if no path provided
 */
export const getImageUrl = (imagePath: string | null): string | undefined => {
  if (!imagePath) return undefined
  return `${BASE_URL}/static/${imagePath}`
}

/**
 * Extracts filename from a full logo path
 * @param logoPath - The logo path (e.g., "logos/center_3_filename.png")
 * @returns Just the filename or the original path if no / found
 */
export const getLogoFilename = (logoPath: string | null): string | null => {
  if (!logoPath) return null
  const parts = logoPath.split('/')
  return parts[parts.length - 1]
}