# ✈️ 飞机大战 (Plane Shooter)

竖版飞行射击小游戏，纯 HTML5 Canvas 实现，**无任何外部图片或依赖**。

## 玩法
- **← → / A D** 或 **触屏拖动** 移动飞机，自动开火
- 击落敌机 +10 分；敌机漏到底部或撞到你都会扣 1 条命
- 3 条命用完即结束；随时间推移敌机更密集更快

## 特性
- 玩家飞船、子弹、敌机、爆炸全部用代码绘制
- 星空滚动背景、触屏 + 键盘双操作
- 实时分数与生命显示

## 运行
直接用浏览器打开 `index.html`，或启动本地服务器：

```bash
python -m http.server 8000
# 访问 http://localhost:8000
```

## 在线试玩
**https://zzy-2011.github.io/feiji/**

## 文件结构
```
plane-game/
├── index.html
├── style.css
└── game.js
```
