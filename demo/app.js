import { SenseBridge } from '../src/sense-bridge.js';

const labels = {
  secureContext: 'HTTPS', microphone: '麦克风', orientation: '方向',
  motion: '动作', touch: '触摸', cameraPicker: '相机选择器'
};
const output = document.getElementById('eventOutput');
const diagnosticOutput = document.getElementById('diagnosticOutput');
const status = document.getElementById('status');
const enabled = new Set();

const bridge = new SenseBridge({
  localOnly: false,
  onEvent(event) {
    output.textContent = JSON.stringify(event, null, 2);
    // 实时推送给茗夏
    if (window.MingxiaBridge) {
      window.MingxiaBridge.sendToMingxia(event);
    }
  }
});

bridge.addEventListener('sense', (event) => {
  output.textContent = JSON.stringify(event.detail, null, 2);
});

let diagnosticTimer = 0;
bridge.addEventListener('diagnostic', () => {
  if (diagnosticTimer) return;
  diagnosticTimer = setTimeout(() => {
    diagnosticTimer = 0;
    diagnosticOutput.textContent = JSON.stringify(bridge.report(), null, 2);
  }, 180);
});

function renderCapabilities() {
  const values = bridge.capabilities();
  document.getElementById('secureBadge').textContent = values.secureContext ? '安全上下文' : '需要 HTTPS';
  document.getElementById('capabilities').innerHTML = Object.entries(values).map(([key, value]) => (
    `<div class="capability" data-ok="${value}"><b>${labels[key] || key}</b><small>${value ? '可用' : '不可用'}</small></div>`
  )).join('');
  const requirements = { blow: values.microphone, rotation: values.motion || values.orientation, shake: values.motion, touch: values.touch };
  document.querySelectorAll('[data-sensor]').forEach((button) => { button.disabled = !requirements[button.dataset.sensor]; });
  document.getElementById('cameraButton').disabled = !values.cameraPicker;
}

async function toggleSensor(button) {
  const name = button.dataset.sensor;
  if (enabled.has(name)) {
    bridge.disable(name);
    enabled.delete(name);
    button.setAttribute('aria-pressed', 'false');
    status.textContent = `${name} 已关闭`;
    return;
  }
  status.textContent = '正在申请系统权限…';
  try {
    if (name === 'blow') await bridge.enableBlow();
    if (name === 'rotation') await bridge.enableRotation();
    if (name === 'shake') await bridge.enableShake();
    if (name === 'touch') bridge.enableTouch(document.body);
    enabled.add(name);
    button.setAttribute('aria-pressed', 'true');
    status.textContent = name === 'rotation' ? '请自然握住手机片刻，正在静默校准。' : `${name} 已开启`;
  } catch (error) {
    status.textContent = error.message;
    button.setAttribute('aria-pressed', 'false');
  }
}

document.querySelectorAll('[data-sensor]').forEach((button) => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => toggleSensor(button));
});

document.getElementById('localOnly').addEventListener('click', (event) => {
  const next = event.currentTarget.getAttribute('aria-pressed') !== 'true';
  event.currentTarget.setAttribute('aria-pressed', String(next));
  event.currentTarget.textContent = `仅本地测试：${next ? '开' : '关'}`;
  bridge.setLocalOnly(next);
});

document.getElementById('cameraButton').addEventListener('click', async () => {
  const file = await bridge.capturePhoto({ camera: 'rear' });
  output.textContent = file ? JSON.stringify({ type: 'camera_file', name: file.name, size: file.size, mime: file.type }, null, 2) : '没有选择照片。';
});

document.getElementById('copyDiagnostic').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(bridge.report(), null, 2));
    status.textContent = '诊断报告已复制。';
  } catch {
    status.textContent = '无法自动复制，可以长按上方诊断内容。';
  }
});

renderCapabilities();
diagnosticOutput.textContent = JSON.stringify(bridge.report(), null, 2);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
