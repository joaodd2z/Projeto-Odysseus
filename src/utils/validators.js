/**
 * Domain-specific validation system for Project Odysseus
 * Implements business logic validation with performance optimization
 */

import { skillTreeLogger } from './logger.js';

// Validation result structure
class ValidationResult {
  constructor(isValid = true, errors = [], warnings = []) {
    this.isValid = isValid;
    this.errors = errors;
    this.warnings = warnings;
    this.timestamp = Date.now();
  }

  addError(field, message, code = null) {
    this.errors.push({ field, message, code, severity: 'error' });
    this.isValid = false;
    return this;
  }

  addWarning(field, message, code = null) {
    this.warnings.push({ field, message, code, severity: 'warning' });
    return this;
  }

  merge(other) {
    this.errors.push(...other.errors);
    this.warnings.push(...other.warnings);
    this.isValid = this.isValid && other.isValid;
    return this;
  }

  getFirstError() {
    return this.errors.length > 0 ? this.errors[0] : null;
  }

  hasErrorForField(field) {
    return this.errors.some(error => error.field === field);
  }
}

// Base validator class
class BaseValidator {
  constructor(options = {}) {
    this.options = {
      strict: false,
      skipWarnings: false,
      ...options
    };
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  getCacheKey(data) {
    return JSON.stringify(data);
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, result) {
    this.cache.set(key, {
      result: new ValidationResult(result.isValid, [...result.errors], [...result.warnings]),
      timestamp: Date.now()
    });
  }

  validate(data) {
    const cacheKey = this.getCacheKey(data);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    const startTime = performance.now();
    const result = this.performValidation(data);
    const duration = performance.now() - startTime;
    
    this.setCache(cacheKey, result);
    return result;
  }

  performValidation(data) {
    throw new Error('performValidation must be implemented by subclass');
  }
}

// Skill tree structure validator
class SkillTreeValidator extends BaseValidator {
  constructor(options = {}) {
    super(options);
    this.maxDepth = options.maxDepth || 10;
    this.maxSkillsPerCategory = options.maxSkillsPerCategory || 50;
    this.requiredFields = ['objetivo', 'categorias'];
  }

  performValidation(skillTree) {
    const result = new ValidationResult();

    if (!skillTree || typeof skillTree !== 'object') {
      return result.addError('root', 'Skill tree must be a valid object', 'INVALID_TYPE');
    }

    this.validateRequiredFields(skillTree, result);
    this.validateObjective(skillTree.objetivo, result);
    this.validateCategories(skillTree.categorias, result);
    this.validateStructuralIntegrity(skillTree, result);

    return result;
  }

  validateRequiredFields(skillTree, result) {
    this.requiredFields.forEach(field => {
      if (!(field in skillTree)) {
        result.addError(field, `Required field '${field}' is missing`, 'MISSING_FIELD');
      }
    });
  }

  validateObjective(objetivo, result) {
    if (!objetivo) {
      result.addError('objetivo', 'Objective cannot be empty', 'EMPTY_OBJECTIVE');
      return;
    }

    if (typeof objetivo !== 'string') {
      result.addError('objetivo', 'Objective must be a string', 'INVALID_TYPE');
      return;
    }

    if (objetivo.length < 10) {
      result.addWarning('objetivo', 'Objective seems too short for meaningful guidance', 'SHORT_OBJECTIVE');
    }

    if (objetivo.length > 500) {
      result.addError('objetivo', 'Objective is too long (max 500 characters)', 'OBJECTIVE_TOO_LONG');
    }

    const wordCount = objetivo.trim().split(/\s+/).length;
    if (wordCount < 3) {
      result.addWarning('objetivo', 'Objective should contain more descriptive content', 'INSUFFICIENT_DETAIL');
    }
  }

  validateCategories(categorias, result) {
    if (!Array.isArray(categorias)) {
      result.addError('categorias', 'Categories must be an array', 'INVALID_TYPE');
      return;
    }

    if (categorias.length === 0) {
      result.addError('categorias', 'At least one category is required', 'EMPTY_CATEGORIES');
      return;
    }

    if (categorias.length > 20) {
      result.addWarning('categorias', 'Too many categories may overwhelm users', 'TOO_MANY_CATEGORIES');
    }

    categorias.forEach((categoria, index) => {
      this.validateCategory(categoria, index, result);
    });

    const categoryNames = categorias.map(cat => cat.nome?.toLowerCase()).filter(Boolean);
    const duplicates = categoryNames.filter((name, index) => categoryNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      result.addError('categorias', `Duplicate category names found: ${duplicates.join(', ')}`, 'DUPLICATE_CATEGORIES');
    }
  }

