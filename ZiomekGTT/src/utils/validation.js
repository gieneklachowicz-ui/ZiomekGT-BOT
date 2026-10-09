export function validateForm(age, voice, reason, whyYou, email) {
  if (!age || !voice || !reason || !whyYou) {
    return { valid: false, error: 'Wszystkie pola są wymagane.' };
  }

  const ageNormalized = age.toLowerCase().trim();
  const voiceNormalized = voice.toLowerCase().trim();

  if (ageNormalized !== 'tak' && ageNormalized !== 'nie') {
    return { valid: false, error: 'Odpowiedź na pytanie o wiek musi być "Tak" lub "Nie".' };
  }

  if (voiceNormalized !== 'tak' && voiceNormalized !== 'nie') {
    return { valid: false, error: 'Odpowiedź na pytanie o mutację głosu musi być "Tak" lub "Nie".' };
  }

  if (reason.length < 10) {
    return { valid: false, error: 'Powód chęci otrzymania rangi musi mieć minimum 10 znaków.' };
  }

  if (whyYou.length < 10) {
    return { valid: false, error: 'Odpowiedź dlaczego mamy wybrać Ciebie musi mieć minimum 10 znaków.' };
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Podano nieprawidłowy adres email.' };
    }
  }

  return { valid: true };
}
