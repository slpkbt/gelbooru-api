const {
  formatTags,
  validateLimit,
  validatePid,
  validateId,
  sanitizeTags,
  createErrorResponse,
  isValidResponse,
  extractDataOrError,
} = require('../lib/utils');

describe('Utils', () => {
  describe('formatTags', () => {
    test('should format comma-separated tags', () => {
      expect(formatTags('tag1,tag2,tag3')).toBe('tag1 tag2 tag3');
    });

    test('should format array of tags', () => {
      expect(formatTags(['tag1', 'tag2', 'tag3'])).toBe('tag1 tag2 tag3');
    });

    test('should return empty string for invalid input', () => {
      expect(formatTags(null)).toBe('');
      expect(formatTags(undefined)).toBe('');
    });
  });

  describe('validateLimit', () => {
    test('should return valid limit', () => {
      expect(validateLimit(50)).toBe(50);
    });

    test('should clamp to max limit', () => {
      expect(validateLimit(2000, 1000)).toBe(1000);
    });

    test('should clamp to min limit', () => {
      expect(validateLimit(-5)).toBe(1);
    });

    test('should handle NaN', () => {
      expect(validateLimit('invalid')).toBe(1);
    });
  });

  describe('validatePid', () => {
    test('should return valid pid', () => {
      expect(validatePid(5)).toBe(5);
    });

    test('should return 0 for negative values', () => {
      expect(validatePid(-1)).toBe(0);
    });

    test('should handle NaN', () => {
      expect(validatePid('invalid')).toBe(0);
    });
  });

  describe('validateId', () => {
    test('should return valid id', () => {
      expect(validateId(123)).toBe(123);
    });

    test('should return 0 for negative values', () => {
      expect(validateId(-5)).toBe(0);
    });
  });

  describe('sanitizeTags', () => {
    test('should sanitize tags with extra spaces', () => {
      expect(sanitizeTags('  tag1  , tag2  ')).toBe('tag1 tag2');
    });

    test('should remove empty tags', () => {
      expect(sanitizeTags('tag1   tag2')).toBe('tag1 tag2');
    });
  });

  describe('createErrorResponse', () => {
    test('should create error response', () => {
      const error = createErrorResponse('Test error');
      expect(error).toEqual({
        success: false,
        message: 'Test error',
      });
    });

    test('should include error details', () => {
      const originalError = new Error('Original error');
      const error = createErrorResponse('Test error', originalError);
      expect(error).toHaveProperty('error');
    });
  });

  describe('isValidResponse', () => {
    test('should return true for valid response', () => {
      expect(isValidResponse({ post: [] }, 'post')).toBe(true);
    });

    test('should return false for invalid response', () => {
      expect(isValidResponse(null, 'post')).toBe(false);
      expect(isValidResponse({}, 'post')).toBe(false);
    });
  });

  describe('extractDataOrError', () => {
    test('should extract data from valid response', () => {
      const data = extractDataOrError({ post: [1, 2, 3] }, 'post', 'No posts');
      expect(data).toEqual([1, 2, 3]);
    });

    test('should return error for empty array', () => {
      const data = extractDataOrError({ post: [] }, 'post', 'No posts');
      expect(data).toHaveProperty('success', false);
    });

    test('should return error for invalid response', () => {
      const data = extractDataOrError({}, 'post', 'No posts');
      expect(data).toHaveProperty('success', false);
    });
  });
});
