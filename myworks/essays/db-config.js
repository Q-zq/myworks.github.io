// 数据库配置 - 使用 JSONBin.io 免费服务
// JSONBin.io 提供免费的云端 JSON 存储，适合小型项目

const DB_CONFIG = {
    // JSONBin.io API 配置
    // 用户需要在这里填写自己的 JSONBin.io API Key
    // 获取方式：访问 https://jsonbin.io/ 注册并获取 API Key
    JSONBIN_API_KEY: '$2a$10$YourApiKeyHere', // 请替换为实际的 API Key
    JSONBIN_BIN_ID: 'your-bin-id-here', // 请替换为实际的 Bin ID

    // GitHub 配置（备用方案）
    GITHUB_OWNER: 'q-zq',
    GITHUB_REPO: 'myworks.github.io',
    GITHUB_PATH: 'myworks/essays/data.json'
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DB_CONFIG;
}
