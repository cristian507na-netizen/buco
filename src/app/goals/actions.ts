'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGoal(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // 1. Check Plan Limits
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const { count: activeGoalsCount } = await supabase
    .from('savings_goals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active')

  const currentPlan = (profile?.plan || 'free') as 'free' | 'premium' | 'pro'
  const limit = currentPlan === 'free' ? 4 : 999 

  if ((activeGoalsCount || 0) >= limit) {
    return { error: `Has alcanzado el límite de ${limit} metas activas para el plan ${currentPlan.toUpperCase()}. Mejora tu plan para crear más.` }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const type = formData.get('type') as string
  const icon = formData.get('icon') as string
  const color = formData.get('color') as string
  const target_amount = formData.get('target_amount') ? parseFloat(formData.get('target_amount') as string) : null
  const current_amount = formData.get('current_amount') ? parseFloat(formData.get('current_amount') as string) : 0
  const target_category = formData.get('target_category') as string
  const target_account_id = formData.get('target_account_id') as string
  const target_percentage = formData.get('target_percentage') ? parseFloat(formData.get('target_percentage') as string) : null
  const deadline = formData.get('deadline') as string
  const image = formData.get('image') as File
  const goal_type_savings = formData.get('goal_type_savings') as string || 'virtual'
  const linked_account_id = formData.get('linked_account_id') as string || null

  let image_url = null
  if (image && image.size > 0) {
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
    const fileExt = image.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) return { error: 'Tipo de archivo no permitido. Solo se aceptan jpg, jpeg, png, webp.' }
    if (image.size > 5 * 1024 * 1024) return { error: 'Imagen demasiado grande (máx 5MB)' }
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('goal-images')
      .upload(fileName, image)
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('goal-images')
        .getPublicUrl(fileName)
      image_url = publicUrl
    }
  }

  const { data, error } = await supabase.from('savings_goals').insert({
    user_id: user.id,
    name,
    description,
    type,
    icon,
    color,
    image_url,
    target_amount,
    current_amount,
    target_category,
    target_account_id: target_account_id || null, // UI targets
    target_percentage,
    deadline: deadline || null,
    status: 'active',
    goal_type_savings,
    linked_account_id: linked_account_id || null // Real bank account link
  }).select().single()

  if (error) {
    console.error('Error creating goal:', error)
    return { error: error.message }
  }

  revalidatePath('/goals')
  return { success: true, data }
}

export async function deleteGoal(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('savings_goals').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/goals')
  return { success: true }
}

export async function addContribution(goalId: string, amount: number, note?: string, sourceId?: string, sourceType?: 'cash' | 'bank_account' | 'card') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // 1. Get Goal to ensure it exists and belongs to user
  const { data: goal, error: goalError } = await supabase
    .from('savings_goals')
    .select('name, type')
    .eq('id', goalId)
    .eq('user_id', user.id)
    .single();

  if (goalError || !goal) return { error: 'Meta no encontrada' };

  // 2. Register Expense for the contribution (Transactional coherence)
  const { error: rpcError } = await supabase.rpc('register_expense_v1', {
    p_user_id: user.id,
    p_monto: amount,
    p_categoria: 'ahorro',
    p_comercio: `Meta: ${goal.name}`,
    p_fecha: new Date().toISOString(),
    p_metodo_pago: sourceType === 'cash' ? 'efectivo' : (sourceType === 'card' ? 'tarjeta_debito' : 'transferencia'),
    p_descripcion: note || `Abono a meta: ${goal.name}`,
    p_origen: 'manual',
    p_source_type: sourceType || 'cash',
    p_source_id: sourceId || null
  });

  if (rpcError) return { error: `Error al procesar el pago: ${rpcError.message}` };

  // 3. Record Contribution in goal_contributions
  const { error: contribError } = await supabase.from('goal_contributions').insert({
    goal_id: goalId,
    user_id: user.id,
    amount,
    note
  })

  if (contribError) return { error: contribError.message }

  // 4. Update goal current_amount
  const { data: currentGoal } = await supabase.from('savings_goals').select('current_amount').eq('id', goalId).eq('user_id', user.id).single()
  if (currentGoal) {
    await supabase.from('savings_goals').update({
      current_amount: (currentGoal.current_amount || 0) + amount
    }).eq('id', goalId).eq('user_id', user.id)
  }

  revalidatePath(`/goals/${goalId}`)
  revalidatePath('/goals')
  revalidatePath('/')
  return { success: true }
}

