'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Input from '../components/Input';
import { loginSchema } from '../schemas/auth';
import { ValidationError } from 'yup';

interface Credentials {
  email: string;
  password: string;
}

type FormErrors = Partial<Record<keyof Credentials, string>>;

export default function LoginForm() {
  const { login } = useAuth({enabled: false});
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const validateField = async (field: keyof Credentials, value: string) => {
    try {
      await loginSchema.validateAt(field, { ...credentials, [field]: value });
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (err) {
      if (err instanceof ValidationError) {
        setErrors(prev => ({ ...prev, [field]: err.message }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = async (field: keyof Credentials) => {
    setTouchedFields(prev => new Set([...prev, field]));
    if (touchedFields.has(field)) {
      await validateField(field, credentials[field]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const validData = await loginSchema.validate(credentials, { abortEarly: false });
      login.mutate(validData);
    } catch (err) {
      if (err instanceof ValidationError) {
        const newErrors: FormErrors = {};
        err.inner.forEach((validationError: ValidationError) => {
          if (validationError.path) {
            newErrors[validationError.path as keyof Credentials] = validationError.message;
          }
        });
        setErrors(newErrors);
        setTouchedFields(new Set(Object.keys(credentials)));
      }
    }
  };

  return (
    <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
      <div className="rounded-md space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="exemple@email.com"
          required
          value={credentials.email}
          onChange={handleChange}
          onBlur={() => handleBlur('email')}
          error={touchedFields.has('email') ? errors.email : undefined}
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Mot de passe"
          placeholder="Votre mot de passe"
          required
          value={credentials.password}
          onChange={handleChange}
          onBlur={() => handleBlur('password')}
          error={touchedFields.has('password') ? errors.password : undefined}
        />
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          fullWidth
          isLoading={login.isPending}
          loadingText="Connexion..."
        >
          Se connecter
        </Button>
      </div>

      {login.isError && (
        <div className="text-red-500 text-center text-sm mt-4">
          Erreur de connexion. Veuillez réessayer.
        </div>
      )}
    </form>
  );
}