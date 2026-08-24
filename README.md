# PWA Sense Bridge

一个无依赖、隐私优先的移动端感知桥。它把 PWA 中的吹气、转动、摇晃和长按转换为结构化事件，交给任意 LLM 对话后端。

```json
{
  "type": "sensor_event",
  "event": "device_rotated",
  "strength": 0.48,
  "direction": "left",
  "timestamp": 1784650000000
}
```

它不绑定 Anthropic、OpenAI、MCP 或特定聊天框架。项目只负责把现实输入整理成稳定事件；是否发送、如何注入上下文，由宿主应用决定。

## 特性

- 吹气：麦克风音量只在本机分析，不上传录音。
- 转动：优先使用重力向量，避开手机竖持时 `gamma` 欧拉角方向失真。
- 自动校准：采集初始姿态并处理 0/360° 边界，横竖屏切换后重校。
- 摇晃与长按：带阈值、冷却和强度归一化。
- 相机：仅提供用户点击触发的文件选择；不会静默打开摄像头。
- 能力检测与诊断报告：方便定位 Android 浏览器碎片化问题。
- 本地测试模式：可完整观察事件，但不调用宿主的发送回调。

## 快速接入

直接用 ES Module：

```js
import { SenseBridge } from './src/sense-bridge.js';

const bridge = new SenseBridge({
  onEvent(event) {
    fetch('/api/chat/sensor-event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event)
    });
  }
});

// 必须放在真实的用户点击处理函数里，iOS 才会弹权限。
rotateButton.addEventListener('click', () => bridge.enableRotation());
blowButton.addEventListener('click', () => bridge.enableBlow());
shakeButton.addEventListener('click', () => bridge.enableShake());

bridge.enableTouch(document.querySelector('#conversation'));
```

关闭单项或全部感知：

```js
bridge.disable('rotation');
bridge.disableAll();
```

## 交给模型的方式

建议把事件作为独立、低优先级的结构化输入，不伪装成用户说出的话：

```js
function toModelMessage(event) {
  return {
    role: 'user',
    content: [{
      type: 'text',
      text: `<sensor_event>${JSON.stringify(event)}</sensor_event>`
    }]
  };
}
```

宿主应做节流，并避免把每个原始采样点送给模型。Sense Bridge 只输出越过阈值后的语义事件。

## 权限与平台边界

- 生产环境必须使用 HTTPS；`localhost` 可用于开发。
- iOS 的动作、方向、麦克风和相机权限必须由用户手势触发。
- PWA 进入后台后，浏览器通常会暂停传感器。
- 主流 iOS Safari/PWA 与 Android Chromium 是目标范围，但不能承诺所有厂商 WebView 行为一致。
- `detectCapabilities()` 只能证明 API 存在；真正权限状态要在用户尝试启用后确定。

## 诊断

```js
bridge.addEventListener('diagnostic', ({ detail }) => {
  console.log(detail);
});

const report = bridge.report();
bridge.setLocalOnly(true);
```

诊断只包含权限状态、数值采样和最终事件，不包含录音、照片或聊天内容。

## 运行示例

```bash
npm test
npm run demo
```

然后用同一局域网内的手机访问 HTTPS 开发地址。普通 HTTP 的局域网 IP 无法获得多数传感器权限。

## 浏览器支持口径

建议对外写：

> 支持主流 iOS Safari/PWA 与 Android Chromium 浏览器，采用渐进增强；实际能力以设备诊断结果为准。

不要写“支持所有 iOS 和 Android 设备”。

## License

MIT
