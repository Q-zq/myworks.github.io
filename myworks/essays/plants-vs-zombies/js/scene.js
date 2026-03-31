// 游戏场景相关类

// 游戏场景类
class Scene {
    constructor(ctx) {
        this.ctx = ctx;
        this.sunshine = 100; // 初始阳光
        this.plants = []; // 植物数组
        this.zombies = []; // 僵尸数组
        this.sunshines = []; // 阳光数组
        this.cards = [
            { name: '豌豆射手', cost: 100, type: 'peashooter', desc: '发射豌豆攻击僵尸' },
            { name: '向日葵', cost: 50, type: 'sunflower', desc: '产生额外阳光' },
            { name: '坚果墙', cost: 50, type: 'wallnut', desc: '阻挡僵尸前进' },
            { name: '樱桃炸弹', cost: 150, type: 'cherrybomb', desc: '爆炸消灭周围僵尸' },
            { name: '食人花', cost: 150, type: 'chomper', desc: '一口吞掉僵尸' }
        ];
        this.selectedCard = null;
        this.gameStatus = 'running'; // running, paused, gameover
        this.showInstructions = true;
    }
    
    // 绘制场景
    draw() {
        // 绘制背景 - 天空渐变
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.3, '#B0E0E6');
        gradient.addColorStop(0.3, '#90EE90');
        gradient.addColorStop(1, '#228B22');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 600);
        
        // 绘制草地 - 带有纹理效果
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 100, 900, 500);
        
        // 绘制草地纹理
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 9; j++) {
                // 交替颜色绘制草地格子
                this.ctx.fillStyle = (i + j) % 2 === 0 ? '#228B22' : '#32CD32';
                this.ctx.fillRect(j * 100, 100 + i * 80, 100, 80);
                
                // 绘制草地边缘
                this.ctx.strokeStyle = '#006400';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(j * 100, 100 + i * 80, 100, 80);
            }
        }
        
        // 绘制阳光计分板
        this.drawSunshineBoard();
        
        // 绘制植物卡片
        this.drawCards();
        
        // 绘制植物
        this.plants.forEach(plant => plant.draw());
        
        // 绘制僵尸
        this.zombies.forEach(zombie => zombie.draw());
        
        // 绘制阳光
        this.sunshines.forEach(sunshine => sunshine.draw());
        
        // 绘制游戏状态
        if (this.gameStatus === 'gameover') {
            this.drawGameOver();
        }
        
        // 绘制操作说明
        if (this.showInstructions) {
            this.drawInstructions();
        }
    }
    
    // 绘制阳光计分板
    drawSunshineBoard() {
        // 绘制阳光图标背景
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(35, 35, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制阳光图标
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const x = 35 + Math.cos(angle) * 20;
            const y = 35 + Math.sin(angle) * 20;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        // 绘制阳光数值
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`${this.sunshine}`, 70, 45);
    }
    
    // 绘制植物卡片
    drawCards() {
        this.cards.forEach((card, index) => {
            const x = 130 + index * 80;
            const y = 10;
            const width = 70;
            const height = 70;
            
            // 绘制卡片背景
            const canAfford = this.sunshine >= card.cost;
            this.ctx.fillStyle = canAfford ? '#F5DEB3' : '#CCCCCC';
            this.ctx.fillRect(x, y, width, height);
            
            // 绘制卡片边框
            this.ctx.strokeStyle = this.selectedCard === card.type ? '#FF0000' : '#8B4513';
            this.ctx.lineWidth = this.selectedCard === card.type ? 3 : 2;
            this.ctx.strokeRect(x, y, width, height);
            
            // 绘制植物图标
            this.drawPlantIcon(card.type, x + 35, y + 25);
            
            // 绘制阳光消耗
            this.ctx.fillStyle = canAfford ? '#FF0000' : '#888888';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(card.cost, x + 35, y + 60);
            this.ctx.textAlign = 'left';
        });
    }
    
    // 绘制植物图标
    drawPlantIcon(type, x, y) {
        switch (type) {
            case 'peashooter':
                // 豌豆射手图标
                this.ctx.fillStyle = '#00FF00';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 15, 0, Math.PI * 2);
                this.ctx.fill();
                // 嘴巴
                this.ctx.fillStyle = '#006400';
                this.ctx.fillRect(x + 10, y - 5, 12, 10);
                // 眼睛
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(x - 5, y - 5, 3, 0, Math.PI * 2);
                this.ctx.arc(x + 5, y - 5, 3, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'sunflower':
                // 向日葵图标
                this.ctx.fillStyle = '#FFD700';
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI) / 4;
                    const px = x + Math.cos(angle) * 12;
                    const py = y + Math.sin(angle) * 12;
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, 6, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                this.ctx.fillStyle = '#8B4513';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 8, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'wallnut':
                // 坚果墙图标
                this.ctx.fillStyle = '#8B4513';
                this.ctx.beginPath();
                this.ctx.ellipse(x, y, 18, 15, 0, 0, Math.PI * 2);
                this.ctx.fill();
                // 纹理
                this.ctx.strokeStyle = '#654321';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(x - 5, y - 3, 5, 0, Math.PI);
                this.ctx.arc(x + 5, y + 3, 5, 0, Math.PI);
                this.ctx.stroke();
                break;
            case 'cherrybomb':
                // 樱桃炸弹图标
                this.ctx.fillStyle = '#DC143C';
                // 左樱桃
                this.ctx.beginPath();
                this.ctx.arc(x - 8, y + 3, 10, 0, Math.PI * 2);
                this.ctx.fill();
                // 右樱桃
                this.ctx.beginPath();
                this.ctx.arc(x + 8, y + 3, 10, 0, Math.PI * 2);
                this.ctx.fill();
                // 茎
                this.ctx.strokeStyle = '#228B22';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y - 8);
                this.ctx.lineTo(x - 8, y - 3);
                this.ctx.moveTo(x, y - 8);
                this.ctx.lineTo(x + 8, y - 3);
                this.ctx.stroke();
                break;
            case 'chomper':
                // 食人花图标
                this.ctx.fillStyle = '#8B008B';
                // 头部
                this.ctx.beginPath();
                this.ctx.arc(x, y - 5, 15, Math.PI, 0);
                this.ctx.fill();
                // 下颚
                this.ctx.fillStyle = '#4B0082';
                this.ctx.beginPath();
                this.ctx.arc(x, y - 5, 15, 0, Math.PI);
                this.ctx.fill();
                // 牙齿
                this.ctx.fillStyle = '#FFF';
                for (let i = 0; i < 4; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x - 10 + i * 7, y - 5);
                    this.ctx.lineTo(x - 7 + i * 7, y + 2);
                    this.ctx.lineTo(x - 4 + i * 7, y - 5);
                    this.ctx.fill();
                }
                break;
        }
    }
    
    // 绘制游戏结束画面
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, 900, 600);
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束', 450, 250);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('按 R 键重新开始', 450, 320);
        this.ctx.fillText('或点击任意处重新开始', 450, 360);
        this.ctx.textAlign = 'left';
    }
    
    // 绘制操作说明
    drawInstructions() {
        // 半透明背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(50, 50, 800, 500);
        
        // 标题
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌻 植物大战僵尸 🧟', 450, 100);
        
        // 操作说明
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('操作说明', 450, 150);
        
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'left';
        let y = 190;
        const instructions = [
            '1. 点击上方植物卡片选择要种植的植物（需要足够的阳光）',
            '2. 点击草地格子放置植物',
            '3. 点击下落的黄色阳光收集阳光（+25阳光）',
            '4. 阻止僵尸到达最左侧，否则游戏失败',
            '',
            '植物介绍：',
            '🌱 豌豆射手（100阳光）- 发射豌豆攻击僵尸',
            '🌻 向日葵（50阳光）- 定期产生额外阳光',
            '🥜 坚果墙（50阳光）- 高生命值，阻挡僵尸前进',
            '🍒 樱桃炸弹（150阳光）- 3秒后爆炸，消灭周围僵尸',
            '🌸 食人花（150阳光）- 一口吞掉靠近的僵尸',
            '',
            '快捷键：',
            'P - 暂停/继续游戏',
            'R - 重新开始游戏',
            '点击任意处开始游戏'
        ];
        
        instructions.forEach(text => {
            this.ctx.fillText(text, 100, y);
            y += 25;
        });
        
        this.ctx.textAlign = 'left';
    }
    
    // 更新场景
    update() {
        if (this.gameStatus !== 'running') return;
        
        // 更新植物
        this.plants.forEach(plant => plant.update());
        
        // 更新僵尸
        this.zombies.forEach(zombie => zombie.update());
        
        // 更新阳光
        this.sunshines.forEach(sunshine => sunshine.update());
        
        // 生成阳光
        if (Math.random() < 0.01) {
            this.sunshines.push(new Sunshine(this.ctx, Common.random(100, 800), 100));
        }
        
        // 生成僵尸
        if (Math.random() < 0.005) {
            this.zombies.push(new Zombie(this.ctx, 900, Common.random(0, 5) * 80 + 140));
        }
        
        // 碰撞检测
        this.checkCollisions();
        
        // 检查游戏结束
        this.zombies.forEach(zombie => {
            if (zombie.x < -zombie.width) {
                this.gameStatus = 'gameover';
            }
        });
    }
    
    // 碰撞检测
    checkCollisions() {
        // 植物和僵尸碰撞
        this.plants.forEach(plant => {
            this.zombies.forEach(zombie => {
                if (Common.collision(plant, zombie)) {
                    plant.attacked(1);
                    zombie.attacked(1);
                }
            });
        });
        
        // 清理死亡的植物和僵尸
        this.plants = this.plants.filter(plant => plant.health > 0);
        this.zombies = this.zombies.filter(zombie => zombie.health > 0);
        this.sunshines = this.sunshines.filter(sunshine => !sunshine.collected);
    }
    
    // 放置植物
    placePlant(x, y) {
        if (!this.selectedCard) return;
        
        const card = this.cards.find(c => c.type === this.selectedCard);
        if (!card) return;
        
        if (this.sunshine < card.cost) return;
        
        // 计算网格位置
        const gridX = Math.floor(x / 100);
        const gridY = Math.floor((y - 100) / 80);
        
        if (gridX < 0 || gridX >= 9 || gridY < 0 || gridY >= 6) return;
        
        // 检查位置是否已有植物
        const hasPlant = this.plants.some(plant => 
            Math.floor(plant.x / 100) === gridX && 
            Math.floor((plant.y - 100) / 80) === gridY
        );
        
        if (hasPlant) return;
        
        // 放置植物
        let plant;
        switch (card.type) {
            case 'peashooter':
                plant = new Peashooter(this.ctx, gridX * 100 + 10, gridY * 80 + 110);
                break;
            case 'sunflower':
                plant = new Sunflower(this.ctx, gridX * 100 + 10, gridY * 80 + 110);
                break;
            case 'wallnut':
                plant = new Wallnut(this.ctx, gridX * 100 + 10, gridY * 80 + 110);
                break;
            case 'cherrybomb':
                plant = new CherryBomb(this.ctx, gridX * 100 + 10, gridY * 80 + 110);
                break;
            case 'chomper':
                plant = new Chomper(this.ctx, gridX * 100 + 10, gridY * 80 + 110);
                break;
        }
        
        if (plant) {
            this.plants.push(plant);
            this.sunshine -= card.cost;
            this.selectedCard = null;
        }
    }
    
    // 收集阳光
    collectSunshine(x, y) {
        this.sunshines.forEach(sunshine => {
            if (Common.collision({ x, y, width: 1, height: 1 }, sunshine)) {
                sunshine.collect();
                this.sunshine += 25;
            }
        });
    }
}

