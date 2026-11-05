import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import PartsStock from './components/PartsStock';
import RepairHistory from './components/RepairHistory';
import { mockApi } from './api/mockApi';

// Use mock API if window.api is not available (running in browser)
const api = typeof window !== 'undefined' && window.api ? window.api : mockApi;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('repairs');
  const [parts, setParts] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    setIsElectron(typeof window !== 'undefined' && window.api !== undefined);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    try {
      // โหลดข้อมูล parts
      const partsResult = await api.getAllParts();
      if (partsResult.success) {
        setParts(partsResult.data);
      }

      // โหลดข้อมูล repairs
      const repairsResult = await api.getAllRepairs();
      if (repairsResult.success) {
        setRepairs(repairsResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const handleExportData = () => {
    const dataToExport = {
      parts,
      repairs,
      exportDate: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `garage-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          
          // ตรวจสอบ structure
          if (!importedData.parts || !importedData.repairs) {
            alert('ไฟล์ข้อมูลไม่ถูกต้อง');
            return;
          }

          // ถามยืนยัน
          if (!window.confirm(`นำเข้าข้อมูล ${importedData.parts.length} อะไหล่ และ ${importedData.repairs.length} ประวัติการซ่อม?\nข้อมูลเก่าจะถูกแทนที่`)) {
            return;
          }

          // บันทึกข้อมูล
          for (const part of importedData.parts) {
            if (part.id) {
              await api.updatePart(part);
            } else {
              await api.addPart(part);
            }
          }

          for (const repair of importedData.repairs) {
            if (repair.id) {
              await api.updateRepair(repair);
            } else {
              await api.addRepair(repair);
            }
          }

          alert('นำเข้าข้อมูลสำเร็จ!');
          loadData();
        } catch (error) {
          console.error('Import error:', error);
          alert('ไม่สามารถนำเข้าข้อมูลได้');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>ระบบจัดการอะไหล่และ Stock</h1>
            <p>
              Garage Stock Manager - จัดการอะไหล่และประวัติการซ่อม
              {!isElectron && <span style={{ marginLeft: '10px', opacity: 0.8 }}>(Demo Mode - ข้อมูลเก็บใน Browser)</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-secondary"
              onClick={handleExportData}
              style={{ fontSize: '14px', padding: '10px 16px' }}
            >
              ส่งออกข้อมูล
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleImportData}
              style={{ fontSize: '14px', padding: '10px 16px' }}
            >
              นำเข้าข้อมูล
            </button>
          </div>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'repairs' ? 'active' : ''}`}
          onClick={() => setActiveTab('repairs')}
        >
          ประวัติการซ่อม/เบิกอะไหล่
        </button>
        <button
          className={`tab ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          Stock อะไหล่
        </button>
      </div>

      <div className="content">
        {activeTab === 'repairs' && (
          <RepairHistory 
            repairs={repairs} 
            parts={parts}
            onDataChange={loadData}
            api={api}
          />
        )}
        {activeTab === 'stock' && (
          <PartsStock 
            parts={parts} 
            onDataChange={loadData}
            api={api}
          />
        )}
      </div>
    </div>
  );
}

export default App;
