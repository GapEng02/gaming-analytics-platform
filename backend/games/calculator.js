class Calculator {
  constructor() {
    this.expression = '';
    this.result = null;
    this.history = [];
  }

  evaluate(expression) {
    try {
      // Sanitize input - only allow numbers and basic operators
      const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
      
      if (sanitized.length === 0) {
        return { error: 'Empty expression' };
      }
      
      // Use Function constructor for safe evaluation
      const result = new Function(`return (${sanitized})`)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        return { error: 'Invalid result' };
      }
      
      this.expression = sanitized;
      this.result = result;
      this.history.push({ expression: sanitized, result });
      
      return {
        success: true,
        expression: sanitized,
        result: result,
        history: this.history
      };
    } catch (error) {
      return { error: 'Invalid expression' };
    }
  }

  getState() {
    return {
      expression: this.expression,
      result: this.result,
      history: this.history
    };
  }

  reset() {
    this.expression = '';
    this.result = null;
  }

  clearHistory() {
    this.history = [];
  }
}

module.exports = Calculator;