// 植物基类
class Plant {
    constructor(ctx, x, y, width = 80, height = 60, health = 100) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = health;
        this.maxHealth = health;
        this.attackRange = 0;
        this.attackDamage = 0;
        this.attackCooldown = 0;
        this.lastAttack = 0;
    }
    
    draw() {
        // 绘制植物阴影
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(this.x + this.width / 2, this.y + this.height - 5, this.width / 2, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制生命值条背景
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.x, this.y - 10, this.width, 5);
        
        // 绘制生命值
        const healthPercent = this.health / this.maxHealth;
        this.ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
        this.ctx.fillRect(this.x, this.y - 10, this.width * healthPercent, 5);
    }
    
    update() {
        // 植物更新逻辑
    }
    
    attacked(damage) {
        this.health -= damage;
    }
}

// 豌豆射手
class Peashooter extends Plant {
    constructor(ctx, x, y) {
        super(ctx, x, y, 80, 60, 100);
        this.attackRange = 500;
        this.attackDamage = 20;
        this.attackCooldown = 1000;
        this.animationFrame = 0;
    }
    
    draw() {
        super.draw();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 绘制茎
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY + 20);
        this.ctx.lineTo(centerX, centerY - 5);
        this.ctx.stroke();
        
        // 绘制叶子
        this.ctx.fillStyle = '#32CD32';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX - 15, centerY + 15, 12, 6, -0.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(centerX + 15, centerY + 10, 10, 5, 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制头部（绿色圆形）
        this.ctx.fillStyle = '#00FF00';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY - 10, 22, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制头部高光
        this.ctx.fillStyle = '#90EE90';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 8, centerY - 18, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制嘴巴（炮管）
        this.ctx.fillStyle = '#006400';
        this.ctx.fillRect(centerX + 15, centerY - 15, 18, 10);
        
        // 绘制眼睛
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 8, centerY - 15, 8, 0, Math.PI * 2);
        this.ctx.arc(centerX + 8, centerY - 15, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制瞳孔
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 6, centerY - 15, 4, 0, Math.PI * 2);
        this.ctx.arc(centerX + 10, centerY - 15, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制眉毛
        this.ctx.strokeStyle = '#006400';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 12, centerY - 22);
        this.ctx.lineTo(centerX - 2, centerY - 20);
        this.ctx.moveTo(centerX + 4, centerY - 20);
        this.ctx.lineTo(centerX + 14, centerY - 22);
        this.ctx.stroke();
    }
    
    update() {
        super.update();
        this.animationFrame++;
        
        // 攻击逻辑
        if (Date.now() - this.lastAttack > this.attackCooldown) {
            this.lastAttack = Date.now();
        }
    }
}

