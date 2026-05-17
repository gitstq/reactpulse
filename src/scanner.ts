/**
 * ReactPulse - Scanner Module
 * Core scanning functionality
 */

import * as path from 'path';
import { ScanResult, ScanOptions, Diagnostic, RuleContext, Config, Category } from './types';
import { allRules } from './rules';
import {
  findReactFiles,
  parseFile,
  getFileContent,
  loadConfig,
  calculateScore,
  generateCategorySummary,
  generateSeveritySummary,
  shouldIgnoreFile,
  getRelativePath
} from './utils';

/**
 * Scan a React project for health issues
 */
export async function scan(options: ScanOptions): Promise<ScanResult> {
  const startTime = Date.now();
  const directory = path.resolve(options.directory);
  const config = loadConfig(directory);
  
  // Find all React files
  const files = await findReactFiles(directory, options);
  
  const allDiagnostics: Diagnostic[] = [];
  let filesScanned = 0;
  
  // Scan each file
  for (const filePath of files) {
    // Check if file should be ignored
    if (shouldIgnoreFile(filePath, config)) {
      continue;
    }
    
    const relativePath = getRelativePath(filePath, directory);
    const extension = path.extname(filePath);
    
    // Parse the file
    const ast = parseFile(filePath);
    if (!ast) continue;
    
    const source = getFileContent(filePath);
    
    // Create rule context
    const context: RuleContext = {
      filePath: relativePath,
      source,
      ast,
      extension
    };
    
    // Run all rules
    for (const rule of allRules) {
      // Check if rule is disabled
      if (config.ignore?.rules?.includes(rule.id)) {
        continue;
      }
      
      // Check for severity override
      const severityOverride = config.rules?.[rule.id];
      if (severityOverride === 'off') {
        continue;
      }
      
      try {
        const diagnostics = rule.check(context);
        
        // Apply severity override if set (already excluded 'off' above)
        if (severityOverride === 'error' || severityOverride === 'warning' || severityOverride === 'info') {
          for (const diagnostic of diagnostics) {
            diagnostic.severity = severityOverride;
          }
        }
        
        allDiagnostics.push(...diagnostics);
      } catch (error) {
        console.error(`Error running rule ${rule.id} on ${relativePath}:`, error);
      }
    }
    
    filesScanned++;
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Calculate score
  const score = calculateScore(allDiagnostics, filesScanned);
  
  // Generate summaries
  const summary = generateCategorySummary(allDiagnostics);
  const severitySummary = generateSeveritySummary(allDiagnostics);
  
  return {
    score,
    diagnostics: allDiagnostics,
    filesScanned,
    duration,
    summary,
    severitySummary
  };
}

/**
 * Get all available rules
 */
export function getAvailableRules() {
  return allRules.map(rule => ({
    id: rule.id,
    name: rule.name,
    category: rule.category,
    severity: rule.defaultSeverity,
    description: rule.description
  }));
}

/**
 * Print scan results to console
 */
export function printResults(result: ScanResult, verbose: boolean = false): void {
  const chalk = require('chalk');
  const Table = require('cli-table3');
  
  console.log('\n');
  
  // Print score
  const scoreColor = getScoreColor(result.score);
  console.log(chalk.bold('  Health Score: ') + chalk.bold[scoreColor](`${result.score}/100`));
  console.log(chalk.gray(`  Files scanned: ${result.filesScanned}`));
  console.log(chalk.gray(`  Duration: ${result.duration}ms`));
  console.log('\n');
  
  // Print severity summary
  console.log(chalk.bold('  Summary:'));
  console.log(`    ${chalk.red('Errors:')} ${result.severitySummary.errors}`);
  console.log(`    ${chalk.yellow('Warnings:')} ${result.severitySummary.warnings}`);
  console.log(`    ${chalk.blue('Info:')} ${result.severitySummary.info}`);
  console.log('\n');
  
  // Print category breakdown
  console.log(chalk.bold('  By Category:'));
  const categoryTable = new Table({
    head: ['Category', 'Errors', 'Warnings', 'Info'],
    colWidths: [20, 10, 10, 10]
  });
  
  for (const [category, counts] of Object.entries(result.summary)) {
    if (counts.errors + counts.warnings + counts.info > 0) {
      categoryTable.push([
        category,
        counts.errors.toString(),
        counts.warnings.toString(),
        counts.info.toString()
      ]);
    }
  }
  
  console.log(categoryTable.toString());
  console.log('\n');
  
  // Print diagnostics
  if (result.diagnostics.length > 0) {
    console.log(chalk.bold('  Issues Found:'));
    console.log('\n');
    
    const diagnosticsToShow = verbose 
      ? result.diagnostics 
      : result.diagnostics.slice(0, 10);
    
    for (const diagnostic of diagnosticsToShow) {
      const severityIcon = diagnostic.severity === 'error' ? chalk.red('✖') 
        : diagnostic.severity === 'warning' ? chalk.yellow('⚠') 
        : chalk.blue('ℹ');
      
      console.log(`  ${severityIcon} ${chalk.gray(`${diagnostic.file}:${diagnostic.line}:${diagnostic.column}`)}`);
      console.log(`    ${diagnostic.message}`);
      if (diagnostic.suggestion) {
        console.log(`    ${chalk.green('Suggestion:')} ${diagnostic.suggestion}`);
      }
      console.log('\n');
    }
    
    if (!verbose && result.diagnostics.length > 10) {
      console.log(chalk.gray(`  ... and ${result.diagnostics.length - 10} more issues. Use --verbose to see all.`));
      console.log('\n');
    }
  } else {
    console.log(chalk.green('  ✓ No issues found!'));
    console.log('\n');
  }
}

/**
 * Get score color for chalk
 */
function getScoreColor(score: number): string {
  if (score >= 90) return 'green';
  if (score >= 75) return 'cyan';
  if (score >= 50) return 'yellow';
  if (score >= 25) return 'orange';
  return 'red';
}

/**
 * Export results as JSON
 */
export function exportJson(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}
