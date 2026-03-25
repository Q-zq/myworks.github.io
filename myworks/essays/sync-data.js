const fs = require('fs');
const path = require('path');
const { uploadDataToGitHub } = require('./data-manager');

// 从本地存储文件读取数据
function readLocalData() {
  try {
    // 模拟本地存储数据
    // 在实际使用中，这会从 localStorage 读取
    // 但由于是 Node.js 环境，我们创建一个模拟数据
    const mockData = {
      users: JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8') || '[]'),
      works: JSON.parse(fs.readFileSync(path.join(__dirname, 'works.json'), 'utf8') || '[]')
    };
    return mockData;
  } catch (error) {
    console.error('读取本地数据失败:', error.message);
    return {
      users: [],
      works: []
    };
  }
}

// 保存本地数据到文件
function saveLocalData(data) {
  try {
    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(data.users, null, 2));
    fs.writeFileSync(path.join(__dirname, 'works.json'), JSON.stringify(data.works, null, 2));
    console.log('本地数据保存成功');
  } catch (error) {
    console.error('保存本地数据失败:', error.message);
  }
}

// 主同步函数
async function main() {
  console.log('开始同步数据...');
  
  // 读取本地数据
  const localData = readLocalData();
  console.log(`本地数据: ${localData.users.length} 个用户, ${localData.works.length} 个作品`);
  
  // 上传到 GitHub
  const success = await uploadDataToGitHub(localData);
  
  if (success) {
    console.log('数据同步完成！');
  } else {
    console.log('数据同步失败');
  }
}

// 执行同步
main();