// 向日葵
class Sunflower extends Plant {
    constructor(ctx, x, y) {
        super(ctx, x, y, 80, 60, 70);
        this.sunCooldown = 5000;
        this.lastSun = 0;
        this.animationFrame = 0;
    }
    
    draw() {
        super.draw();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 绘制茎
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY + 25);
        this.ctx.lineTo(centerX, centerY - 5);
        this.ctx.stroke();
        
        // 绘制叶子
        this.ctx.fillStyle = '#32CD32';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX - 18, centerY + 15, 15, 7, -0.6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(centerX + 18, centerY + 10, 12, 6, 0.6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制花瓣
        this.ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4 + (this.animationFrame * 0.02);
            const px = centerX + Math.cos(angle) * 18;
            const py = centerY - 10 + Math.sin(angle) * 18;
            this.ctx.beginPath();
            this.ctx.ellipse(px, py, 10, 6, angle, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 绘制花盘
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY - 10, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制花盘纹理
        this.ctx.fillStyle = '#654321';
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const px = centerX + Math.cos(angle) * 6;
            const py = centerY - 10 + Math.sin(angle) * 6;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 绘制眼睛
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 4, centerY - 12, 4, 0, Math.PI * 2);
        this.ctx.arc(centerX + 4, centerY - 12, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 3, centerY - 12, 2, 0, Math.PI * 2);
        this.ctx.arc(centerX + 5, centerY - 12, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制微笑
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY - 8, 6, 0.2, Math.PI - 0.2);
        this.ctx.stroke();
    }
    
