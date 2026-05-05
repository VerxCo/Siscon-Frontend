import { supabase } from '../lib/supabase';

export interface ChangePasswordParams {
  userId: string;
  newPassword: string;
}


export async function changePassword({ userId, newPassword }: ChangePasswordParams): Promise<void> {
  const { error: authError } = await supabase.auth.updateUser({ password: newPassword });

  if (authError) {
    throw new Error(`Falha ao atualizar senha no Auth: ${authError.message}`);
  }

  const { error: dbError } = await supabase
    .from('app_user_profile')
    .update({
      must_change_password: false,
      password_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (dbError) {
    // Auth password already changed, but DB update failed – inconsistent state
    // In production, log this for manual reconciliation
    throw new Error(`Senha alterada, mas falha ao atualizar perfil: ${dbError.message}. Contacte o administrador.`);
  }
}
