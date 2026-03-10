const TEMP_DOMAINS = [
    'mailinator.com',
    '10minutemail.com',
    'guerrillamail.com',
    'temp-mail.org',
    'dispostable.com',
    'getairmail.com',
    'trashmail.com',
    'yopmail.com',
];

/**
 * Verifica se um email pertence a um domínio de emails temporários conhecidos.
 */
export const isTemporaryEmail = (email: string): boolean => {
    if (!email) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return TEMP_DOMAINS.includes(domain);
};