    update() {
        super.update();
        this.animationFrame++;
        
        // 生成阳光
        if (Date.now() - this.lastSun > this.sunCooldown) {
            this.lastSun = Date.now();
        }
    }
}

// 坚果墙
class Wallnut extends Plant {
    constructor(ctx, x, y) {
        super(ctx, x, y, 80, 60, 400);
        this.blinkTimer = 0;
        this.isBlinking = false;
    }
    
    draw() {
        super.draw();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 绘制坚果主体
        const healthPercent = this.health / this.maxHealth;
        const nutColor = healthPercent > 0.5 ? '#8B4513' : '#A0522D';
        const darkNutColor = healthPercent > 0.5 ? '#654321' : '#8B4513';
        
        // 坚果身体
        this.ctx.fillStyle = nutColor;
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY + 5, 28, 22, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 坚果顶部凹陷
        this.ctx.fillStyle = darkNutColor;
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY - 8, 15, 8, 0, 0, Math.PI);
        this.ctx.fill();
        
        // 坚果纹理线条
        this.ctx.strokeStyle = darkNutColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 15, centerY + 5);
        this.ctx.quadraticCurveTo(centerX - 10, centerY - 5, centerX - 5, centerY + 5);
        this.ctx.moveTo(centerX + 5, centerY + 5);
        this.ctx.quadraticCurveTo(centerX + 10, centerY - 5, centerX + 15, centerY + 5);
        this.ctx.stroke();
        
        // 绘制眼睛
        if (!this.isBlinking) {
            this.ctx.fillStyle = '#FFF';
            this.ctx.beginPath();
            this.ctx.ellipse(centerX - 10, centerY + 2, 6, 8, 0, 0, Math.PI * 2);
            this.ctx.ellipse(centerX + 10, centerY + 2, 6, 8, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(centerX - 8, centerY + 2, 3, 0, Math.PI * 2);
            this.ctx.arc(centerX + 12, centerY + 2, 3, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // 闭眼
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 16, centerY + 2);
            this.ctx.lineTo(centerX - 4, centerY + 2);
            this.ctx.moveTo(centerX + 4, centerY + 2);
            this.ctx.lineTo(centerX + 16, centerY + 2);
            this.ctx.stroke();
        }
        
        // 绘制嘴巴（担忧的表情）
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY + 12, 5, Math.PI, 0);
        this.ctx.stroke();
    }
    
    update() {
        super.update();
        
        // 眨眼动画
        this.blinkTimer++;
        if (this.blinkTimer > 150) {
            this.isBlinking = true;
            if (this.blinkTimer > 160) {
                this.isBlinking = false;
                this.blinkTimer = 0;
            }
        }
    }
}

