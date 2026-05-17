/**
 * ReactPulse - Type Definitions
 * Core types for the React code health scanner
 */

export type Severity = 'error' | 'warning' | 'info';

export type Category = 
  | 'state-effects'
  | 'performance'
  | 'architecture'
  | 'security'
  | 'accessibility'
  | 'best-practices';

export interface Diagnostic {
  /** Rule ID that triggered this diagnostic */
  ruleId: string;
  /** Severity level */
  severity: Severity;
  /** Category of the issue */
  category: Category;
  /** Human-readable message */
  message: string;
  /** File path relative to project root */
  file: string;
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column: number;
  /** Suggested fix if available */
  suggestion?: string;
  /** Documentation URL for more info */
  docUrl?: string;
}

export interface Rule {
  /** Unique rule identifier */
  id: string;
  /** Rule name for display */
  name: string;
  /** Category this rule belongs to */
  category: Category;
  /** Default severity */
  defaultSeverity: Severity;
  /** Rule description */
  description: string;
  /** Detailed explanation */
  explanation: string;
  /** Check function that returns diagnostics */
  check: (context: RuleContext) => Diagnostic[];
}

export interface RuleContext {
  /** File path */
  filePath: string;
  /** Source code content */
  source: string;
  /** AST node (from @babel/parser) */
  ast: any;
  /** File extension */
  extension: string;
}

export interface ScanResult {
  /** Overall health score (0-100) */
  score: number;
  /** All diagnostics found */
  diagnostics: Diagnostic[];
  /** Number of files scanned */
  filesScanned: number;
  /** Scan duration in milliseconds */
  duration: number;
  /** Summary by category */
  summary: Record<Category, { errors: number; warnings: number; info: number }>;
  /** Summary by severity */
  severitySummary: { errors: number; warnings: number; info: number };
}

export interface ScanOptions {
  /** Directory to scan */
  directory: string;
  /** File patterns to include */
  include?: string[];
  /** File patterns to exclude */
  exclude?: string[];
  /** Show verbose output */
  verbose?: boolean;
  /** Output format */
  format?: 'text' | 'json';
  /** Fail on errors */
  failOn?: 'error' | 'warning' | 'none';
  /** Scan only changed files */
  diff?: string;
  /** Scan only staged files */
  staged?: boolean;
}

export interface Config {
  /** Rules to ignore */
  ignore?: {
    rules?: string[];
    files?: string[];
  };
  /** Custom rule severity overrides */
  rules?: Record<string, Severity | 'off'>;
  /** Output format */
  format?: 'text' | 'json';
  /** Fail threshold */
  failOn?: 'error' | 'warning' | 'none';
}
