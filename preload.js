const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('app', {
  version: process.versions.electron,
});
