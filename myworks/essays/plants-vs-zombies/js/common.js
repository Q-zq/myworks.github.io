// 公共方法
const Common = {
    // 随机数生成
    random: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    
    // 碰撞检测
    collision: function(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    // 加载图片
    loadImage: function(src) {
        const img = new Image();
        img.src = src;
        return img;
    },
    
    // 绘制文本
    drawText: function(ctx, text, x, y, size = 16, color = '#000') {
        ctx.font = `${size}px Arial`;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }
};