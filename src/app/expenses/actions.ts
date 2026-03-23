'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createExpense(formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const monto = parseFloat(formData.get('monto') as string)
  const categoria = formData.get('categoria') as string
  const comercio = formData.get('comercio') as string || null
  const fecha = formData.get('fecha') as string || new Date().toISOString()
  const metodo_pago = formData.get('metodo_pago') as string || null
  const descripcion = formData.get('descripcion') as string || null
  const origen = (formData.get('origen') as string) || 'manual'
  const source_type = formData.get('source_type') as string || 'cash'
  const source_id = formData.get('source_id') as string || null

  if (isNaN(monto) || monto <= 0) return { error: 'Monto inválido' }

  const { error } = await supabase.rpc('register_expense_v1', {
    p_user_id: user.id,
    p_monto: monto,
    p_categoria: categoria,
    p_comercio: comercio,
    p_fecha: fecha,
    p_metodo_pago: metodo_pago,
    p_descripcion: descripcion,
    p_origen: origen,
    p_source_type: source_type,
    p_source_id: source_id
  })

  if (error) {
    console.error('Error creating expense:', error)
    return { error: error.message }
  }

  revalidatePath('/expenses')
  revalidatePath('/')
  return { success: true }
}

export async function createIncome(formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const monto = parseFloat(formData.get('monto') as string)
  const categoria = formData.get('categoria') as string
  const fecha = formData.get('fecha') as string || new Date().toISOString()
  const metodo_pago = formData.get('metodo_pago') as string || null
  const descripcion = formData.get('descripcion') as string || null
  const origen = (formData.get('origen') as string) || 'manual'
  const source_type = formData.get('source_type') as string || 'cash'
  const source_id = formData.get('source_id') as string || null

  if (isNaN(monto) || monto <= 0) return { error: 'Monto inválido' }

  const { error } = await supabase.rpc('register_income_v1', {
    p_user_id: user.id,
    p_monto: monto,
    p_categoria: categoria,
    p_fecha: fecha,
    p_metodo_pago: metodo_pago,
    p_descripcion: descripcion,
    p_origen: origen,
    p_source_type: source_type,
    p_source_id: source_id
  })

  if (error) {
    console.error('Error creating income:', error)
    return { error: error.message }
  }

  revalidatePath('/expenses')
  revalidatePath('/')
  return { success: true }
}