// 樱桃炸弹
class CherryBomb extends Plant {
    constructor(ctx, x, y) {
        super(ctx, x, y, 80, 60, 50);
        this.explodeTime = 3000;
        this.plantedTime = Date.now();
        this.flashIntensity = 0;
    }
    
    draw() {
        super.draw();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const timeLeft = this.explodeTime - (Date.now() - this.plantedTime);
        const flashSpeed = Math.max(100, timeLeft / 10);
        this.flashIntensity = Math.sin(Date.now() / flashSpeed) * 0.3 + 0.7;
        
        // 绘制闪烁效果
        this.ctx.fillStyle = `rgba(255, 0, 0, ${0.2 * this.flashIntensity})`;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制茎
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 15);
        this.ctx.quadraticCurveTo(centerX - 5, centerY - 25, centerX - 12, centerY - 20);
        this.ctx.moveTo(centerX, centerY - 15);
        this.ctx.quadraticCurveTo(centerX + 5, centerY - 25, centerX + 12, centerY - 20);
        this.ctx.stroke();
        
        // 绘制左樱桃
        this.ctx.fillStyle = `rgb(${220 * this.flashIntensity}, 20, 60)`;
        this.ctx.beginPath();
        this.ctx.arc(centerX - 12, centerY + 5, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 左樱桃高光
        this.ctx.fillStyle = `rgba(255, 150, 150, ${0.6 * this.flashIntensity})`;
        this.ctx.beginPath();
        this.ctx.arc(centerX - 16, centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制右樱桃
        this.ctx.fillStyle = `rgb(${220 * this.flashIntensity}, 20, 60)`;
        this.ctx.beginPath();
        this.ctx.arc(centerX + 12, centerY + 5, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 右樱桃高光
        this.ctx.fillStyle = `rgba(255, 150, 150, ${0.6 * this.flashIntensity})`;
        this.ctx.beginPath();
        this.ctx.arc(centerX + 8, centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制眼睛（愤怒表情）
        this.ctx.fillStyle = '#000';
        // 左眼睛
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 18, centerY + 2);
        this.ctx.lineTo(centerX - 12, centerY + 8);
        this.ctx.lineTo(centerX - 6, centerY + 2);
        this.ctx.fill();
        // 右眼睛
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + 6, centerY + 2);
        this.ctx.lineTo(centerX + 12, centerY + 8);
        this.ctx.lineTo(centerX + 18, centerY + 2);
        this.ctx.fill();
        
        // 绘制眉毛（愤怒）
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 20, centerY - 5);
        this.ctx.lineTo(centerX - 8, centerY + 2);
        this.ctx.moveTo(centerX + 8, centerY + 2);
        this.ctx.lineTo(centerX + 20, centerY - 5);
        this.ctx.stroke();
        
        // 绘制嘴巴
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY + 12, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    update() {
        super.update();
        
        // 爆炸逻辑
        if (Date.now() - this.plantedTime > this.explodeTime) {
            this.health = 0;
        }
    }
}

// 食人花
class Chomper extends Plant {
    constructor(ctx, x, y) {
        super(ctx, x, y, 80, 60, 100);
        this.attackRange = 100;
        this.attackDamage = 100;
        this.attackCooldown = 5000;
        this.isChewing = false;
        this.chewTimer = 0;
        this.mouthOpen = 1; // 0-1, 1为完全张开
    }
    
