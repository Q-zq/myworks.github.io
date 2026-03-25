const fs = require('fs');
const path = require('path');

// 扫描目录获取文件列表
function scanDirectory(dir) {
  const files = [];
  
  function scan(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        scan(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

// 获取文件相对路径
function getRelativePath(filePath, baseDir) {
  return path.relative(baseDir, filePath).replace(/\\/g, '/');
}

// 测试扫描
const baseDir = process.cwd();
const files = scanDirectory(baseDir);

console.log(`扫描到 ${files.length} 个文件：`);
files.forEach(file => {
  const relativePath = getRelativePath(file, baseDir);
  console.log(`- ${relativePath}`);
});

// 测试过滤
const deployableFiles = files.filter(file => {
  const relativePath = getRelativePath(file, baseDir);
  return !relativePath.startsWith('.') && 
         !relativePath.endsWith('.py') && 
         !relativePath.endsWith('.env') && 
         !relativePath.endsWith('package.json') &&
         !relativePath.endsWith('deploy.js') &&
         !relativePath.endsWith('watch.js') &&
         !relativePath.endsWith('simple-deploy.js') &&
         !relativePath.endsWith('test-scan.js');
});

console.log(`\n过滤后 ${deployableFiles.length} 个文件：`);
deployableFiles.forEach(file => {
  const relativePath = getRelativePath(file, baseDir);
  console.log(`- ${relativePath}`);
});

// 检查 index.html 是否存在
const indexFile = deployableFiles.find(file => {
  const relativePath = getRelativePath(file, baseDir);
  return relativePath === 'index.html';
});

if (indexFile) {
  console.log('\n✓ index.html 文件被正确识别');
} else {
  console.log('\n✗ index.html 文件未被识别');
}
