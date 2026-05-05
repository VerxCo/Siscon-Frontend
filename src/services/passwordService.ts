import { supabase } from '../lib/supabase';

export interface ChangePasswordParams {
  userId: string;
  newPassword: string;
}

/**
 * Fail-safe password change:
 * 1. Update password in Supabase Auth
 * 2. If success, update users table
 * 3. If any step fails, throw error and do NOT consider flow complete
 */
export async function changePassword({ userId, newPassword }: ChangePasswordParams): Promise<void> {
  // Step 1: Update password in Supabase Auth (fail-safe: if fails, do not update DB)
  const { error: authError } = await supabase.auth.updateUser({ password: newPassword });

  if (authError) {
    throw new Error(`Falha ao atualizar senha no Auth: ${authError.message}`);
  }

  // Step 2: Update users table (only after Auth success)
  const { error: dbError } = await supabase
    .from('users')
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
