import * as _ from "lodash";
import Expression from './Expression';
import BaseAutoCompleteHandler from './BaseAutoCompleteHandler';
import FilterQueryParser from './FilterQueryParser';
import ParsedError from './ParsedError';

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const validateExpression = (
  expression: Expression,
  autoCompleteHandler: BaseAutoCompleteHandler
) : ValidationResult => {

  let result: ValidationResult = { isValid: true };
  const expressions = expression.expressions;

  if (expressions === undefined) {
    if (autoCompleteHandler.hasCategory(expression.category) === false) {
      result = {
        isValid: false,
        message: `Invalid category '${expression.category}' in expression ${expression.category} ${expression.operator} ${expression.value}`
      };
    } else if (autoCompleteHandler.hasOperator(expression.category, expression.operator) === false) {
      result = {
        isValid: false,
        message: `Invalid operator '${expression.operator}' in expression ${expression.category} ${expression.operator} ${expression.value}`
      };
    }
  } else if (expressions) {
    _.find(expressions, expr => {
      result = validateExpression(expr, autoCompleteHandler);
      return result.isValid === false;
    });
  } 

  return result;
}

const validateQueryExpression = (
    parsedQuery: Expression [],
    autoCompleteHandler: BaseAutoCompleteHandler
  ) : ValidationResult => {

  let result: ValidationResult = { isValid: true };
  _.find(parsedQuery, expr => {
    result = validateExpression(expr, autoCompleteHandler);
    return result.isValid === false;
  });

  return result;
}

const validateQueryString = (
  query: string,
  autoCompleteHandler: BaseAutoCompleteHandler
) : ValidationResult => {
  let result: ValidationResult;

  const parser = new FilterQueryParser();
  parser.setAutoCompleteHandler(autoCompleteHandler);
  const parseResult = parser.parse(query);
  if ((parseResult as ParsedError).isError) {
    result = { isValid: false, message: 'Error parser query string' };
  } else {
    result = validateQueryExpression(parseResult as Expression[], autoCompleteHandler);
  }

  return result;
}

export {
  ValidationResult,
  validateQueryExpression,
  validateQueryString
}