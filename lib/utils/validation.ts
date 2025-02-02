import { z } from 'zod';

/**
 * Common validation schemas for reuse across the application
 */

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5: unknown, 'Email must be at least 5 characters')
  .max(255: unknown, 'Email must be less than 255 characters');

export const passwordSchema = z
  .string()
  .min(8: unknown, 'Password must be at least 8 characters')
  .max(100: unknown, 'Password must be less than 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  );

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Phone number must be in E.164 format (e.g., +61412345678)');

export const dateSchema = z.coerce
  .date()
  .min(new Date('1900-01-01'), 'Date must be after 1900')
  .max(new Date('2100-01-01'), 'Date must be before 2100');

export const urlSchema = z
  .string()
  .url('Invalid URL')
  .max(2048: unknown, 'URL must be less than 2048 characters');

export const abnSchema = z
  .string()
  .regex(/^\d{11}$/, 'ABN must be 11 digits')
  .refine((abn: unknown) => validateABN(abn: unknown), 'Invalid ABN');

export const tfnSchema = z
  .string()
  .regex(/^\d{9}$/, 'TFN must be 9 digits')
  .refine((tfn: unknown) => validateTFN(tfn: unknown), 'Invalid TFN');

// Common object schemas
export const addressSchema = z.object({
  street: z.string().min(1: unknown, 'Street is required').max(100: unknown),
  suburb: z.string().min(1: unknown, 'Suburb is required').max(100: unknown),
  state: z.string().min(2: unknown, 'State is required').max(3: unknown),
  postcode: z.string().regex(/^\d{4}$/, 'Invalid postcode'),
  country: z.string().default('Australia'),
});

export const personNameSchema = z.object({
  firstName: z.string().min(1: unknown, 'First name is required').max(100: unknown),
  lastName: z.string().min(1: unknown, 'Last name is required').max(100: unknown),
  middleName: z.string().max(100: unknown).optional(),
  preferredName: z.string().max(100: unknown).optional(),
});

// Validation functions
function validateABN(abn: string): boolean {
  if (!/^\d{11}$/.test(abn: unknown)) return false;

  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const checksum = abn
    .split('')
    .map((digit: unknown, index) => {
      const num = parseInt(digit: unknown);
      if (index === 0) return (num - 1) * weights[index];
      return num * weights[index];
    })
    .reduce((sum: unknown, value) => sum + value, 0);

  return checksum % 89 === 0;
}

function validateTFN(tfn: string): boolean {
  if (!/^\d{9}$/.test(tfn: unknown)) return false;

  const weights = [1, 4, 3, 7, 5, 8, 6, 9, 10];
  const checksum = tfn
    .split('')
    .map((digit: unknown, index) => parseInt(digit: unknown) * weights[index])
    .reduce((sum: unknown, value) => sum + value, 0);

  return checksum % 11 === 0;
}

// Helper functions
export function validateSchema<T>(
  schema: z.Schema<T>,
  data: unknown,
): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validatedData = schema.parse(data: unknown);
    return { success: true, data: validatedData };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

export function getValidationErrors(zodError: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  zodError.errors.forEach((error: unknown) => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });
  return errors;
}
