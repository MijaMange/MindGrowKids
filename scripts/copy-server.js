import { readdirSync, copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

function copyDir(src, dest, exclude = []) {
  if (!existsSync(src)) {
    console.warn(`⚠️  Source directory ${src} does not exist`);
    return;
  }

  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    // Skip excluded directories/files
    if (exclude.includes(entry.name)) {
      continue;
    }

    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, exclude);
    } else {
      // Skip .env files (security)
      if (entry.name === '.env' || entry.name.startsWith('.env.')) {
        console.log(`⏭️  Skipping ${entry.name} (security)`);
        continue;
      }
      copyFileSync(srcPath, destPath);
    }
  }
}

// Copy server files, excluding node_modules and other unnecessary files
const exclude = ['node_modules', '.git', 'server', 'package-lock.json']; // Exclude nested server dir too
copyDir('server', 'dist/server', exclude);

// Copy package.json from server/ to ensure correct dependencies
const serverPackagePath = join('server', 'package.json');
const distPackagePath = join('dist', 'server', 'package.json');
if (existsSync(serverPackagePath)) {
  copyFileSync(serverPackagePath, distPackagePath);
  console.log('✅ Updated package.json with correct dependencies');
}

console.log('✅ Server files copied to dist/server/ (excluding node_modules and .env)');

// Create a simple .env.example in dist/server if it doesn't exist
const envExamplePath = join('dist', 'server', '.env.example');
if (!existsSync(envExamplePath)) {
  const exampleContent = `# Environment variables for production
# Copy this file to .env and fill in your values

MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname
MONGO_DB_NAME=MindGrow
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
PORT=4000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
FORCE_HTTPS=true
JWT_EXPIRES_IN=7d
`;
  writeFileSync(envExamplePath, exampleContent);
  console.log('✅ Created .env.example in dist/server/');
}

