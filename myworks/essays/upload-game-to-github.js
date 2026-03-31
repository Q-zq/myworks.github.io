#!/usr/bin/env node

/**
 * 上传植物大战僵尸游戏到 GitHub
 * 使用方法: node upload-game-to-github.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 配置
const CONFIG = {
    owner: 'q-zq',
    repo: 'myworks.github.io',
    // 从环境变量读取 GitHub Token
    token: process.env.GITHUB_TOKEN
};

// 游戏目录
const GAME_DIR = path.join(__dirname, 'plants-vs-zombies');

// 读取文件内容并转换为 base64
function readFileAsBase64(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return Buffer.from(content).toString('base64');
    } catch (error) {
        console.error(`读取文件失败: ${filePath}`, error.message);
        return null;
    }
}

// 递归获取目录下所有文件
function getFiles(dir, basePath = '') {
    const files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isFile()) {
            // 使用正斜杠作为路径分隔符，GitHub API 要求
            files.push(path.join(basePath, item).replace(/\\/g, '/'));
        } else if (stats.isDirectory()) {
            const subFiles = getFiles(itemPath, path.join(basePath, item));
            files.push(...subFiles);
        }
    });
    
    return files;
}

// 获取 GitHub 文件的 SHA（用于更新）
async function getGitHubFileSha(filePath) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${filePath}`,
            method: 'GET',
            headers: {
                'User-Agent': 'Upload-Script',
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${CONFIG.token}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        resolve(response.sha);
                    } catch (error) {
                        reject(new Error('解析 GitHub 数据失败'));
                    }
                } else if (res.statusCode === 404) {
                    resolve(null);
                } else {
                    reject(new Error(`GitHub API 错误: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// 上传文件到 GitHub
async function uploadFileToGitHub(filePath, content, sha) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            message: `Add game file: ${filePath}`,
            content: content,
            sha: sha
        });

        const options = {
            hostname: 'api.github.com',
            path: `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${filePath}`,
            method: 'PUT',
            headers: {
                'User-Agent': 'Upload-Script',
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${CONFIG.token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    resolve(true);
                } else {
                    console.error('GitHub API 响应:', data);
                    reject(new Error(`上传失败: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(body);
        req.end();
    });
}

// 主函数
async function main() {
    console.log('🚀 开始上传植物大战僵尸游戏到 GitHub...\n');

    // 检查 GitHub Token
    if (!CONFIG.token) {
        console.error('❌ 错误: 未设置 GITHUB_TOKEN 环境变量');
        console.log('\n请设置 GitHub Token:');
        console.log('  Windows PowerShell: $env:GITHUB_TOKEN="your-token"');
        console.log('  Windows CMD: set GITHUB_TOKEN=your-token');
        console.log('  Linux/Mac: export GITHUB_TOKEN=your-token');
        process.exit(1);
    }

    try {
        // 获取游戏目录下的所有文件
        console.log('📁 扫描游戏文件...');
        const gameFiles = getFiles(GAME_DIR, 'plants-vs-zombies');
        console.log(`   发现 ${gameFiles.length} 个文件\n`);

        // 上传每个文件
        let uploadedCount = 0;
        for (const file of gameFiles) {
            console.log(`📤 上传: ${file}`);
            
            const localFilePath = path.join(GAME_DIR, file.substring('plants-vs-zombies/'.length));
            const base64Content = readFileAsBase64(localFilePath);
            
            if (!base64Content) {
                console.log(`   ⚠️  跳过文件: ${file}`);
                continue;
            }
            
            // 获取现有文件的 SHA（如果存在）
            const sha = await getGitHubFileSha(file);
            
            // 上传文件
            await uploadFileToGitHub(file, base64Content, sha);
            uploadedCount++;
            console.log(`   ✅ 上传成功`);
        }

        console.log('\n🎉 上传完成！');
        console.log(`   成功上传: ${uploadedCount} 个文件`);
        console.log(`   时间: ${new Date().toLocaleString()}`);

    } catch (error) {
        console.error('\n❌ 上传失败:', error.message);
        process.exit(1);
    }
}

// 运行主函数
main();