  validateCategory(categoria, index, result) {
    const fieldPrefix = `categorias[${index}]`;

    if (!categoria || typeof categoria !== 'object') {
      result.addError(fieldPrefix, 'Category must be a valid object', 'INVALID_TYPE');
      return;
    }

    if (!categoria.nome) {
      result.addError(`${fieldPrefix}.nome`, 'Category name is required', 'MISSING_NAME');
    } else if (typeof categoria.nome !== 'string') {
      result.addError(`${fieldPrefix}.nome`, 'Category name must be a string', 'INVALID_TYPE');
    } else if (categoria.nome.length < 2) {
      result.addError(`${fieldPrefix}.nome`, 'Category name too short', 'NAME_TOO_SHORT');
    }

    if (!Array.isArray(categoria.habilidades)) {
      result.addError(`${fieldPrefix}.habilidades`, 'Skills must be an array', 'INVALID_TYPE');
      return;
    }

    if (categoria.habilidades.length === 0) {
      result.addWarning(`${fieldPrefix}.habilidades`, 'Category has no skills', 'EMPTY_SKILLS');
    }

    if (categoria.habilidades.length > this.maxSkillsPerCategory) {
      result.addWarning(`${fieldPrefix}.habilidades`, 
        `Too many skills in category (${categoria.habilidades.length} > ${this.maxSkillsPerCategory})`, 
        'TOO_MANY_SKILLS');
    }

    categoria.habilidades.forEach((skill, skillIndex) => {
      this.validateSkill(skill, `${fieldPrefix}.habilidades[${skillIndex}]`, result);
    });
  }

  validateSkill(skill, fieldPrefix, result) {
    if (!skill || typeof skill !== 'string') {
      result.addError(fieldPrefix, 'Skill must be a non-empty string', 'INVALID_SKILL');
      return;
    }

    if (skill.length < 2) {
      result.addError(fieldPrefix, 'Skill name too short', 'SKILL_TOO_SHORT');
    }

    if (skill.length > 100) {
      result.addError(fieldPrefix, 'Skill name too long (max 100 characters)', 'SKILL_TOO_LONG');
    }

    if (!/[a-zA-Z]/.test(skill)) {
      result.addWarning(fieldPrefix, 'Skill should contain alphabetic characters', 'NON_ALPHABETIC_SKILL');
    }
  }

  validateStructuralIntegrity(skillTree, result) {
    const totalSkills = skillTree.categorias?.reduce((total, cat) => 
      total + (cat.habilidades?.length || 0), 0) || 0;
    
    if (totalSkills === 0) {
      result.addError('structure', 'Skill tree contains no skills', 'NO_SKILLS');
    } else if (totalSkills > 200) {
      result.addWarning('structure', 'Very large skill tree may impact performance', 'LARGE_TREE');
    }

    if (skillTree.categorias?.length > 0) {
      const skillCounts = skillTree.categorias.map(cat => cat.habilidades?.length || 0);
      const maxSkills = Math.max(...skillCounts);
      const minSkills = Math.min(...skillCounts);
      
      if (maxSkills > minSkills * 3) {
        result.addWarning('structure', 'Skill distribution is unbalanced across categories', 'UNBALANCED_TREE');
      }
    }
  }
}

// User input validator
class UserInputValidator extends BaseValidator {
  performValidation(input) {
    const result = new ValidationResult();

    if (!input || typeof input !== 'string') {
      return result.addError('input', 'Input must be a non-empty string', 'INVALID_INPUT');
    }

    const trimmed = input.trim();
    
    if (trimmed.length === 0) {
      return result.addError('input', 'Input cannot be empty', 'EMPTY_INPUT');
    }

    if (trimmed.length < 5) {
      result.addWarning('input', 'Input seems too short for meaningful results', 'SHORT_INPUT');
    }

    if (trimmed.length > 1000) {
      result.addError('input', 'Input too long (max 1000 characters)', 'INPUT_TOO_LONG');
    }

    if (/[<>"'&]/.test(trimmed)) {
      result.addWarning('input', 'Input contains potentially unsafe characters', 'UNSAFE_CHARACTERS');
    }

    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount < 2) {
      result.addWarning('input', 'Input should contain multiple words for better results', 'SINGLE_WORD');
    }

    return result;
  }
}

// API response validator
class APIResponseValidator extends BaseValidator {
  performValidation(response) {
    const result = new ValidationResult();

    if (!response) {
      return result.addError('response', 'Response cannot be null or undefined', 'NULL_RESPONSE');
    }

    if (response.error) {
      result.addError('api', `API returned error: ${response.error}`, 'API_ERROR');
    }

    if (response.data) {
      const skillTreeValidator = new SkillTreeValidator();
      const skillTreeResult = skillTreeValidator.validate(response.data);
      result.merge(skillTreeResult);
    }

    return result;
  }
}

// Factory function for creating validators
export const createValidator = (type, options = {}) => {
  switch (type) {
    case 'skillTree':
      return new SkillTreeValidator(options);
    case 'userInput':
      return new UserInputValidator(options);
    case 'apiResponse':
      return new APIResponseValidator(options);
    default:
      throw new Error(`Unknown validator type: ${type}`);
  }
};

// Pre-configured validators
export const skillTreeValidator = new SkillTreeValidator();
export const userInputValidator = new UserInputValidator();
export const apiResponseValidator = new APIResponseValidator();

// Validation utilities
export const validateSkillTree = (data) => skillTreeValidator.validate(data);
export const validateUserInput = (input) => userInputValidator.validate(input);
export const validateAPIResponse = (response) => apiResponseValidator.validate(response);

export { ValidationResult, BaseValidator, SkillTreeValidator, UserInputValidator, APIResponseValidator };