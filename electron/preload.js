const { contextBridge, ipcRenderer } = require('electron');

// Expose APIs ไปยัง React Frontend
contextBridge.exposeInMainWorld('api', {
  // Parts APIs
  getAllParts: () => ipcRenderer.invoke('get-all-parts'),
  addPart: (part) => ipcRenderer.invoke('add-part', part),
  updatePart: (part) => ipcRenderer.invoke('update-part', part),
  deletePart: (id) => ipcRenderer.invoke('delete-part', id),
  
  // Repairs APIs
  getAllRepairs: () => ipcRenderer.invoke('get-all-repairs'),
  addRepair: (repair) => ipcRenderer.invoke('add-repair', repair),
  updateRepair: (repair) => ipcRenderer.invoke('update-repair', repair),
  deleteRepair: (id) => ipcRenderer.invoke('delete-repair', id),
});
