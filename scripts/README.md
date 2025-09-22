# Auto-Generated Descriptions for Quartz

This directory contains scripts to automatically generate descriptions for your blog posts using Ollama.

## Prerequisites

1. **Ollama installed** with the `gemma3:latest` model
2. **Ollama server running**: `ollama serve`

## Usage

### Method 1: Complete Workflow (Recommended)

Run the complete sync and description generation workflow:

```bash
npm run sync-and-generate
```

This will:
1. Sync your Quartz content (`npx quartz sync --no-pull`)
2. Generate descriptions for the 3 most recent posts using Ollama
3. Build your Quartz site

### Method 2: Manual Steps

1. **Start Ollama** (in a separate terminal):
   ```bash
   ollama serve
   ```

2. **Sync your content**:
   ```bash
   cd ~/Documents/obsi/quartz_v/quartz
   npx quartz sync --no-pull
   ```

3. **Generate descriptions only**:
   ```bash
   npm run generate-descriptions
   ```

4. **Build the site**:
   ```bash
   npx quartz build
   ```

## How it Works

- The script finds the 3 most recently modified markdown files in your `content/` directory
- For each file without an existing description, it sends the content to Ollama (gemma3:latest model)
- Ollama generates a concise 1-2 sentence description
- The description is automatically added to the file's frontmatter
- The updated posts appear in your "recent posts" section with descriptions

## Configuration

You can modify these settings in `scripts/generate-descriptions.js`:

- `OLLAMA_MODEL`: Change the Ollama model (default: 'gemma3:latest')
- `MAX_CONTENT_LENGTH`: Limit content sent to Ollama (default: 1000 characters)
- Number of recent posts: Currently set to 3 (matches your recent posts component)

## Troubleshooting

- **"Ollama is not running"**: Make sure you run `ollama serve` first
- **Model not found**: Ensure you have the gemma3:latest model: `ollama pull gemma3:latest`
- **Permission denied**: Make sure the script is executable: `chmod +x scripts/sync-and-generate.sh`
