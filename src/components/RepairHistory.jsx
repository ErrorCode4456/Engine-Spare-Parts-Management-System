import React, { useState } from 'react';
import { mockApi } from '../api/mockApi';
import { Toast } from './Toast';

function RepairHistory({ repairs, parts, onDataChange, api = mockApi }) {
  const [showModal, setShowModal] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    organization: '',
    car_brand: '',
    license_plate: '',
  });
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    organization: '',
    car_brand: '',
    license_plate: '',
    repair_date: new Date().toISOString().split('T')[0],
    parts_list: [{ part_name: '', cost_price: 0, sell_price: 0 }],
  });
  const [suggestions, setSuggestions] = useState({
    organization: [],
    car_brand: [],
    license_plate: [],
  });
  const [showSuggestions, setShowSuggestions] = useState({
    organization: false,
    car_brand: false,
    license_plate: false,
  });

  // Extract unique values from repairs history
  const getUniqueSuggestions = () => {
    return {
      organization: [...new Set(repairs.map(r => r.organization).filter(Boolean))],
      car_brand: [...new Set(repairs.map(r => r.car_brand).filter(Boolean))],
      license_plate: [...new Set(repairs.map(r => r.license_plate).filter(Boolean))],
    };
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    if (value.length > 0) {
      const allSuggestions = getUniqueSuggestions();
      const filtered = allSuggestions[field].filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions({ ...suggestions, [field]: filtered });
      setShowSuggestions({ ...showSuggestions, [field]: true });
    } else {
      setSuggestions({ ...suggestions, [field]: [] });
      setShowSuggestions({ ...showSuggestions, [field]: false });
    }
  };

  const selectSuggestion = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setShowSuggestions({ ...showSuggestions, [field]: false });
  };

  const handleAdd = () => {
    setEditingRepair(null);
    setFormData({
      organization: '',
      car_brand: '',
      license_plate: '',
      repair_date: new Date().toISOString().split('T')[0],
      parts_list: [{ part_name: '', cost_price: 0, sell_price: 0 }],
    });
    setShowModal(true);
  };

  const handleEdit = (repair) => {
    setEditingRepair(repair);
    setFormData({
      organization: repair.organization,
      car_brand: repair.car_brand,
      license_plate: repair.license_plate,
      repair_date: repair.repair_date,
      parts_list: repair.parts_list || [{ 
        part_name: '', 
        cost_price: 0, 
        sell_price: 0 
      }],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('ยืนยันการลบรายการซ่อมนี้?')) {
      try {
        const result = await api.deleteRepair(id);
        if (result.success) {
          setToast({ message: 'ลบรายการสำเร็จ', type: 'success' });
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

    const repairData = {
      organization: formData.organization,
      car_brand: formData.car_brand,
      license_plate: formData.license_plate,
      repair_date: formData.repair_date,
      parts_list: formData.parts_list.map(part => ({
        part_name: part.part_name,
        cost_price: parseFloat(part.cost_price),
        sell_price: parseFloat(part.sell_price),
      })),
    };

    try {
      let result;
      if (editingRepair) {
        result = await api.updateRepair({ ...repairData, id: editingRepair.id });
      } else {
        result = await api.addRepair(repairData);
      }

      if (result.success) {
        setToast({ message: editingRepair ? 'แก้ไขรายการสำเร็จ' : 'เพิ่มรายการสำเร็จ', type: 'success' });
        setShowModal(false);
        onDataChange();
      } else {
        setToast({ message: 'เกิดข้อผิดพลาด: ' + result.error, type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'เกิดข้อผิดพลาด: ' + error.message, type: 'error' });
    }
  };

  const handlePartChange = (index, field, value) => {
    const updatedParts = [...formData.parts_list];
    updatedParts[index] = { ...updatedParts[index], [field]: value };
    setFormData({ ...formData, parts_list: updatedParts });
  };

  const handlePartSelect = (index, partName) => {
    const selectedPart = parts.find(p => p.part_name === partName);
    
    if (selectedPart) {
      const updatedParts = [...formData.parts_list];
      updatedParts[index] = {
        part_name: partName,
        cost_price: selectedPart.cost_price,
        sell_price: selectedPart.sell_price,
      };
      setFormData({ ...formData, parts_list: updatedParts });
    }
  };

  const addPartRow = () => {
    setFormData({
      ...formData,
      parts_list: [...formData.parts_list, { part_name: '', cost_price: 0, sell_price: 0 }],
    });
  };

  const removePartRow = (index) => {
    if (formData.parts_list.length > 1) {
      const updatedParts = formData.parts_list.filter((_, i) => i !== index);
      setFormData({ ...formData, parts_list: updatedParts });
    }
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchOrganization = !searchFilters.organization || 
      repair.organization.toLowerCase().includes(searchFilters.organization.toLowerCase());
    
    const matchCarBrand = !searchFilters.car_brand || 
      repair.car_brand.toLowerCase().includes(searchFilters.car_brand.toLowerCase());
    
    const matchLicensePlate = !searchFilters.license_plate || 
      repair.license_plate.toLowerCase().includes(searchFilters.license_plate.toLowerCase());
    
    return matchOrganization && matchCarBrand && matchLicensePlate;
  });

  const totalRevenue = repairs.reduce((sum, repair) => sum + (repair.total_sell || 0), 0);
  const totalCost = repairs.reduce((sum, repair) => sum + (repair.total_cost || 0), 0);
  const totalProfit = totalRevenue - totalCost;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>จำนวนรายการซ่อม</h3>
          <div className="value" style={{ color: '#667eea' }}>{repairs.length}</div>
        </div>
        <div className="stat-card">
          <h3>รายได้รวม</h3>
          <div className="value" style={{ color: '#38b2ac' }}>
            {totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
          </div>
        </div>
        <div className="stat-card">
          <h3>ต้นทุนรวม</h3>
          <div className="value" style={{ color: '#ed8936' }}>
            {totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
          </div>
        </div>
        <div className="stat-card">
          <h3>กำไรรวม</h3>
          <div className="value" style={{ color: totalProfit >= 0 ? '#48bb78' : '#f56565', fontWeight: 'bold' }}>
            {totalProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
          </div>
        </div>
      </div>

      <div className="section-header">
        <div>
          <h2>ประวัติการซ่อม/เบิกอะไหล่</h2>
          {(searchFilters.organization || searchFilters.car_brand || searchFilters.license_plate) && (
            <p style={{ fontSize: '14px', color: '#718096', marginTop: '5px' }}>
              แสดง {filteredRepairs.length} จาก {repairs.length} รายการ
            </p>
          )}
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          + เพิ่มรายการ
        </button>
      </div>

      <div className="search-filters">
        <div className="search-filter-item">
          <label>หน่วยงาน</label>
          <input
            type="text"
            placeholder="ค้นหาหน่วยงาน..."
            value={searchFilters.organization}
            onChange={(e) => setSearchFilters({ ...searchFilters, organization: e.target.value })}
          />
        </div>
        <div className="search-filter-item">
          <label>ยี่ห้อรถ</label>
          <input
            type="text"
            placeholder="ค้นหายี่ห้อรถ..."
            value={searchFilters.car_brand}
            onChange={(e) => setSearchFilters({ ...searchFilters, car_brand: e.target.value })}
          />
        </div>
        <div className="search-filter-item">
          <label>ทะเบียนรถ</label>
          <input
            type="text"
            placeholder="ค้นหาทะเบียนรถ..."
            value={searchFilters.license_plate}
            onChange={(e) => setSearchFilters({ ...searchFilters, license_plate: e.target.value })}
          />
        </div>
        {(searchFilters.organization || searchFilters.car_brand || searchFilters.license_plate) && (
          <button 
            className="btn btn-secondary clear-filters-btn"
            onClick={() => setSearchFilters({ organization: '', car_brand: '', license_plate: '' })}
          >
            ล้างตัวกรอง
          </button>
        )}
      </div>

      <div className="table-container">
        {filteredRepairs.length === 0 ? (
          <div className="empty-state">
            <p>ไม่มีข้อมูลการซ่อม</p>
            <button className="btn btn-primary" onClick={handleAdd}>
              เพิ่มรายการแรก
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>วันที่</th>
                <th>หน่วยงาน</th>
                <th>ยี่ห้อรถ</th>
                <th>ทะเบียน</th>
                <th>รายการอะไหล่</th>
                <th>ราคาทุนรวม</th>
                <th>ราคาขายรวม</th>
                <th>กำไร</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepairs.map((repair) => {
                const totalCost = repair.total_cost || 0;
                const totalSell = repair.total_sell || 0;
                const profit = totalSell - totalCost;
                
                return (
                  <tr key={repair.id}>
                    <td>{formatDate(repair.repair_date)}</td>
                    <td><strong>{repair.organization}</strong></td>
                    <td>{repair.car_brand}</td>
                    <td>{repair.license_plate}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {(repair.parts_list || []).map((part, index) => (
                          <div key={index} style={{ fontSize: '13px', padding: '4px 0' }}>
                            <strong>{part.part_name}</strong>
                            <span style={{ color: '#64748b', marginLeft: '8px' }}>
                              ({part.cost_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })} / {part.sell_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿)
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>{totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</td>
                    <td>{totalSell.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</td>
                    <td style={{ color: profit >= 0 ? '#48bb78' : '#f56565', fontWeight: '600' }}>
                      {profit.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary" onClick={() => handleEdit(repair)}>
                          แก้ไข
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(repair.id)}>
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
            <h3>{editingRepair ? 'แก้ไขรายการซ่อม' : 'เพิ่มรายการซ่อมใหม่'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>หน่วยงาน *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                    onFocus={() => formData.organization.length > 0 && setShowSuggestions({ ...showSuggestions, organization: true })}
                    placeholder="เช่น กรมทางหลวง, องค์การบริหารส่วนตำบล"
                  />
                  {showSuggestions.organization && suggestions.organization.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '2px solid #e2e8f0',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 10,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}>
                      {suggestions.organization.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectSuggestion('organization', item)}
                          style={{
                            padding: '12px 14px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                            '&:hover': { background: '#f8fafc' }
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                          onMouseLeave={(e) => e.target.style.background = 'white'}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>ยี่ห้อรถ *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={formData.car_brand}
                    onChange={(e) => handleInputChange('car_brand', e.target.value)}
                    onFocus={() => formData.car_brand.length > 0 && setShowSuggestions({ ...showSuggestions, car_brand: true })}
                    placeholder="เช่น Toyota, Isuzu, Mitsubishi"
                  />
                  {showSuggestions.car_brand && suggestions.car_brand.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '2px solid #e2e8f0',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 10,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}>
                      {suggestions.car_brand.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectSuggestion('car_brand', item)}
                          style={{
                            padding: '12px 14px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                          onMouseLeave={(e) => e.target.style.background = 'white'}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>ทะเบียนรถ *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={formData.license_plate}
                    onChange={(e) => handleInputChange('license_plate', e.target.value)}
                    onFocus={() => formData.license_plate.length > 0 && setShowSuggestions({ ...showSuggestions, license_plate: true })}
                    placeholder="เช่น กข 1234 กรุงเทพ"
                  />
                  {showSuggestions.license_plate && suggestions.license_plate.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '2px solid #e2e8f0',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 10,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}>
                      {suggestions.license_plate.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectSuggestion('license_plate', item)}
                          style={{
                            padding: '12px 14px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                          onMouseLeave={(e) => e.target.style.background = 'white'}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>วันที่เข้าซ่อม *</label>
                <input
                  type="date"
                  required
                  value={formData.repair_date}
                  onChange={(e) => setFormData({ ...formData, repair_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ marginBottom: '12px', display: 'block', fontSize: '15px', fontWeight: '700' }}>
                  รายการอะไหล่ *
                </label>
                
                {formData.parts_list.map((part, index) => (
                  <div key={index} style={{ 
                    marginBottom: '20px', 
                    padding: '20px', 
                    background: '#f8fafc', 
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                        อะไหล่ที่ {index + 1}
                      </span>
                      {formData.parts_list.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '6px 14px', fontSize: '13px' }}
                          onClick={() => removePartRow(index)}
                        >
                          ลบ
                        </button>
                      )}
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '6px', display: 'block' }}>
                        ชื่ออะไหล่
                      </label>
                      <input
                        type="text"
                        required
                        list="parts-list"
                        value={part.part_name}
                        onChange={(e) => handlePartChange(index, 'part_name', e.target.value)}
                        onBlur={(e) => handlePartSelect(index, e.target.value)}
                        placeholder="พิมพ์หรือเลือกจาก stock"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '6px', display: 'block' }}>
                          ราคาทุน (บาท)
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={part.cost_price}
                          onChange={(e) => handlePartChange(index, 'cost_price', e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '6px', display: 'block' }}>
                          ราคาขาย (บาท)
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={part.sell_price}
                          onChange={(e) => handlePartChange(index, 'sell_price', e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <datalist id="parts-list">
                  {parts.map((part) => (
                    <option key={part.id} value={part.part_name} />
                  ))}
                </datalist>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addPartRow}
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  + เพิ่มอะไหล่
                </button>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-success">
                  {editingRepair ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RepairHistory;