export async function addTask(goalId: string, title: string, type: string = 'otro') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('goal_tasks').insert({
    goal_id: goalId,
    user_id: user.id,
    title,
    type
  })

  if (error) return { error: error.message }
  revalidatePath(`/goals/${goalId}`)
  return { success: true }
}

export async function toggleTask(taskId: string, completed: boolean, goalId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('goal_tasks').update({
    completed,
    completed_at: completed ? new Date().toISOString() : null
  }).eq('id', taskId).eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/goals/${goalId}`)
  return { success: true }
}

export async function deleteTask(taskId: string, goalId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('goal_tasks').delete().eq('id', taskId).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath(`/goals/${goalId}`)
  return { success: true }
}

export async function addChatMessage(goalId: string, role: string, content: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // 1. Check Plan Limits
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const currentPlan = (profile?.plan || 'free') as 'free' | 'premium' | 'pro'
  const limit = currentPlan === 'free' ? 5 : currentPlan === 'premium' ? 50 : 200

  // Count messages in current month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('goal_chats')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('role', 'user') // Only count user messages
    .gte('created_at', startOfMonth.toISOString())

  if ((count || 0) >= limit) {
    return { error: `Has agotado tus ${limit} mensajes mensuales para el plan ${currentPlan.toUpperCase()}.` }
  }

  const { error } = await supabase.from('goal_chats').insert({
    goal_id: goalId,
    user_id: user.id,
    role,
    content
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateGoalStatus(goalId: string, status: 'active' | 'completed' | 'failed') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('savings_goals')
    .update({ status })
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/goals')
  revalidatePath(`/goals/${goalId}`)
  return { success: true }
}

export async function generateGoalPlan(goalId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: goal } = await supabase.from('savings_goals').select('*').eq('id', goalId).single()
  if (!goal) return { error: 'Goal not found' }

  const target = goal.target_amount || 0
  const current = goal.current_amount || 0
  const remaining = Math.max(0, target - current)
  
  if (remaining === 0) return { error: 'La meta ya está completa o no tiene monto objetivo' }

  // Logic to determine months
  const deadline = goal.deadline ? new Date(goal.deadline) : new Date(new Date().setMonth(new Date().getMonth() + 6))
  const now = new Date()
  
  let monthsCount = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth())
  if (monthsCount <= 0) monthsCount = 1
  if (monthsCount > 24) monthsCount = 24 // Limit to 2 years

  const amountPerMonth = Math.ceil(remaining / monthsCount)
  
  const steps = []
  for (let i = 0; i < monthsCount; i++) {
    const stepDate = new Date()
    stepDate.setMonth(now.getMonth() + (i + 1))
    const monthLabel = stepDate.toLocaleString('es-ES', { month: 'long' })
    
    steps.push({
      goal_id: goalId,
      user_id: user.id,
      month_label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      suggested_amount: amountPerMonth,
      description: `Aporte mensual sugerido para alcanzar "${goal.name}"`,
      due_date: new Date(stepDate.getFullYear(), stepDate.getMonth() + 1, 0).toISOString(), // End of month
      completed: false,
      source: 'ai'
    })
  }

  const { error } = await supabase.from('goal_plan_steps').insert(steps)
  if (error) return { error: error.message }

  revalidatePath(`/goals/${goalId}`)
  return { success: true }
}

export async function updateGoalColor(goalId: string, color: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('savings_goals')
    .update({ color })
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/goals')
  revalidatePath(`/goals/${goalId}`)
  return { success: true }
}
