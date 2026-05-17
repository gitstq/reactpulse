/**
 * ReactPulse - Utility Functions
 * Helper functions for file scanning and AST parsing
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import { glob } from 'glob';
import { ScanOptions, Config, Diagnostic, Category } from '../types';

/**
 * Default file patterns to include
 */
const DEFAULT_INCLUDE = [
  '**/*.{js,jsx,ts,tsx}',
  '!**/node_modules/**',
  '!**/dist/**',
  '!**/build/**',
  '!**/.next/**',
  '!**/coverage/**'
];

/**
 * Default file patterns to exclude
 */
const DEFAULT_EXCLUDE = [
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
  '.git'
];

/**
 * Find all React files in a directory
 */
export async function findReactFiles(
  directory: string,
  options: ScanOptions = { directory }
): Promise<string[]> {
  const include = options.include || DEFAULT_INCLUDE;
  const exclude = options.exclude || DEFAULT_EXCLUDE;
  
  const files = await glob(include, {
    cwd: directory,
    ignore: exclude,
    absolute: true,
    nodir: true
  });
  
  return files;
}

/**
 * Parse a file and return its AST
 */
export function parseFile(filePath: string): any {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath);
  
  const plugins: any[] = ['jsx'];
  
  if (ext === '.ts' || ext === '.tsx') {
    plugins.push('typescript');
  }
  
  try {
    return parse(content, {
      sourceType: 'module',
      plugins,
      errorRecovery: true
    });
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Get file content
 */
export function getFileContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Load configuration from reactpulse.config.json or package.json
 */
export function loadConfig(directory: string): Config {
  const configPath = path.join(directory, 'reactpulse.config.json');
  const packageJsonPath = path.join(directory, 'package.json');
  
  // Try reactpulse.config.json first
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Warning: Failed to parse ${configPath}`);
    }
  }
  
  // Try package.json
  if (fs.existsSync(packageJsonPath)) {
    try {
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      if (packageJson.reactpulse) {
        return packageJson.reactpulse;
      }
    } catch (error) {
      console.warn(`Warning: Failed to parse ${packageJsonPath}`);
    }
  }
  
  return {};
}

/**
 * Calculate health score based on diagnostics
 */
export function calculateScore(
  diagnostics: Diagnostic[],
  filesScanned: number
): number {
  if (filesScanned === 0) return 100;
  
  const errorWeight = 10;
  const warningWeight = 3;
  const infoWeight = 1;
  
  let penalty = 0;
  
  for (const diagnostic of diagnostics) {
    switch (diagnostic.severity) {
      case 'error':
        penalty += errorWeight;
        break;
      case 'warning':
        penalty += warningWeight;
        break;
      case 'info':
        penalty += infoWeight;
        break;
    }
  }
  
  // Normalize by number of files
  const normalizedPenalty = penalty / Math.max(filesScanned, 1);
  
  // Calculate score (0-100)
  const score = Math.max(0, Math.min(100, 100 - normalizedPenalty * 2));
  
  return Math.round(score);
}

/**
 * Get score rating
 */
export function getScoreRating(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excellent', color: 'green' };
  if (score >= 75) return { label: 'Good', color: 'cyan' };
  if (score >= 50) return { label: 'Needs Work', color: 'yellow' };
  if (score >= 25) return { label: 'Poor', color: 'orange' };
  return { label: 'Critical', color: 'red' };
}

/**
 * Generate summary by category
 */
export function generateCategorySummary(
  diagnostics: Diagnostic[]
): Record<Category, { errors: number; warnings: number; info: number }> {
  const categories: Category[] = [
    'state-effects',
    'performance',
    'architecture',
    'security',
    'accessibility',
    'best-practices'
  ];
  
  const summary: Record<Category, { errors: number; warnings: number; info: number }> = {} as any;
  
  for (const category of categories) {
    summary[category] = { errors: 0, warnings: 0, info: 0 };
  }
  
  for (const diagnostic of diagnostics) {
    summary[diagnostic.category][diagnostic.severity === 'error' ? 'errors' : diagnostic.severity === 'warning' ? 'warnings' : 'info']++;
  }
  
  return summary;
}

/**
 * Generate severity summary
 */
export function generateSeveritySummary(
  diagnostics: Diagnostic[]
): { errors: number; warnings: number; info: number } {
  return {
    errors: diagnostics.filter(d => d.severity === 'error').length,
    warnings: diagnostics.filter(d => d.severity === 'warning').length,
    info: diagnostics.filter(d => d.severity === 'info').length
  };
}

/**
 * Format file path for display
 */
export function formatFilePath(filePath: string, root: string): string {
  return path.relative(root, filePath);
}

/**
 * Check if file should be ignored
 */
export function shouldIgnoreFile(
  filePath: string,
  config: Config
): boolean {
  if (!config.ignore?.files) return false;
  
  const relativePath = filePath;
  
  for (const pattern of config.ignore.files) {
    if (relativePath.includes(pattern) || relativePath.match(globToRegex(pattern))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Convert glob pattern to regex
 */
function globToRegex(pattern: string): RegExp {
  const regexString = pattern
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '.');
  return new RegExp(regexString);
}

/**
 * Get relative path
 */
export function getRelativePath(filePath: string, root: string): string {
  return path.relative(root, filePath);
}
