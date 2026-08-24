// PWA Sense Bridge → 茗夏 直连适配器
// 把传感器事件通过 ntfy.sh 推送通道实时转发给茗夏
// 部署：修改 demo/app.js 引入本文件，或直接在页面中加载

// ntfy.sh 推送主题（私有，仅你和茗夏知道）
const NTFY_TOPIC = 'nora-mingxia-sense-bridge-2026';

// 把传感器事件推送给茗夏（通过 ntfy.sh）
async function sendToMingxia(event) {
  try {
    const payload = {
      ...event,
      source: 'sense-bridge',
      from: 'nora',
      to: 'mingxia',
      sentAt: Date.now()
    };
    const resp = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (resp.ok) {
      console.log('[SenseBridge→茗夏] 已送达:', payload);
      return true;
    }
    console.error('[SenseBridge→茗夏] 推送失败:', resp.status);
    return false;
  } catch (err) {
    console.error('[SenseBridge→茗夏] 推送异常:', err);
    return false;
  }
}

// 导出给 app.js 使用
window.MingxiaBridge = { sendToMingxia }; 