import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ThemeToggle from '../ThemeToggle';
import { Button, FormGroup } from '../components/ui';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError || !authData.user) throw new Error(authError?.message ?? 'Error al crear usuario');

      // From here, if we fail, the auth user exists but has no company
      try {
        const slug = companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (!slug) throw new Error('El nombre de la empresa debe contener al menos un carácter alfanumérico');

        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({ name: companyName, slug, active: false })
          .select()
          .single();
        if (companyError || !company) throw new Error('Error al crear empresa');

        const { error: memberError } = await supabase
          .from('company_members')
          .insert({ company_id: company.id, user_id: authData.user.id, role: 'admin' });
        if (memberError) throw new Error('Error al crear membresía');
      } catch {
        // User was created in Supabase Auth but company setup failed
        throw new Error(
          'Tu cuenta fue creada pero hubo un error al configurar tu empresa. ' +
          'Contactá a soporte con tu email para que activemos tu cuenta manualmente.'
        );
      }

      navigate('/login?registered=1');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-theme-bar">
        <Link to="/" className="login-back">
          Inicio
        </Link>
        <ThemeToggle />
      </div>
      <div className="login-brand">
        <h1>Chatty</h1>
        <p>Inbox y tareas con WhatsApp</p>
      </div>
      <form onSubmit={handleSubmit} className="card login-card">
        <h2 style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>Crear cuenta</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem' }}>
          Tu cuenta quedará pendiente de activación.
        </p>
        <FormGroup label="Nombre de la empresa">
          {(props) => (
            <input
              {...props}
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              autoComplete="organization"
            />
          )}
        </FormGroup>
        <FormGroup label="Email">
          {(props) => (
            <input
              {...props}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          )}
        </FormGroup>
        <FormGroup label="Contraseña">
          {(props) => (
            <input
              {...props}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
          )}
        </FormGroup>
        {error && (
          <p style={{ color: 'var(--danger)', background: 'var(--danger-bg)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '0.65rem' }}>
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', marginBottom: '0.5rem' }}>
          Crear cuenta
        </Button>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>
            Iniciá sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
