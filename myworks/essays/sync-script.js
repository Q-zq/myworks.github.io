// 浏览器端数据同步脚本

// 从 GitHub 获取数据
async function getDataFromGitHub() {
  try {
    const response = await fetch(`https://api.github.com/repos/q-zq/myworks.github.io/contents/myworks/essays/data.json`);
    
    if (response.status === 200) {
      const data = await response.json();
      const content = atob(data.content);
      return JSON.parse(content);
    } else if (response.status === 404) {
      // 数据文件不存在，返回默认数据
      return {
        users: [],
        works: []
      };
    } else {
      console.error('获取数据失败:', response.status);
      return {
        users: [],
        works: []
      };
    }
  } catch (error) {
    console.error('获取数据失败:', error.message);
    return {
      users: [],
      works: []
    };
  }
}

// 从 GitHub 同步数据到本地
async function syncFromGitHub() {
  try {
    const githubData = await getDataFromGitHub();
    
    // 更新本地存储
    localStorage.setItem('users', JSON.stringify(githubData.users));
    localStorage.setItem('works', JSON.stringify(githubData.works));
    
    console.log('✓ 从 GitHub 同步数据成功');
    return true;
  } catch (error) {
    console.error('✗ 从 GitHub 同步数据失败:', error.message);
    return false;
  }
}

// 合并用户数据
function mergeUsers(localUsers, githubUsers) {
  const userMap = new Map();
  
  // 添加 GitHub 用户
  githubUsers.forEach(user => {
    userMap.set(user.id, user);
  });
  
  // 添加本地用户（本地用户优先）
  localUsers.forEach(user => {
    userMap.set(user.id, user);
  });
  
  return Array.from(userMap.values());
}

// 合并作品数据
function mergeWorks(localWorks, githubWorks) {
  const workMap = new Map();
  
  // 添加 GitHub 作品
  githubWorks.forEach(work => {
    workMap.set(work.id, work);
  });
  
  // 添加本地作品（本地作品优先）
  localWorks.forEach(work => {
    workMap.set(work.id, work);
  });
  
  return Array.from(workMap.values());
}

// 页面加载时从 GitHub 同步数据
window.addEventListener('load', async function() {
  await syncFromGitHub();
});

// 监听存储事件，当本地存储变化时同步到 GitHub
window.addEventListener('storage', async function(event) {
  if (event.key === 'users' || event.key === 'works') {
    // 这里可以添加同步到 GitHub 的逻辑
    // 由于需要 GitHub Token，我们使用服务器端脚本进行同步
    console.log('存储变化，需要同步到 GitHub');
  }
});

// 手动触发同步
function syncData() {
  syncFromGitHub();
}

// 暴露同步函数到全局
window.syncData = syncData;
