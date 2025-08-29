'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { login, register } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useUsernameValidation } from '@/hooks/useUsernameValidation';

interface AuthFormData {
  username?: string;
  email: string;
  password: string;
}

interface AuthFormProps {
  onSuccess: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateUser } = useAuth();
  
  // Custom hook for username validation
  const { error: usernameValidationError, validate: validateUsername, clearError: clearUsernameError } = useUsernameValidation();

  const { register: formRegister, handleSubmit, formState: { errors }, watch, setValue } = useForm<AuthFormData>();

  // Watch username field for real-time validation
  const watchedUsername = watch('username');

  // Real-time validation handler
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('username', value);
    
    // Trigger real-time validation
    validateUsername(value);
  }, [setValue, validateUsername]);

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    setError('');

    try {
      let response;
      
      if (isLogin) {
        response = await login(data.email, data.password);
      } else {
        if (!data.username) {
          setError('Username is required for registration');
          setLoading(false);
          return;
        }
        
        // Final validation before submission
        if (data.username.includes(' ')) {
          setError('Username cannot contain spaces');
          setLoading(false);
          return;
        }
        
        response = await register(data.username, data.email, data.password);
      }

      if (response.success) {
        updateUser(response.data.user);
        onSuccess();
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nome de usuário
                </label>
                <input
                  {...formRegister('username', { 
                    required: !isLogin,
                    validate: (value) => {
                      if (!value) return 'Username is required';
                      if (value.includes(' ')) return 'Username cannot contain spaces';
                      if (value.length < 3) return 'Username must be at least 3 characters long';
                      if (value.length > 20) return 'Username must be less than 20 characters';
                      if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Username can only contain letters, numbers, underscores and hyphens';
                      return true;
                    }
                  })}
                  type="text"
                  className={`input-field ${usernameValidationError ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Digite seu nome de usuário"
                  onChange={handleUsernameChange}
                  value={watchedUsername || ''}
                />
                {(errors.username || usernameValidationError) && (
                  <p className="mt-1 text-sm text-red-600">
                    {usernameValidationError || errors.username?.message}
                  </p>
                )}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...formRegister('email', { required: true, pattern: /^\S+@\S+$/i })}
                type="email"
                className="input-field"
                placeholder="Digite seu email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">Email válido é obrigatório</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                {...formRegister('password', { required: true, minLength: 6 })}
                type="password"
                className="input-field"
                placeholder="Digite sua senha"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">Senha deve ter pelo menos 6 caracteres</p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || (!!usernameValidationError && !isLogin)}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                clearUsernameError();
              }}
              className="text-primary-600 hover:text-primary-500"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}