import { createClient } from './server'

export const STORAGE_BUCKETS = {
  PRODUCTS: 'products',
  AVATARS: 'avatars',
  RECEIPTS: 'receipts',
  REVIEWS: 'reviews',
  VENDORS: 'vendors',
} as const

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  contentType?: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return { path: data.path, publicUrl }
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = await createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) throw error
}

export async function getPublicUrl(bucket: string, path: string) {
  const supabase = await createClient()

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

export async function listFiles(bucket: string, path: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path)

  if (error) throw error
  return data
}
