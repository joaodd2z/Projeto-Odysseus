/**
 * Validation utilities for user input and data validation
 * Provides comprehensive validation functions for the Odysseus platform
 */

import { createLogger } from './logger.js';

const logger = createLogger('Validation');

/**
 * Validates user input for skill tree generation
 * @param {string} input - The user input to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateInput = (input) => {
  const errors = [];
  
  // Check if input exists
  if (!input || typeof input !== 'string') {
    errors.push('Input is required and must be a string');
    return { isValid: false, errors };
  }
  
  // Trim whitespace
  const trimmedInput = input.trim();
  
  // Check minimum length
  if (trimmedInput.length < 3) {
    errors.push('Input must be at least 3 characters long');
  }
  
  // Check maximum length
  if (trimmedInput.length > 500) {
    errors.push('Input must be less than 500 characters');
  }
  
  // Check for potentially harmful content
  const harmfulPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi
  ];
  
  for (const pattern of harmfulPatterns) {
    if (pattern.test(trimmedInput)) {
      errors.push('Input contains potentially harmful content');
      break;
    }
  }
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /('|(\-\-)|(;)|(\||\|)|(\*|\*))/gi,
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)/gi
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(trimmedInput)) {
      errors.push('Input contains potentially harmful SQL patterns');
      break;
    }
  }
  
  const isValid = errors.length === 0;
  
  if (!isValid) {
    logger.warn('Input validation failed', { input: trimmedInput, errors });
  }
  
  return {
    isValid,
    errors,
    sanitizedInput: isValid ? trimmedInput : null
  };
};

/**
 * Validates career name input
 * @param {string} careerName - The career name to validate
 * @returns {Object} - Validation result
 */
export const validateCareerName = (careerName) => {
  const errors = [];
  
  if (!careerName || typeof careerName !== 'string') {
    errors.push('Career name is required');
    return { isValid: false, errors };
  }
  
  const trimmed = careerName.trim();
  
  if (trimmed.length < 2) {
    errors.push('Career name must be at least 2 characters long');
  }
  
  if (trimmed.length > 100) {
    errors.push('Career name must be less than 100 characters');
  }
  
  // Allow letters, numbers, spaces, hyphens, and common punctuation
  const validPattern = /^[a-zA-Z0-9\s\-\.\,\&\/\(\)]+$/;
  if (!validPattern.test(trimmed)) {
    errors.push('Career name contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedInput: errors.length === 0 ? trimmed : null
  };
};

/**
 * Validates skill tree data structure
 * @param {Object} skillTree - The skill tree object to validate
 * @returns {Object} - Validation result
 */
export const validateSkillTree = (skillTree) => {
  const errors = [];
  
  if (!skillTree || typeof skillTree !== 'object') {
    errors.push('Skill tree must be an object');
    return { isValid: false, errors };
  }
  
  // Check required properties
  const requiredProps = ['career_name', 'skills'];
  for (const prop of requiredProps) {
    if (!skillTree[prop]) {
      errors.push(`Missing required property: ${prop}`);
    }
  }
  
  // Validate skills array
  if (skillTree.skills && Array.isArray(skillTree.skills)) {
    if (skillTree.skills.length === 0) {
      errors.push('Skills array cannot be empty');
    }
    
    // Validate each skill
    skillTree.skills.forEach((skill, index) => {
      if (!skill.id) {
        errors.push(`Skill at index ${index} missing id`);
      }
      if (!skill.name) {
        errors.push(`Skill at index ${index} missing name`);
      }
      if (!skill.description) {
        errors.push(`Skill at index ${index} missing description`);
      }
    });
  } else if (skillTree.skills) {
    errors.push('Skills must be an array');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates URL format
 * @param {string} url - The URL to validate
 * @returns {Object} - Validation result
 */
export const validateURL = (url) => {
  const errors = [];
  
  if (!url || typeof url !== 'string') {
    errors.push('URL is required and must be a string');
    return { isValid: false, errors };
  }
  
  try {
    new URL(url);
    
    // Check for allowed protocols
    const allowedProtocols = ['http:', 'https:'];
    const urlObj = new URL(url);
    
    if (!allowedProtocols.includes(urlObj.protocol)) {
      errors.push('URL must use http or https protocol');
    }
    
  } catch (e) {
    errors.push('Invalid URL format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {Object} - Validation result
 */
export const validateEmail = (email) => {
  const errors = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateInput,
  validateCareerName,
  validateSkillTree,
  validateURL,
  validateEmail
};