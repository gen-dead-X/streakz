import { describe, test, expect } from 'bun:test';
import { habitSchema } from '../habit.schema';
import { loginSchema, registerSchema } from '../auth.schema';
import { profileSchema } from '../profile.schema';

describe('habitSchema', () => {
  test('passes with valid name', () => {
    const result = habitSchema.safeParse({ name: 'Run every day' });
    expect(result.success).toBe(true);
  });
  test('fails when name is empty', () => {
    const result = habitSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Give your streak a name');
  });
  test('fails when name exceeds 50 chars', () => {
    const result = habitSchema.safeParse({ name: 'a'.repeat(51) });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Max 50 characters');
  });
  test('passes with optional fields missing', () => {
    const result = habitSchema.safeParse({ name: 'Meditate' });
    expect(result.success).toBe(true);
  });
});

describe('loginSchema', () => {
  test('passes with valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'secret' });
    expect(result.success).toBe(true);
  });
  test('fails with invalid email', () => {
    const result = loginSchema.safeParse({ email: 'notanemail', password: 'secret' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Enter a valid email');
  });
  test('fails with empty password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Enter your password');
  });
});

describe('registerSchema', () => {
  const valid = { name: 'Joy', email: 'joy@test.com', password: 'password1', confirm: 'password1' };

  test('passes with all valid fields', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });
  test('fails when passwords do not match', () => {
    const result = registerSchema.safeParse({ ...valid, confirm: 'different' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Passwords do not match');
    expect(result.error?.issues[0].path).toEqual(['confirm']);
  });
  test('fails with password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'short', confirm: 'short' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('At least 8 characters');
  });
});

describe('profileSchema', () => {
  test('passes with non-empty name', () => {
    expect(profileSchema.safeParse({ name: 'Joy' }).success).toBe(true);
  });
  test('fails with empty name', () => {
    const result = profileSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Enter a display name');
  });
});
