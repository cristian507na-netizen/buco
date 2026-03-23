'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileName(name: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ nombre: name, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile name:', error)
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  // Convert File to ArrayBuffer for better compatibility with Supabase Storage
  const arrayBuffer = await file.arrayBuffer()
  const fileBuffer = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, fileBuffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true
    })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    return { error: uploadError.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating profile avatar_url:', updateError)
    return { error: updateError.message }
  }

  revalidatePath('/profile')
  revalidatePath('/')
  return { success: true, url: publicUrl }
}

export async function updateWhatsAppNumber(phone: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Clean the phone number: only allow digits and + at the beginning
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Validation
  const digitCount = cleaned.replace(/\D/g, '').length;
  if (digitCount < 8 || digitCount > 15) {
    return { error: 'El número debe tener entre 8 y 15 dígitos.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      whatsapp_numero: cleaned, 
      whatsapp_connected: true,
      updated_at: new Date().toISOString() 
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating WhatsApp number:', error)
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

