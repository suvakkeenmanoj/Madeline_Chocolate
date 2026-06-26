export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
export const PHONE_REGEX = /^\d{10}$/;

export function validateEmail(email: string): string | null {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return "Email is required.";
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return "Enter a valid email address like user@example.com.";
  }

  return null;
}

export function validatePhone(phone: string): string | null {
  const trimmedPhone = phone.trim();

  if (!trimmedPhone) {
    return "Phone number is required.";
  }

  if (!PHONE_REGEX.test(trimmedPhone)) {
    return "Phone number must be exactly 10 digits with no spaces or special characters.";
  }

  return null;
}
