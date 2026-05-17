/**
 * ReactPulse - Core Rules
 * Detection rules for React anti-patterns
 */

import { Rule, Diagnostic, RuleContext, Severity, Category } from '../types';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Rule: Detect useEffect without dependencies array
 */
export const noMissingDeps: Rule = {
  id: 'reactpulse/no-missing-deps',
  name: 'No Missing Dependencies',
  category: 'state-effects',
  defaultSeverity: 'error',
  description: 'useEffect should have a dependencies array',
  explanation: 'Missing dependencies array can cause infinite re-renders or stale closures. Always specify dependencies explicitly.',
  check: (context: RuleContext): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    
    traverse(context.ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (t.isIdentifier(callee) && callee.name === 'useEffect') {
          const args = path.node.arguments;
          if (args.length === 1) {
            diagnostics.push({
              ruleId: 'reactpulse/no-missing-deps',
              severity: 'error',
              category: 'state-effects',
              message: 'useEffect is missing a dependencies array. This can cause unexpected behavior.',
              file: context.filePath,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
              suggestion: 'Add a dependencies array as the second argument: useEffect(() => { ... }, [deps])',
              docUrl: 'https://react.dev/reference/react/useEffect#specifying-reactive-dependencies'
            });
          }
        }
      }
    });
    
    return diagnostics;
  }
};

/**
 * Rule: Detect useState with derived state
 */
export const noDerivedState: Rule = {
  id: 'reactpulse/no-derived-state',
  name: 'No Derived State',
  category: 'state-effects',
  defaultSeverity: 'warning',
  description: 'Avoid useState for values that can be derived from props or other state',
  explanation: 'Derived state should be computed during render, not stored in state. This avoids synchronization issues.',
  check: (context: RuleContext): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    
    traverse(context.ast, {
      VariableDeclarator(path) {
        if (
          t.isCallExpression(path.node.init) &&
          t.isIdentifier(path.node.init.callee) &&
          path.node.init.callee.name === 'useState'
        ) {
          // Check if initial value is derived from props
          const initArg = path.node.init.arguments[0];
          if (initArg && t.isMemberExpression(initArg)) {
            diagnostics.push({
              ruleId: 'reactpulse/no-derived-state',
              severity: 'warning',
              category: 'state-effects',
              message: 'useState initial value appears to be derived from props. Consider computing during render instead.',
              file: context.filePath,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
              suggestion: 'const derivedValue = props.value; // Compute during render',
              docUrl: 'https://react.dev/learn/you-might-not-need-an-effect'
            });
          }
        }
      }
    });
    
    return diagnostics;
  }
};

/**
 * Rule: Detect missing key prop in list rendering
 */
export const noMissingKey: Rule = {
  id: 'reactpulse/no-missing-key',
  name: 'No Missing Key',
  category: 'best-practices',
  defaultSeverity: 'error',
  description: 'List items should have a unique key prop',
  explanation: 'Keys help React identify which items have changed, added, or removed. Always provide a stable key.',
  check: (context: RuleContext): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    
    traverse(context.ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.property) &&
          callee.property.name === 'map'
        ) {
          // Check if the callback returns JSX with key
          const callback = path.node.arguments[0];
          if (callback && (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback))) {
            const body = callback.body;
            let hasKey = false;
            
            // Simple check for JSX element with key prop
            if (t.isJSXElement(body) || t.isJSXFragment(body)) {
              if (t.isJSXElement(body)) {
                hasKey = body.openingElement.attributes?.some(
                  attr => t.isJSXAttribute(attr) && attr.name.name === 'key'
                ) || false;
              }
            }
            
            if (!hasKey && (t.isJSXElement(body) || t.isBlockStatement(body))) {
              diagnostics.push({
                ruleId: 'reactpulse/no-missing-key',
                severity: 'error',
                category: 'best-practices',
                message: 'List item may be missing a key prop. Keys are essential for React reconciliation.',
                file: context.filePath,
                line: path.node.loc?.start.line || 0,
                column: path.node.loc?.start.column || 0,
                suggestion: 'Add a unique key prop: key={item.id}',
                docUrl: 'https://react.dev/learn/rendering-lists#why-does-react-need-keys'
              });
            }
          }
        }
      }
    });
    
    return diagnostics;
  }
};

/**
 * Rule: Detect inline function definitions in render
 */
