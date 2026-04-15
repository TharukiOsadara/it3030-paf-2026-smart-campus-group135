const EMAIL_ALLOWED_CHARS_REGEX = /[^a-zA-Z0-9@.]/g;
const NAME_ALLOWED_CHARS_REGEX = /[^a-zA-Z\s]/g;
const MULTIPLE_SPACES_REGEX = /\s{2,}/g;

export const RESTRICTED_EMAIL_REGEX = /^[A-Za-z0-9.]+@[A-Za-z0-9.]+$/;
export const NAME_REGEX = /^[A-Za-z\s]+$/;

export const sanitizeEmailInput = (value = '') =>
  value.replace(EMAIL_ALLOWED_CHARS_REGEX, '');

export const sanitizeNameInput = (value = '') =>
  value.replace(NAME_ALLOWED_CHARS_REGEX, '').replace(MULTIPLE_SPACES_REGEX, ' ');

export const isRestrictedEmailValid = (value = '') =>
  RESTRICTED_EMAIL_REGEX.test(value);

export const isNameValid = (value = '') => NAME_REGEX.test(value.trim());
