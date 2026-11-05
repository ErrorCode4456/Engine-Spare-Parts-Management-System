import React, { useState } from 'react';
import { mockApi } from '../api/mockApi';
import { Toast } from './Toast';

function PartsStock({ parts, onDataChange, api = mockApi }) {
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    part_name: '',
    quantity: 0,
    cost_price: 0,
    sell_price: 0,
  });

  const handleAdd = () => {
    setEditingPart(null);
    setFormData({
      part_name: '',
      quantity: 0,
      cost_price: 0,
      sell_price: 0,
    });
    setShowModal(true);
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setFormData({
      part_name: part.part_name,
      quantity: part.quantity,
      cost_price: part.cost_price,
      sell_price: part.sell_price,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('ยืนยันการลบอะไหล่นี้?')) {
      try {
        const result = await api.deletePart(id);
        if (result.success) {
          setToast({ message: 'ลบอะไหล่สำเร็จ', type: 'success' });
          onDataChange();
        } else {
          setToast({ message: 'เกิดข้อผิดพลาด: ' + result.error, type: 'error' });
        }
      } catch (error) {
        setToast({ message: 'เกิดข้อผิดพลาด: ' + error.message, type: 'error' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const partData = {
      ...formData,
      quantity: parseInt(formData.quantity),
      cost_price: parseFloat(formData.cost_price),
      sell_price: parseFloat(formData.sell_price),
    };

    let result;
    if (editingPart) {
      result = await api.updatePart({ ...partData, id: editingPart.id });
    } else {
      result = await api.addPart(partData);
    }

    if (result.success) {
      setToast({ message: editingPart ? 'แก้ไขอะไหล่สำเร็จ' : 'เพิ่มอะไหล่สำเร็จ', type: 'success' });
      setShowModal(false);
      onDataChange();
    } else {
      setToast({ message: 'เกิดข้อผิดพลาด: ' + result.error, type: 'error' });
    }
  };

  const filteredParts = parts.filter(part =>
    part.part_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = parts.reduce((sum, part) => sum + (part.quantity * part.cost_price), 0);
  const totalItems = parts.reduce((sum, part) => sum + part.quantity, 0);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>จำนวนรายการอะไหล่</h3>
          <div className="value" style={{ color: '#667eea' }}>{parts.length}</div>
        </div>
        <div className="stat-card">
          <h3>จำนวนชิ้นทั้งหมด</h3>
          <div className="value" style={{ color: '#667eea' }}>{totalItems.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h3>มูลค่า Stock (ราคาทุน)</h3>
          <div className="value" style={{ color: '#48bb78' }}>{totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</div>
        </div>
      </div>

      <div className="section-header">
        <h2>Stock อะไหล่</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + เพิ่มอะไหล่
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="ค้นหาอะไหล่..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        {filteredParts.length === 0 ? (
          <div className="empty-state">
            <p>ไม่มีข้อมูลอะไหล่</p>
            <button className="btn btn-primary" onClick={handleAdd}>
              เพิ่มอะไหล่แรก
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ชื่อ อะไหล่</th>
                <th>จำนวน</th>
                <th>ราคาทุน</th>
                <th>ราคาขาย</th>
                <th>กำไร/ชิ้น</th>
                <th>มูลค่ารวม</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map((part) => (
                <tr key={part.id}>
                  <td><strong>{part.part_name}</strong></td>
                  <td>{part.quantity}</td>
                  <td>{part.cost_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</td>
                  <td>{part.sell_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</td>
                  <td style={{ color: part.sell_price - part.cost_price >= 0 ? '#48bb78' : '#f56565' }}>
                    {(part.sell_price - part.cost_price).toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                  </td>
                  <td>{(part.quantity * part.cost_price).toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-secondary" onClick={() => handleEdit(part)}>
                        แก้ไข
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(part.id)}>
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false);
          }
        }}>
          <div className="modal">
            <h3>{editingPart ? 'แก้ไขอะไหล่' : 'เพิ่มอะไหล่ใหม่'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ชื่ออะไหล่ *</label>
                <input
                  type="text"
                  required
                  value={formData.part_name}
                  onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
                  placeholder="เช่น น็อตเกลียว, หัวเทียน, ไส้กรอง"
                />
              </div>

              <div className="form-group">
                <label>จำนวน *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>ราคาทุน (บาท) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>ราคาขาย (บาท) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.sell_price}
                  onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-success">
                  {editingPart ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartsStock;
