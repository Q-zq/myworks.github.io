// 数据库管理模块 - 支持本地存储和云端同步

const Database = {
    // 数据缓存
    cache: {
        users: [],
        works: []
    },

    // 初始化数据库
    init() {
        this.loadFromLocal();
        this.syncFromCloud();
    },

    // 从本地存储加载数据
    loadFromLocal() {
        try {
            const users = localStorage.getItem('users');
            const works = localStorage.getItem('works');

            if (users) {
                this.cache.users = JSON.parse(users);
            }
            if (works) {
                this.cache.works = JSON.parse(works);
            }

            console.log('✓ 从本地加载数据成功');
            return true;
        } catch (error) {
            console.error('✗ 从本地加载数据失败:', error);
            return false;
        }
    },

    // 保存到本地存储
    saveToLocal() {
        try {
            localStorage.setItem('users', JSON.stringify(this.cache.users));
            localStorage.setItem('works', JSON.stringify(this.cache.works));
            console.log('✓ 保存到本地成功');
            return true;
        } catch (error) {
            console.error('✗ 保存到本地失败:', error);
            return false;
        }
    },

    // 从云端同步数据（GitHub）
    async syncFromCloud() {
        try {
            const response = await fetch(
                'https://api.github.com/repos/q-zq/myworks.github.io/contents/myworks/essays/data.json',
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (response.status === 200) {
                const data = await response.json();
                const content = JSON.parse(atob(data.content));

                // 合并数据（云端数据优先）
                this.mergeData(content);
                this.saveToLocal();

                console.log('✓ 从云端同步数据成功');
                return true;
            } else if (response.status === 404) {
                console.log('ℹ 云端数据文件不存在，使用本地数据');
                return false;
            } else {
                console.error('✗ 从云端同步数据失败:', response.status);
                return false;
            }
        } catch (error) {
            console.error('✗ 从云端同步数据失败:', error.message);
            return false;
        }
    },

    // 合并数据（云端数据优先）
    mergeData(cloudData) {
        // 合并用户（以用户ID为键，云端优先）
        const userMap = new Map();

        // 先添加本地用户
        this.cache.users.forEach(user => {
            userMap.set(user.id, user);
        });

        // 再用云端用户覆盖
        if (cloudData.users) {
            cloudData.users.forEach(user => {
                userMap.set(user.id, user);
            });
        }

        this.cache.users = Array.from(userMap.values());

        // 合并作品（以作品ID为键，云端优先）
        const workMap = new Map();

        // 先添加本地作品
        this.cache.works.forEach(work => {
            workMap.set(work.id, work);
        });

        // 再用云端作品覆盖
        if (cloudData.works) {
            cloudData.works.forEach(work => {
                workMap.set(work.id, work);
            });
        }

        this.cache.works = Array.from(workMap.values());
    },

    // ========== 用户相关操作 ==========

    // 验证用户
    validateUser(username, password) {
        return this.cache.users.find(
            user => user.username === username && user.password === password
        );
    },

    // 检查用户名是否存在
    usernameExists(username) {
        return this.cache.users.some(user => user.username === username);
    },

    // 获取用户
    getUserById(userId) {
        return this.cache.users.find(user => user.id === userId);
    },

    // 获取用户
    getUserByUsername(username) {
        return this.cache.users.find(user => user.username === username);
    },

    // 保存用户
    saveUser(user) {
        const existingIndex = this.cache.users.findIndex(u => u.id === user.id);

        if (existingIndex !== -1) {
            // 更新现有用户
            this.cache.users[existingIndex] = user;
        } else {
            // 添加新用户
            this.cache.users.push(user);
        }

        this.saveToLocal();
        return true;
    },

    // 更新用户
    updateUser(updatedUser) {
        return this.saveUser(updatedUser);
    },

    // ========== 作品相关操作 ==========

    // 获取所有作品
    getAllWorks() {
        return this.cache.works.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    },

    // 获取用户的作品
    getUserWorks(userId) {
        return this.cache.works
            .filter(work => work.authorId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    // 获取单个作品
    getWorkById(workId) {
        return this.cache.works.find(work => work.id === workId);
    },

    // 保存作品
    saveWork(work) {
        const existingIndex = this.cache.works.findIndex(w => w.id === work.id);

        if (existingIndex !== -1) {
            // 更新现有作品
            this.cache.works[existingIndex] = work;
        } else {
            // 添加新作品
            this.cache.works.push(work);
        }

        this.saveToLocal();
        return true;
    },

    // 删除作品
    deleteWork(workId) {
        const index = this.cache.works.findIndex(w => w.id === workId);
        if (index !== -1) {
            this.cache.works.splice(index, 1);
            this.saveToLocal();
            return true;
        }
        return false;
    },

    // ========== 数据导出/导入 ==========

    // 导出所有数据
    exportData() {
        return {
            users: this.cache.users,
            works: this.cache.works,
            exportTime: new Date().toISOString()
        };
    },

    // 导入数据
    importData(data) {
        if (data.users) {
            this.cache.users = data.users;
        }
        if (data.works) {
            this.cache.works = data.works;
        }
        this.saveToLocal();
        return true;
    },

    // 获取导出数据的 JSON 字符串
    getExportJSON() {
        return JSON.stringify(this.exportData(), null, 2);
    }
};

// 页面加载时初始化数据库
document.addEventListener('DOMContentLoaded', function() {
    Database.init();
});

// 暴露到全局
window.Database = Database;
