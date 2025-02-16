const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    }
  });

  mainWindow.loadFile("index.html");

}

app.whenReady().then(createWindow);

ipcMain.on("minimize-window", () => {
  BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on("close-window", () => {
  BrowserWindow.getFocusedWindow().close();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
