// 游戏引擎
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scene = new Scene(this.ctx);
        this.isRunning = false;
        this.lastTime = 0;
        this.initEventListeners();
    }
    
    // 初始化事件监听器
    initEventListeners() {
        // 点击事件
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 如果显示说明界面，点击任意处关闭
            if (this.scene.showInstructions) {
                this.scene.showInstructions = false;
                return;
            }
            
            // 如果游戏结束，点击重新开始
            if (this.scene.gameStatus === 'gameover') {
                this.reset();
                return;
            }
            
            // 检查是否点击了阳光（先检查阳光，再检查其他）
            this.scene.collectSunshine(x, y);
            
            // 检查是否点击了植物卡片
            this.scene.cards.forEach((card, index) => {
                const cardX = 130 + index * 80;
                const cardY = 10;
                const cardWidth = 70;
                const cardHeight = 70;
                
                if (x >= cardX && x <= cardX + cardWidth && y >= cardY && y <= cardY + cardHeight) {
                    if (this.scene.sunshine >= card.cost) {
                        this.scene.selectedCard = card.type;
                    }
                    return;
                }
            });
            
            // 检查是否点击了草地（放置植物）
            if (y >= 100) {
                this.scene.placePlant(x, y);
            }
        });
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'p':
                    this.togglePause();
                    break;
                case 'r':
                    this.reset();
                    break;
            }
        });
    }
    
    // 开始游戏
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = Date.now();
        this.gameLoop();
    }
    
    // 游戏主循环
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新场景
        this.scene.update();
        
        // 绘制场景
        this.scene.draw();
        
        // 递归调用
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // 暂停/继续游戏
    togglePause() {
        if (this.scene.gameStatus === 'running') {
            this.scene.gameStatus = 'paused';
        } else if (this.scene.gameStatus === 'paused') {
            this.scene.gameStatus = 'running';
        }
    }
    
    // 重置游戏
    reset() {
        this.scene = new Scene(this.ctx);
    }
}