    draw() {
        super.draw();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 绘制茎
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY + 25);
        this.ctx.lineTo(centerX, centerY - 5);
        this.ctx.stroke();
        
        // 绘制叶子
        this.ctx.fillStyle = '#32CD32';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX - 20, centerY + 15, 15, 8, -0.7, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(centerX + 20, centerY + 10, 12, 6, 0.7, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制头部下半部分
        this.ctx.fillStyle = '#8B008B';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY - 5, 20, 0, Math.PI);
        this.ctx.fill();
        
        // 绘制头部上半部分（可动）
        this.ctx.save();
        this.ctx.translate(centerX, centerY - 5);
        this.ctx.rotate(-this.mouthOpen * 0.5);
        this.ctx.fillStyle = '#8B008B';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, Math.PI, 0);
        this.ctx.fill();
        this.ctx.restore();
        
        // 绘制嘴唇/牙齿
        this.ctx.fillStyle = '#FFF';
        // 下牙齿
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 15 + i * 10, centerY - 5);
            this.ctx.lineTo(centerX - 12 + i * 10, centerY + 5);
            this.ctx.lineTo(centerX - 9 + i * 10, centerY - 5);
            this.ctx.fill();
        }
        // 上牙齿
        this.ctx.save();
        this.ctx.translate(centerX, centerY - 5);
        this.ctx.rotate(-this.mouthOpen * 0.5);
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(-15 + i * 10, 0);
            this.ctx.lineTo(-12 + i * 10, -10);
            this.ctx.lineTo(-9 + i * 10, 0);
            this.ctx.fill();
        }
        this.ctx.restore();
        
        // 绘制眼睛
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 8, centerY - 15, 6, 0, Math.PI * 2);
        this.ctx.arc(centerX + 8, centerY - 15, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 6, centerY - 15, 3, 0, Math.PI * 2);
        this.ctx.arc(centerX + 10, centerY - 15, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    update() {
        super.update();
        
        // 咀嚼动画
        if (this.isChewing) {
            this.chewTimer++;
            this.mouthOpen = 0.3 + Math.sin(this.chewTimer * 0.3) * 0.2;
            if (this.chewTimer > 60) {
                this.isChewing = false;
                this.chewTimer = 0;
                this.mouthOpen = 1;
            }
        }
    }
}

