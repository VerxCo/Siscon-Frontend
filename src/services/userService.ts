import { supabase } from '../lib/supabase';
import type { AuthUser } from '../types';

export async function getUserProfile(userId: string): Promise<AuthUser> {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, email, full_name, role, active, must_change_password, password_changed_at')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(`Falha ao buscar perfil: ${error.message}`);
  if (!data) throw new Error('Perfil de usuário não encontrado');

  return {
    user_id: data.user_id,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    is_active: data.active,
    must_change_password: data.must_change_password ?? false,
    password_changed_at: data.password_changed_at,
  };
}
