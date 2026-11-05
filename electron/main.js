const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let dbPath;
let db = { parts: [], repairs: [], nextPartId: 1, nextRepairId: 1 };

const isDev = !app.isPackaged;

// Simple JSON-based database
class Database {
  constructor() {
    this.parts = [];
    this.repairs = [];
    this.nextPartId = 1;
    this.nextRepairId = 1;
  }

  load() {
    try {
      if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        const parsed = JSON.parse(data);
        this.parts = parsed.parts || [];
        this.repairs = parsed.repairs || [];
        this.nextPartId = Math.max(...this.parts.map(p => p.id), 0) + 1;
        this.nextRepairId = Math.max(...this.repairs.map(r => r.id), 0) + 1;
        console.log('Database loaded');
      }
    } catch (err) {
      console.error('Load error:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(dbPath, JSON.stringify({ parts: this.parts, repairs: this.repairs }, null, 2));
    } catch (err) {
      console.error('Save error:', err);
    }
  }
}

function initDatabase() {
  dbPath = path.join(app.getPath('userData'), 'garage.db.json');
  console.log('Database path:', dbPath);
  db = new Database();
  db.load();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.removeMenu();

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ==================== IPC Handlers ====================

// Parts APIs
ipcMain.handle('get-all-parts', () => {
  return { success: true, data: db.parts };
});

ipcMain.handle('add-part', (event, part) => {
  try {
    const newPart = {
      ...part,
      id: db.nextPartId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.parts.push(newPart);
    db.save();
    return { success: true, id: newPart.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-part', (event, part) => {
  try {
    const index = db.parts.findIndex(p => p.id === part.id);
    if (index !== -1) {
      db.parts[index] = { ...part, updated_at: new Date().toISOString() };
      db.save();
      return { success: true };
    }
    return { success: false, error: 'Part not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-part', (event, id) => {
  try {
    db.parts = db.parts.filter(p => p.id !== id);
    db.save();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Repairs APIs
ipcMain.handle('get-all-repairs', () => {
  const repairs = db.repairs.map(repair => ({
    ...repair,
    parts_list: typeof repair.parts_list === 'string' ? JSON.parse(repair.parts_list) : repair.parts_list
  }));
  return { success: true, data: repairs };
});

ipcMain.handle('add-repair', (event, repair) => {
  try {
    const newRepair = {
      organization: repair.organization,
      car_brand: repair.car_brand,
      license_plate: repair.license_plate,
      repair_date: repair.repair_date,
      parts_list: typeof repair.parts_list === 'string' ? repair.parts_list : JSON.stringify(repair.parts_list),
      total_cost: repair.total_cost || 0,
      total_sell: repair.total_sell || 0,
      id: db.nextRepairId++,
      created_at: new Date().toISOString(),
    };
    db.repairs.push(newRepair);
    db.save();
    return { success: true, id: newRepair.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-repair', (event, repair) => {
  try {
    const index = db.repairs.findIndex(r => r.id === repair.id);
    if (index !== -1) {
      db.repairs[index] = {
        ...repair,
        parts_list: typeof repair.parts_list === 'string' ? repair.parts_list : JSON.stringify(repair.parts_list),
      };
      db.save();
      return { success: true };
    }
    return { success: false, error: 'Repair not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-repair', (event, id) => {
  try {
    db.repairs = db.repairs.filter(r => r.id !== id);
    db.save();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