// 僵尸类
class Zombie {
    constructor(ctx, x, y, width = 80, height = 60, health = 200, speed = 0.3) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = health;
        this.maxHealth = health;
        this.speed = speed;
        this.animationFrame = 0;
        this.walkCycle = 0;
    }
    
    draw() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 绘制阴影
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, this.y + this.height - 3, this.width / 2, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制生命值条背景
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.x, this.y - 10, this.width, 5);
        
        // 绘制生命值
        const healthPercent = this.health / this.maxHealth;
        this.ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
        this.ctx.fillRect(this.x, this.y - 10, this.width * healthPercent, 5);
        
        // 腿部动画
        const legOffset = Math.sin(this.walkCycle) * 5;
        
        // 绘制左腿
        this.ctx.fillStyle = '#4A4A4A';
        this.ctx.fillRect(centerX - 12 + legOffset, centerY + 15, 8, 20);
        // 绘制右腿
        this.ctx.fillRect(centerX + 4 - legOffset, centerY + 15, 8, 20);
        
        // 绘制鞋子
        this.ctx.fillStyle = '#2F2F2F';
        this.ctx.fillRect(centerX - 14 + legOffset, centerY + 32, 12, 6);
        this.ctx.fillRect(centerX + 2 - legOffset, centerY + 32, 12, 6);
        
        // 绘制身体（西装）
        this.ctx.fillStyle = '#4A4A4A';
        this.ctx.fillRect(centerX - 15, centerY - 5, 30, 25);
        
        // 绘制领带
        this.ctx.fillStyle = '#8B0000';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 5);
        this.ctx.lineTo(centerX - 5, centerY + 15);
        this.ctx.lineTo(centerX + 5, centerY + 15);
        this.ctx.fill();
        
        // 绘制头部
        this.ctx.fillStyle = '#90EE90';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY - 15, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制头发
        this.ctx.fillStyle = '#2F2F2F';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY - 20, 15, Math.PI, 0);
        this.ctx.fill();
        
        // 绘制眼睛（空洞）
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 6, centerY - 18, 4, 0, Math.PI * 2);
        this.ctx.arc(centerX + 6, centerY - 18, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 6, centerY - 18, 2, 0, Math.PI * 2);
        this.ctx.arc(centerX + 6, centerY - 18, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制嘴巴（张开）
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY - 8, 8, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制牙齿
        this.ctx.fillStyle = '#FFF';
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 5 + i * 5, centerY - 10);
            this.ctx.lineTo(centerX - 3 + i * 5, centerY - 6);
            this.ctx.lineTo(centerX - 1 + i * 5, centerY - 10);
            this.ctx.fill();
        }
        
        // 绘制手臂（前伸）
        this.ctx.strokeStyle = '#90EE90';
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 12, centerY);
        this.ctx.lineTo(centerX - 25, centerY + 5);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + 12, centerY);
        this.ctx.lineTo(centerX + 25, centerY + 5);
        this.ctx.stroke();
    }
    
    update() {
        // 移动
        this.x -= this.speed;
        this.animationFrame++;
        this.walkCycle += 0.15;
        
        // 检查是否到达终点
        if (this.x < -this.width) {
            this.health = 0;
        }
    }
    
    attacked(damage) {
        this.health -= damage;
    }
}

// 阳光类
class Sunshine {
    constructor(ctx, x, y, width = 40, height = 40) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.collected = false;
        this.fallSpeed = 0.8;
        this.rotation = 0;
        this.scale = 1;
    }
    
    draw() {
        if (this.collected) return;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.rotation);
        this.ctx.scale(this.scale, this.scale);
        
        // 绘制光晕
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制阳光主体
        this.ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const px = Math.cos(angle) * 15;
            const py = Math.sin(angle) * 15;
            this.ctx.beginPath();
            this.ctx.ellipse(px, py, 8, 4, angle, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 绘制中心
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制中心高光
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(-3, -3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    update() {
        if (this.collected) return;
        
        // 下落
        this.y += this.fallSpeed;
        
        // 旋转动画
        this.rotation += 0.02;
        
        // 缩放动画
        this.scale = 1 + Math.sin(Date.now() / 500) * 0.1;
        
        // 检查是否落地
        if (this.y > 600) {
            this.collected = true;
        }
    }
    
    collect() {
        this.collected = true;
    }
}