#!/usr/bin/env node

/**
 * 同步本地数据到 GitHub
 * 使用方法: node sync-to-github.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 配置
const CONFIG = {
    owner: 'q-zq',
    repo: 'myworks.github.io',
    path: 'myworks/essays/data.json',
    // 从环境变量读取 GitHub Token
    token: process.env.GITHUB_TOKEN
};

// 本地数据文件路径
const DATA_FILE = path.join(__dirname, 'data.json');

// 读取本地数据
function readLocalData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const content = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error('读取本地数据失败:', error.message);
    }
    return { users: [], works: [], lastUpdated: new Date().toISOString() };
}

// 从 GitHub 获取数据
async function getGitHubData() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.path}`,
            method: 'GET',
            headers: {
                'User-Agent': 'Sync-Script',
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
                        const content = Buffer.from(response.content, 'base64').toString('utf8');
                        resolve({
                            data: JSON.parse(content),
                            sha: response.sha
                        });
                    } catch (error) {
                        reject(new Error('解析 GitHub 数据失败'));
                    }
                } else if (res.statusCode === 404) {
                    resolve({ data: null, sha: null });
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

// 上传数据到 GitHub
async function uploadToGitHub(data, sha) {
    return new Promise((resolve, reject) => {
        const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

        const body = JSON.stringify({
            message: 'Sync data from local',
            content: content,
            sha: sha
        });

        const options = {
            hostname: 'api.github.com',
            path: `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.path}`,
            method: 'PUT',
            headers: {
                'User-Agent': 'Sync-Script',
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

// 合并数据
function mergeData(localData, githubData) {
    const merged = {
        users: [],
        works: [],
        lastUpdated: new Date().toISOString()
    };

    // 合并用户（以最新时间为准）
    const userMap = new Map();

    if (githubData && githubData.users) {
        githubData.users.forEach(user => {
            userMap.set(user.id, user);
        });
    }

    if (localData && localData.users) {
        localData.users.forEach(user => {
            const existing = userMap.get(user.id);
            if (!existing || new Date(user.updatedAt || 0) > new Date(existing.updatedAt || 0)) {
                userMap.set(user.id, user);
            }
        });
    }

    merged.users = Array.from(userMap.values());

    // 合并作品（以最新时间为准）
    const workMap = new Map();

    if (githubData && githubData.works) {
        githubData.works.forEach(work => {
            workMap.set(work.id, work);
        });
    }

    if (localData && localData.works) {
        localData.works.forEach(work => {
            const existing = workMap.get(work.id);
            if (!existing || new Date(work.updatedAt || work.createdAt) > new Date(existing.updatedAt || existing.createdAt)) {
                workMap.set(work.id, work);
            }
        });
    }

    merged.works = Array.from(workMap.values());

    return merged;
}

// 主函数
async function main() {
    console.log('🔄 开始同步数据到 GitHub...\n');

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
        // 读取本地数据
        console.log('📁 读取本地数据...');
        const localData = readLocalData();
        console.log(`   本地用户: ${localData.users?.length || 0} 个`);
        console.log(`   本地作品: ${localData.works?.length || 0} 篇\n`);

        // 获取 GitHub 数据
        console.log('☁️  从 GitHub 获取数据...');
        const { data: githubData, sha } = await getGitHubData();

        if (githubData) {
            console.log(`   GitHub 用户: ${githubData.users?.length || 0} 个`);
            console.log(`   GitHub 作品: ${githubData.works?.length || 0} 篇\n`);
        } else {
            console.log('   GitHub 上暂无数据\n');
        }

        // 合并数据
        console.log('🔀 合并数据...');
        const mergedData = mergeData(localData, githubData);
        console.log(`   合并后用户: ${mergedData.users.length} 个`);
        console.log(`   合并后作品: ${mergedData.works.length} 篇\n`);

        // 上传到 GitHub
        console.log('📤 上传到 GitHub...');
        await uploadToGitHub(mergedData, sha);

        console.log('\n✅ 同步成功！');
        console.log(`   时间: ${new Date().toLocaleString()}`);

    } catch (error) {
        console.error('\n❌ 同步失败:', error.message);
        process.exit(1);
    }
}

// 运行主函数
main();
