// Input validation and sanitization utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validateName = (name: string): boolean => {
  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']{1,50}$/;
  return nameRegex.test(name.trim());
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
};

export const validateComment = (content: string): { isValid: boolean; message?: string } => {
  const sanitized = sanitizeInput(content);
  
  if (sanitized.length < 3) {
    return { isValid: false, message: "Comment must be at least 3 characters long" };
  }
  
  if (sanitized.length > 1000) {
    return { isValid: false, message: "Comment is too long (max 1000 characters)" };
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{4,}/, // Repeated characters
    /\b(buy now|click here|free money|lottery|casino)\b/i, // Spam keywords
    /https?:\/\/[^\s]{3,}/g // Multiple URLs
  ];
  
  for (const pattern of spamPatterns) {
    if (pattern.test(sanitized)) {
      return { isValid: false, message: "Comment contains suspicious content" };
    }
  }
  
  return { isValid: true };
};

export const validateContactForm = (data: { name: string; email: string; message: string }) => {
  const errors: Record<string, string> = {};
  
  if (!validateName(data.name)) {
    errors.name = "Name contains invalid characters or is too long";
  }
  
  if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  const messageValidation = validateComment(data.message);
  if (!messageValidation.isValid) {
    errors.message = messageValidation.message || "Invalid message";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// CSP (Content Security Policy) helper
export const getCSPDirectives = () => {
  return {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' data: https:",
    'font-src': "'self' data:",
    'connect-src': "'self' https://nzdtjhnwkrsyerghdppm.supabase.co wss://nzdtjhnwkrsyerghdppm.supabase.co",
    'media-src': "'self'",
    'object-src': "'none'",
    'frame-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'"
  };
};