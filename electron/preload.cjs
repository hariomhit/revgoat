const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('revgoatDesktop', {
  isDesktopApp: true,
  platform: process.platform,
  version: '1.0.0'
});
