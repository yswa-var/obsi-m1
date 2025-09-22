#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONTENT_DIR = path.join(__dirname, '../content');
const OLLAMA_MODEL = 'gemma3:latest';
const MAX_CONTENT_LENGTH = 1000; // Limit content sent to Ollama

/**
 * Check if Ollama is running
 */
function checkOllamaRunning() {
  try {
    execSync('curl -s http://localhost:11434/api/version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate description using Ollama
 */
async function generateDescription(content, title) {
  const prompt = `Write a single, concise sentence describing this blog post titled "${title}". Focus on the main topic. Be direct and specific. Do not include options or formatting.

Content preview:
${content.substring(0, MAX_CONTENT_LENGTH)}${content.length > MAX_CONTENT_LENGTH ? '...' : ''}

Description:`;

  try {
    const response = execSync(`curl -s http://localhost:11434/api/generate -d '{
      "model": "${OLLAMA_MODEL}",
      "prompt": ${JSON.stringify(prompt)},
      "stream": false
    }'`, { encoding: 'utf8' });
    
    const result = JSON.parse(response);
    let description = result.response?.trim() || '';
    
    // Clean up the description - remove common prefixes and formatting
    description = description
      .replace(/^(Here's a|Here is a|This is a|The blog post|This blog post|Description:|Summary:)/i, '')
      .replace(/^\s*[-*•]\s*/, '') // Remove bullet points
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^,\s*/, '') // Remove leading commas
      .replace(/^,?\s*"[^"]*",?\s*/, '') // Remove quoted titles at the beginning
      .trim();
    
    // Take only the first sentence if multiple sentences
    const sentences = description.split(/[.!?]+/);
    if (sentences.length > 1 && sentences[0].trim()) {
      description = sentences[0].trim() + '.';
    }
    
    return description;
  } catch (error) {
    console.error(`Error generating description for ${title}:`, error.message);
    return '';
  }
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content };
  }
  
  const [, frontmatterStr, bodyContent] = match;
  const frontmatter = {};
  
  // Simple YAML parsing for basic key-value pairs
  frontmatterStr.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '');
    }
  });
  
  return { frontmatter, content: bodyContent };
}

/**
 * Update markdown file with description
 */
function updateMarkdownWithDescription(filePath, description) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, content: bodyContent } = parseFrontmatter(content);
  
  // Add or update description in frontmatter
  frontmatter.description = description;
  
  // Reconstruct the file
  const frontmatterStr = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  
  const newContent = `---\n${frontmatterStr}\n---\n${bodyContent}`;
  fs.writeFileSync(filePath, newContent, 'utf8');
}

/**
 * Get recently modified markdown files
 */
function getRecentMarkdownFiles() {
  const files = [];
  
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
        const stats = fs.statSync(fullPath);
        files.push({
          path: fullPath,
          relativePath: path.relative(CONTENT_DIR, fullPath),
          modified: stats.mtime
        });
      }
    }
  }
  
  scanDirectory(CONTENT_DIR);
  
  // Sort by modification time (newest first) and take top 3
  return files
    .sort((a, b) => b.modified - a.modified)
    .slice(0, 10);
}

/**
 * Main function
 */
async function main() {
  console.log('🤖 Starting description generation...');
  
  // Check if Ollama is running
  if (!checkOllamaRunning()) {
    console.error('❌ Ollama is not running. Please start it with: ollama serve');
    process.exit(1);
  }
  
  console.log('✅ Ollama is running');
  
  // Get recent files
  const recentFiles = getRecentMarkdownFiles();
  console.log(`📝 Found ${recentFiles.length} recent markdown files`);
  
  for (const file of recentFiles) {
    console.log(`\n📖 Processing: ${file.relativePath}`);
    
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      const { frontmatter, content: bodyContent } = parseFrontmatter(content);
      
      // Skip if description already exists
      if (frontmatter.description) {
        console.log('   ⏭️  Description already exists, skipping');
        continue;
      }
      
      const title = frontmatter.title || path.basename(file.path, '.md');
      console.log(`   🎯 Generating description for: ${title}`);
      
      const description = await generateDescription(bodyContent, title);
      
      if (description) {
        updateMarkdownWithDescription(file.path, description);
        console.log(`   ✅ Added description: ${description.substring(0, 80)}...`);
      } else {
        console.log('   ⚠️  Failed to generate description');
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ${file.relativePath}:`, error.message);
    }
  }
  
  console.log('\n🎉 Description generation completed!');
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
