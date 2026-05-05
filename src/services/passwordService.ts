import { supabase } from '../lib/supabase';

export interface ChangePasswordParams {
  userId: string;
  newPassword: string;
}

export async function changePassword({
  userId,
  newPassword,
}: ChangePasswordParams): Promise<void> {

  console.log('Iniciando changePassword...');

  // 🔐 validação básica
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Senha inválida');
  }

  // 🔐 garante sessão ativa
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  console.log('Session data:', sessionData);
  console.log('Session error:', sessionError);

  if (sessionError) {
    throw new Error('Erro na sessão: ' + sessionError.message);
  }

  if (!sessionData.session) {
    throw new Error('Usuário não autenticado');
  }

  // 🔐 update password no Auth (usa sessão atual, NÃO userId)
  console.log('Tentando updateUser...');

  const { error: authError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (authError) {
    console.log('Auth error:', authError);
    throw new Error(
      `Falha ao atualizar senha no Auth: ${authError.message}`,
    );
  }

  // 🧠 update no banco
  const { error: dbError } = await supabase
    .from('app_user_profiles')
    .update({
      must_change_password: false,
      password_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (dbError) {
    throw new Error(
      `Senha alterada no Auth, mas falha ao atualizar perfil: ${dbError.message}`,
    );
  }

  console.log('Senha alterada com sucesso');
}