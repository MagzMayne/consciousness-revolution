/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

#!/usr/bin/env node

/**
 * Backup and Rollback Utility
 * 
 * Provides backup creation and rollback functionality for scripts and files
 * Used by GitHub Actions workflows to protect working state
 * 
 * Usage:
 *   node backup-rollback.js backup --files file1.js,file2.js --label "deployment-v1"
 *   node backup-rollback.js rollback --label "deployment-v1"
 *   node backup-rollback.js list
 *   node backup-rollback.js clean --older-than 30
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class BackupRollbackManager {
  constructor() {
    this.repoRoot = process.cwd();
    this.backupDir = path.join(this.repoRoot, '.github', 'backups');
    this.manifestFile = path.join(this.backupDir, 'manifest.json');
    this.logFile = path.join(this.backupDir, 'backup-rollback.log');
    
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.log('Created backup directory', 'info');
    }
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'action': '🔧'
    }[level] || '📝';
    
    const logMessage = `[${timestamp}] ${prefix} ${message}`;
    console.log(logMessage);
    
    try {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    } catch (err) {
      console.error('Failed to write to log file:', err.message);
    }
  }

  getManifest() {
    if (!fs.existsSync(this.manifestFile)) {
      return { backups: [] };
    }
    
    try {
      const content = fs.readFileSync(this.manifestFile, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      this.log(`Failed to read manifest: ${err.message}`, 'error');
      return { backups: [] };
    }
  }

  saveManifest(manifest) {
    try {
      fs.writeFileSync(this.manifestFile, JSON.stringify(manifest, null, 2));
    } catch (err) {
      this.log(`Failed to save manifest: ${err.message}`, 'error');
      throw err;
    }
  }

  calculateHash(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
    } catch (err) {
      return 'unknown';
    }
  }

  getGitInfo() {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const commitShort = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      return { branch, commit, commitShort };
    } catch (err) {
      this.log('Failed to get git info', 'warning');
      return { branch: 'unknown', commit: 'unknown', commitShort: 'unknown' };
    }
  }

  backup(files, label, description = '') {
    this.log(`Starting backup: ${label}`, 'action');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `${label}_${timestamp}`;
    const backupPath = path.join(this.backupDir, backupId);
    
    // Create backup directory
    fs.mkdirSync(backupPath, { recursive: true });
    
    const backedUpFiles = [];
    const gitInfo = this.getGitInfo();
    
    // Backup each file
    for (const file of files) {
      const filePath = path.join(this.repoRoot, file);
      
      if (!fs.existsSync(filePath)) {
        this.log(`File not found, skipping: ${file}`, 'warning');
        continue;
      }
      
      try {
        // Calculate relative path to maintain directory structure
        const relativePath = path.relative(this.repoRoot, filePath);
        const backupFilePath = path.join(backupPath, relativePath);
        
        // Ensure directory exists
        const backupFileDir = path.dirname(backupFilePath);
        if (!fs.existsSync(backupFileDir)) {
          fs.mkdirSync(backupFileDir, { recursive: true });
        }
        
        // Copy file
        fs.copyFileSync(filePath, backupFilePath);
        
        const hash = this.calculateHash(filePath);
        const stats = fs.statSync(filePath);
        
        backedUpFiles.push({
          path: relativePath,
          hash,
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
        
        this.log(`Backed up: ${relativePath}`, 'success');
      } catch (err) {
        this.log(`Failed to backup ${file}: ${err.message}`, 'error');
      }
    }
    
    if (backedUpFiles.length === 0) {
      this.log('No files were backed up', 'error');
      // Clean up empty backup directory
      fs.rmSync(backupPath, { recursive: true, force: true });
      return null;
    }
    
    // Create backup metadata
    const metadata = {
      id: backupId,
      label,
      description,
      timestamp: new Date().toISOString(),
      git: gitInfo,
      files: backedUpFiles,
      fileCount: backedUpFiles.length,
      totalSize: backedUpFiles.reduce((sum, f) => sum + f.size, 0)
    };
    
    // Save metadata file
    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    // Update manifest
    const manifest = this.getManifest();
    manifest.backups.push(metadata);
    this.saveManifest(manifest);
    
    this.log(`Backup created: ${backupId} (${backedUpFiles.length} files)`, 'success');
    return metadata;
  }

  rollback(label) {
    this.log(`Starting rollback to: ${label}`, 'action');
    
    const manifest = this.getManifest();
    
    // Find the most recent backup with matching label
    const backup = manifest.backups
      .filter(b => b.label === label || b.id === label)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (!backup) {
      this.log(`Backup not found: ${label}`, 'error');
      return false;
    }
    
    const backupPath = path.join(this.backupDir, backup.id);
    
    if (!fs.existsSync(backupPath)) {
      this.log(`Backup directory not found: ${backup.id}`, 'error');
      return false;
    }
    
    this.log(`Found backup: ${backup.id} (${backup.fileCount} files)`, 'info');
    
    const restoredFiles = [];
    const failedFiles = [];
    
    // Restore each file
    for (const fileInfo of backup.files) {
      const backupFilePath = path.join(backupPath, fileInfo.path);
      const targetFilePath = path.join(this.repoRoot, fileInfo.path);
      
      if (!fs.existsSync(backupFilePath)) {
        this.log(`Backup file not found: ${fileInfo.path}`, 'warning');
        failedFiles.push(fileInfo.path);
        continue;
      }
      
      try {
        // Ensure target directory exists
        const targetDir = path.dirname(targetFilePath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Restore file
        fs.copyFileSync(backupFilePath, targetFilePath);
        restoredFiles.push(fileInfo.path);
        this.log(`Restored: ${fileInfo.path}`, 'success');
      } catch (err) {
        this.log(`Failed to restore ${fileInfo.path}: ${err.message}`, 'error');
        failedFiles.push(fileInfo.path);
      }
    }
    
    const success = failedFiles.length === 0;
    
    if (success) {
      this.log(`Rollback completed: ${restoredFiles.length} files restored`, 'success');
    } else {
      this.log(`Rollback completed with errors: ${restoredFiles.length} restored, ${failedFiles.length} failed`, 'warning');
    }
    
    return { success, restoredFiles, failedFiles };
  }

  list() {
    const manifest = this.getManifest();
    
    if (manifest.backups.length === 0) {
      this.log('No backups found', 'info');
      return [];
    }
    
    this.log(`Found ${manifest.backups.length} backups:`, 'info');
    
    // Sort by timestamp, newest first
    const sortedBackups = manifest.backups.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    sortedBackups.forEach((backup, index) => {
      const age = this.getAge(backup.timestamp);
      console.log(`\n${index + 1}. ${backup.label} (${backup.id})`);
      console.log(`   Created: ${backup.timestamp} (${age})`);
      console.log(`   Files: ${backup.fileCount} (${this.formatBytes(backup.totalSize)})`);
      console.log(`   Git: ${backup.git.branch}@${backup.git.commitShort}`);
      if (backup.description) {
        console.log(`   Description: ${backup.description}`);
      }
    });
    
    return sortedBackups;
  }

  clean(olderThanDays) {
    this.log(`Cleaning backups older than ${olderThanDays} days`, 'action');
    
    const manifest = this.getManifest();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const toDelete = manifest.backups.filter(
      b => new Date(b.timestamp) < cutoffDate
    );
    
    if (toDelete.length === 0) {
      this.log('No backups to clean', 'info');
      return;
    }
    
    this.log(`Found ${toDelete.length} backups to delete`, 'info');
    
    let deletedCount = 0;
    for (const backup of toDelete) {
      const backupPath = path.join(this.backupDir, backup.id);
      
      try {
        if (fs.existsSync(backupPath)) {
          fs.rmSync(backupPath, { recursive: true, force: true });
        }
        deletedCount++;
        this.log(`Deleted: ${backup.label} (${backup.id})`, 'success');
      } catch (err) {
        this.log(`Failed to delete ${backup.id}: ${err.message}`, 'error');
      }
    }
    
    // Update manifest
    manifest.backups = manifest.backups.filter(
      b => new Date(b.timestamp) >= cutoffDate
    );
    this.saveManifest(manifest);
    
    this.log(`Cleanup completed: ${deletedCount} backups deleted`, 'success');
  }

  getAge(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'less than an hour ago';
    }
  }

  formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const manager = new BackupRollbackManager();
  
  switch (command) {
    case 'backup': {
      const filesArg = args.find(arg => arg.startsWith('--files='));
      const labelArg = args.find(arg => arg.startsWith('--label='));
      const descArg = args.find(arg => arg.startsWith('--description='));
      
      if (!filesArg || !labelArg) {
        console.error('Usage: node backup-rollback.js backup --files=file1,file2 --label=backup-name [--description=desc]');
        process.exit(1);
      }
      
      const files = filesArg.split('=')[1].split(',').map(f => f.trim());
      const label = labelArg.split('=')[1];
      const description = descArg ? descArg.split('=')[1] : '';
      
      const result = manager.backup(files, label, description);
      
      if (result) {
        console.log('\n✅ Backup created successfully');
        console.log(`ID: ${result.id}`);
        console.log(`Files: ${result.fileCount}`);
        console.log(`Size: ${manager.formatBytes(result.totalSize)}`);
        process.exit(0);
      } else {
        console.error('\n❌ Backup failed');
        process.exit(1);
      }
    }
    
    case 'rollback': {
      const labelArg = args.find(arg => arg.startsWith('--label='));
      
      if (!labelArg) {
        console.error('Usage: node backup-rollback.js rollback --label=backup-name');
        process.exit(1);
      }
      
      const label = labelArg.split('=')[1];
      const result = manager.rollback(label);
      
      if (result && result.success) {
        console.log(`\n✅ Rollback completed successfully`);
        console.log(`Files restored: ${result.restoredFiles.length}`);
        process.exit(0);
      } else if (result) {
        console.error(`\n⚠️ Rollback completed with errors`);
        console.log(`Files restored: ${result.restoredFiles.length}`);
        console.log(`Files failed: ${result.failedFiles.length}`);
        process.exit(1);
      } else {
        console.error('\n❌ Rollback failed');
        process.exit(1);
      }
    }
    
    case 'list': {
      manager.list();
      process.exit(0);
    }
    
    case 'clean': {
      const daysArg = args.find(arg => arg.startsWith('--older-than='));
      const days = daysArg ? parseInt(daysArg.split('=')[1]) : 30;
      
      manager.clean(days);
      process.exit(0);
    }
    
    default:
      console.log('Backup and Rollback Utility\n');
      console.log('Usage:');
      console.log('  node backup-rollback.js backup --files=file1,file2 --label=name [--description=desc]');
      console.log('  node backup-rollback.js rollback --label=name');
      console.log('  node backup-rollback.js list');
      console.log('  node backup-rollback.js clean --older-than=30');
      console.log('\nCommands:');
      console.log('  backup    - Create a backup of specified files');
      console.log('  rollback  - Restore files from a backup');
      console.log('  list      - List all available backups');
      console.log('  clean     - Remove old backups');
      process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = BackupRollbackManager;
