#!/usr/bin/env node
/**
 * ReactPulse - CLI Entry Point
 * Command-line interface for React code health scanner
 */

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { scan, printResults, exportJson, getAvailableRules } from './scanner';
import { ScanOptions } from './types';

const packageJson = require('../package.json');

const program = new Command();

program
  .name('reactpulse')
  .description('A lightweight React code health scanner')
  .version(packageJson.version);

program
  .argument('[directory]', 'Directory to scan', '.')
  .option('-v, --verbose', 'Show verbose output with all issues', false)
  .option('--json', 'Output results as JSON', false)
  .option('--fail-on <level>', 'Exit with error code on issues (error, warning, none)', 'none')
  .option('--diff <branch>', 'Scan only files changed vs base branch')
  .option('--staged', 'Scan only staged files', false)
  .option('--rules', 'List all available rules', false)
  .action(async (directory: string, options: any) => {
    try {
      // Show rules if requested
      if (options.rules) {
        console.log('\nAvailable Rules:\n');
        const rules = getAvailableRules();
        for (const rule of rules) {
          console.log(`  ${rule.id}`);
          console.log(`    ${rule.description}`);
          console.log(`    Category: ${rule.category} | Severity: ${rule.severity}`);
          console.log('');
        }
        process.exit(0);
      }

      // Resolve directory
      const targetDir = path.resolve(directory);
      
      // Check if directory exists
      if (!fs.existsSync(targetDir)) {
        console.error(`Error: Directory not found: ${targetDir}`);
        process.exit(1);
      }
      
      // Check if it's a React project
      const packageJsonPath = path.join(targetDir, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        console.error(`Error: No package.json found in ${targetDir}`);
        console.error('Please run this command in a React project directory.');
        process.exit(1);
      }
      
      // Build scan options
      const scanOptions: ScanOptions = {
        directory: targetDir,
        verbose: options.verbose,
        format: options.json ? 'json' : 'text',
        failOn: options.failOn,
        diff: options.diff,
        staged: options.staged
      };
      
      // Show scanning message
      if (!options.json) {
        console.log('\n  🔍 ReactPulse - Scanning your React code...\n');
      }
      
      // Run scan
      const result = await scan(scanOptions);
      
      // Output results
      if (options.json) {
        console.log(exportJson(result));
      } else {
        printResults(result, options.verbose);
      }
      
      // Handle fail-on option
      if (options.failOn === 'error' && result.severitySummary.errors > 0) {
        process.exit(1);
      }
      if (options.failOn === 'warning' && (result.severitySummary.errors > 0 || result.severitySummary.warnings > 0)) {
        process.exit(1);
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Error during scan:', error);
      process.exit(1);
    }
  });

// Add init command for creating config
program
  .command('init')
  .description('Create a reactpulse.config.json file')
  .option('-f, --force', 'Overwrite existing config', false)
  .action((options: any) => {
    const configPath = path.join(process.cwd(), 'reactpulse.config.json');
    
    if (fs.existsSync(configPath) && !options.force) {
      console.error('reactpulse.config.json already exists. Use --force to overwrite.');
      process.exit(1);
    }
    
    const defaultConfig = {
      ignore: {
        rules: [],
        files: ['**/node_modules/**', '**/dist/**', '**/build/**']
      },
      rules: {},
      format: 'text',
      failOn: 'none'
    };
    
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('✓ Created reactpulse.config.json');
    process.exit(0);
  });

// Parse arguments
program.parse();