export const noInlineFunction: Rule = {
  id: 'reactpulse/no-inline-function',
  name: 'Avoid Inline Functions',
  category: 'performance',
  defaultSeverity: 'warning',
  description: 'Avoid defining functions inline in JSX props to prevent unnecessary re-renders',
  explanation: 'Inline functions create a new function on every render, which can cause child components to re-render unnecessarily.',
  check: (context: RuleContext): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    
    traverse(context.ast, {
      JSXAttribute(path) {
        const value = path.node.value;
        if (
          value &&
          t.isJSXExpressionContainer(value) &&
          (t.isArrowFunctionExpression(value.expression) || t.isFunctionExpression(value.expression))
        ) {
          const attrName = t.isJSXIdentifier(path.node.name) ? path.node.name.name : '';
          if (['onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur'].includes(attrName)) {
            diagnostics.push({
              ruleId: 'reactpulse/no-inline-function',
              severity: 'warning',
              category: 'performance',
              message: `Inline function in "${attrName}" prop creates a new function on every render.`,
              file: context.filePath,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
              suggestion: 'Use useCallback or define the handler outside render.',
              docUrl: 'https://react.dev/reference/react/useCallback'
            });
          }
        }
      }
    });
    
    return diagnostics;
  }
};

/**
 * Rule: Detect console.log in production code
 */
export const noConsoleLog: Rule = {
  id: 'reactpulse/no-console-log',
  name: 'No Console Log',
  category: 'best-practices',
  defaultSeverity: 'warning',
  description: 'Avoid leaving console.log statements in production code',
  explanation: 'Console statements can expose sensitive information and impact performance in production.',
  check: (context: RuleContext): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    
    traverse(context.ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object) &&
          callee.object.name === 'console' &&
          t.isIdentifier(callee.property) &&
          callee.property.name === 'log'
        ) {
          diagnostics.push({
            ruleId: 'reactpulse/no-console-log',
            severity: 'warning',
            category: 'best-practices',
            message: 'console.log found in code. Remove before production.',
            file: context.filePath,
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0,
            suggestion: 'Remove console.log or use a proper logging library.'
          });
        }
      }
    });
    
    return diagnostics;
  }
};

/**
 * Rule: Detect direct DOM manipulation
 */
export const noDirectDomManipulation: Rule = {
  id: 'reactpulse/no-direct-dom',
  name: 'No Direct DOM Manipulation',
  category: 'architecture',
  defaultSeverity: 'error',
  description: 'Avoid direct DOM manipulation in React components',
  explanation: 'Direct DOM manipulation bypasses React reconciliation and can cause bugs. Use refs instead.',
  check: (context: RuleContext): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    
    traverse(context.ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object) &&
          callee.object.name === 'document'
        ) {
          const method = t.isIdentifier(callee.property) ? callee.property.name : '';
          if (['getElementById', 'querySelector', 'querySelectorAll'].includes(method)) {
            diagnostics.push({
              ruleId: 'reactpulse/no-direct-dom',
              severity: 'error',
              category: 'architecture',
              message: `Direct DOM access via document.${method} detected. Use React refs instead.`,
              file: context.filePath,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
              suggestion: 'Use useRef hook: const ref = useRef(null); <div ref={ref}>',
              docUrl: 'https://react.dev/reference/react/useRef'
            });
          }
        }
      }
    });
    
    return diagnostics;
  }
};

/**
 * Rule: Detect dangerouslySetInnerHTML
 */
export const noDangerouslySetInnerHTML: Rule = {
  id: 'reactpulse/no-dangerously-set-inner-html',
  name: 'No Dangerously Set Inner HTML',
  category: 'security',
  defaultSeverity: 'error',
  description: 'Avoid using dangerouslySetInnerHTML as it can lead to XSS vulnerabilities',
  explanation: 'dangerouslySetInnerHTML bypasses React XSS protections. Only use with properly sanitized content.',
  check: (context: RuleContext): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    
    traverse(context.ast, {
      JSXAttribute(path) {
        if (
          t.isJSXIdentifier(path.node.name) &&
          path.node.name.name === 'dangerouslySetInnerHTML'
        ) {
          diagnostics.push({
            ruleId: 'reactpulse/no-dangerously-set-inner-html',
            severity: 'error',
            category: 'security',
            message: 'dangerouslySetInnerHTML can lead to XSS vulnerabilities. Ensure content is properly sanitized.',
            file: context.filePath,
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0,
            suggestion: 'Use a sanitization library like DOMPurify: dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}',
            docUrl: 'https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html'
          });
        }
      }
    });
    
    return diagnostics;
  }
};

