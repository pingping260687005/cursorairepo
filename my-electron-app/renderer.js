// 渲染进程脚本
const { ipcRenderer } = require('electron');
const os = require('os');

// 更新时间
function updateTime() {
  const now = new Date();
  document.getElementById('current-time').textContent = now.toLocaleString('zh-CN');
}

// 显示版本信息
function showVersionInfo() {
  document.getElementById('node-version').textContent = process.versions.node;
  document.getElementById('chrome-version').textContent = process.versions.chrome;
  document.getElementById('electron-version').textContent = process.versions.electron;
  document.getElementById('platform').textContent = os.platform();
}

// 显示提示框
function showAlert() {
  alert('Hello from Electron! 🎉\n这是一个来自渲染进程的消息！');
}

// 打开开发者工具
function openDevTools() {
  require('electron').remote?.getCurrentWindow().webContents.openDevTools();
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  showVersionInfo();
  updateTime();
  
  // 每秒更新时间
  setInterval(updateTime, 1000);
  
  console.log('Electron 应用已启动！');
  console.log('Node.js 版本:', process.versions.node);
  console.log('Chromium 版本:', process.versions.chrome);
  console.log('Electron 版本:', process.versions.electron);
});

// 添加一些键盘快捷键
document.addEventListener('keydown', (event) => {
  // F12 打开开发者工具
  if (event.key === 'F12') {
    openDevTools();
  }
  
  // Ctrl+R 刷新页面
  if (event.ctrlKey && event.key === 'r') {
    location.reload();
  }
});