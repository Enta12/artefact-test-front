'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Input from '@/app/components/Input';
import Button from '@/app/components/Button';
import { registerSchema } from '../schemas/auth';
import { ValidationError } from 'yup';

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

type FormErrors = Partial<Record<keyof RegisterData, string>>;

export default function RegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const validateField = async (field: keyof RegisterData, value: string) => {
    try {
      const fieldsToValidate: Partial<RegisterData> = { [field]: value };
      if (field === 'confirmPassword' || (field === 'password' && formData.confirmPassword)) {
        fieldsToValidate.password = field === 'password' ? value : formData.password;
        fieldsToValidate.confirmPassword = field === 'confirmPassword' ? value : formData.confirmPassword;
      }

      await registerSchema.validateAt(field, { ...formData, ...fieldsToValidate });
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (err) {
      if (err instanceof ValidationError) {
        setErrors(prev => ({ ...prev, [field]: err.message }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = async (field: keyof RegisterData) => {
    setTouchedFields(prev => new Set([...prev, field]));
    if (touchedFields.has(field)) {
      await validateField(field, formData[field]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const validData = await registerSchema.validate(formData, { abortEarly: false });
      register.mutate(validData);
    } catch (err) {
      if (err instanceof ValidationError) {
        const newErrors: FormErrors = {};
        err.inner.forEach((validationError: ValidationError) => {
          if (validationError.path) {
            newErrors[validationError.path as keyof RegisterData] = validationError.message;
          }
        });
        setErrors(newErrors);
        setTouchedFields(new Set(Object.keys(formData)));
      }
    }
  };

  return (
    <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
      <div className="rounded-md space-y-4">
        <div className="flex gap-4">
          <Input
            id="firstName"
            name="firstName"
            type="text"
            label="Prénom"
            placeholder="Jean"
            required
            value={formData.firstName}
            onChange={handleChange}
            onBlur={() => handleBlur('firstName')}
            error={touchedFields.has('firstName') ? errors.firstName : undefined}
          />
          <Input
            id="lastName"
            name="lastName"
            type="text"
            label="Nom"
            placeholder="Dupont"
            required
            value={formData.lastName}
            onChange={handleChange}
            onBlur={() => handleBlur('lastName')}
            error={touchedFields.has('lastName') ? errors.lastName : undefined}
          />
        </div>

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="exemple@email.com"
          required
          value={formData.email}
          onChange={handleChange}
          onBlur={() => handleBlur('email')}
          error={touchedFields.has('email') ? errors.email : undefined}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Mot de passe"
          placeholder="Minimum 8 caractères, 1 majuscule, 1 chiffre"
          required
          value={formData.password}
          onChange={handleChange}
          onBlur={() => handleBlur('password')}
          error={touchedFields.has('password') ? errors.password : undefined}
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmer le mot de passe"
          placeholder="Retapez votre mot de passe"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={() => handleBlur('confirmPassword')}
          error={touchedFields.has('confirmPassword') ? errors.confirmPassword : undefined}
        />
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          fullWidth
          isLoading={register.isPending}
          loadingText="Inscription en cours..."
        >
          S&apos;inscrire
        </Button>
      </div>

      {register.isError && (
        <div className="text-red-500 text-center text-sm mt-4">
          {"Erreur lors de l'inscription. Veuillez réessayer."}
        </div>
      )}
    </form>
  );
} 