/**
 * Rule: Detect missing alt attribute on images
 */
export const noMissingAlt: Rule = {
  id: 'reactpulse/no-missing-alt',
  name: 'No Missing Alt',
  category: 'accessibility',
  defaultSeverity: 'error',
  description: 'Images should have an alt attribute for accessibility',
  explanation: 'Alt text provides context for screen readers and is displayed when images fail to load.',
  check: (context: RuleContext): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    
    traverse(context.ast, {
      JSXOpeningElement(path) {
        if (
          t.isJSXIdentifier(path.node.name) &&
          path.node.name.name === 'img'
        ) {
          const hasAlt = path.node.attributes?.some(
            attr => t.isJSXAttribute(attr) && attr.name.name === 'alt'
          );
          
          if (!hasAlt) {
            diagnostics.push({
              ruleId: 'reactpulse/no-missing-alt',
              severity: 'error',
              category: 'accessibility',
              message: 'Image element is missing an alt attribute. This affects accessibility.',
              file: context.filePath,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
              suggestion: 'Add alt attribute: alt="Description of image"',
              docUrl: 'https://react.dev/reference/react-dom/components/common#alt'
            });
          }
        }
      }
    });
    
    return diagnostics;
  }
};

/**
 * Rule: Detect useEffect for data fetching without cleanup
 */
export const noFetchInEffect: Rule = {
  id: 'reactpulse/no-fetch-in-effect',
  name: 'No Fetch in Effect Without Cleanup',
  category: 'state-effects',
  defaultSeverity: 'warning',
  description: 'Data fetching in useEffect should handle cleanup to avoid race conditions',
  explanation: 'Without cleanup, stale requests can update state after component unmount, causing memory leaks.',
  check: (context: RuleContext): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    
    traverse(context.ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (t.isIdentifier(callee) && callee.name === 'useEffect') {
          const callback = path.node.arguments[0];
          if (callback && (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback))) {
            const body = callback.body;
            let hasFetch = false;
            let hasCleanup = false;
            
            // Check for fetch calls in the body
            const sourceCode = context.source;
            const effectStart = body.loc?.start.line || 0;
            const effectEnd = body.loc?.end.line || 0;
            const lines = sourceCode.split('\n');
            
            for (let i = effectStart - 1; i < effectEnd && i < lines.length; i++) {
              if (lines[i].includes('fetch(') || lines[i].includes('.fetch(')) {
                hasFetch = true;
                break;
              }
            }
            
            // Check for cleanup return
            if (t.isBlockStatement(body)) {
              const lastStatement = body.body[body.body.length - 1];
              if (t.isReturnStatement(lastStatement)) {
                hasCleanup = true;
              }
            }
            
            if (hasFetch && !hasCleanup) {
              diagnostics.push({
                ruleId: 'reactpulse/no-fetch-in-effect',
                severity: 'warning',
                category: 'state-effects',
                message: 'Data fetching in useEffect without cleanup. This can cause race conditions.',
                file: context.filePath,
                line: path.node.loc?.start.line || 0,
                column: path.node.loc?.start.column || 0,
                suggestion: 'Return a cleanup function: useEffect(() => { let ignore = false; fetch(...).then(data => { if (!ignore) setState(data); }); return () => { ignore = true; }; }, []);',
                docUrl: 'https://react.dev/reference/react/useEffect#fetching-data'
              });
            }
          }
        }
      }
    });
    
    return diagnostics;
  }
};

/**
 * All available rules
 */
export const allRules: Rule[] = [
  noMissingDeps,
  noDerivedState,
  noMissingKey,
  noInlineFunction,
  noConsoleLog,
  noDirectDomManipulation,
  noDangerouslySetInnerHTML,
  noMissingAlt,
  noFetchInEffect
];

/**
 * Get rule by ID
 */
export function getRule(id: string): Rule | undefined {
  return allRules.find(rule => rule.id === id);
}

/**
 * Get rules by category
 */
export function getRulesByCategory(category: Category): Rule[] {
  return allRules.filter(rule => rule.category === category);
}
