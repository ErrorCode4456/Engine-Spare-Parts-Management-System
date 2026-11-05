// Mock API for development in browser (when not running in Electron)

let mockParts = [];
let mockRepairs = [];
let nextPartId = 1;
let nextRepairId = 1;

// Load from localStorage if available
if (typeof window !== 'undefined' && window.localStorage) {
  const savedParts = localStorage.getItem('mockParts');
  const savedRepairs = localStorage.getItem('mockRepairs');
  
  if (savedParts) {
    mockParts = JSON.parse(savedParts);
    nextPartId = Math.max(...mockParts.map(p => p.id), 0) + 1;
  }
  
  if (savedRepairs) {
    mockRepairs = JSON.parse(savedRepairs);
    nextRepairId = Math.max(...mockRepairs.map(r => r.id), 0) + 1;
  }
}

const saveParts = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('mockParts', JSON.stringify(mockParts));
  }
};

const saveRepairs = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('mockRepairs', JSON.stringify(mockRepairs));
  }
};

export const mockApi = {
  // Parts APIs
  getAllParts: async () => {
    return { success: true, data: mockParts };
  },

  addPart: async (part) => {
    const newPart = {
      ...part,
      id: nextPartId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockParts.push(newPart);
    saveParts();
    return { success: true, id: newPart.id };
  },

  updatePart: async (part) => {
    const index = mockParts.findIndex(p => p.id === part.id);
    if (index !== -1) {
      mockParts[index] = {
        ...part,
        updated_at: new Date().toISOString(),
      };
      saveParts();
      return { success: true };
    }
    return { success: false, error: 'Part not found' };
  },

  deletePart: async (id) => {
    const index = mockParts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockParts.splice(index, 1);
      saveParts();
      return { success: true };
    }
    return { success: false, error: 'Part not found' };
  },

  // Repairs APIs
  getAllRepairs: async () => {
    return { success: true, data: mockRepairs };
  },

  addRepair: async (repair) => {
    const totalCost = repair.parts_list.reduce((sum, p) => sum + parseFloat(p.cost_price), 0);
    const totalSell = repair.parts_list.reduce((sum, p) => sum + parseFloat(p.sell_price), 0);
    
    const newRepair = {
      ...repair,
      id: nextRepairId++,
      total_cost: totalCost,
      total_sell: totalSell,
      created_at: new Date().toISOString(),
    };
    mockRepairs.push(newRepair);
    saveRepairs();
    return { success: true, id: newRepair.id };
  },

  updateRepair: async (repair) => {
    const index = mockRepairs.findIndex(r => r.id === repair.id);
    if (index !== -1) {
      const totalCost = repair.parts_list.reduce((sum, p) => sum + parseFloat(p.cost_price), 0);
      const totalSell = repair.parts_list.reduce((sum, p) => sum + parseFloat(p.sell_price), 0);
      
      mockRepairs[index] = {
        ...repair,
        total_cost: totalCost,
        total_sell: totalSell,
      };
      saveRepairs();
      return { success: true };
    }
    return { success: false, error: 'Repair not found' };
  },

  deleteRepair: async (id) => {
    const index = mockRepairs.findIndex(r => r.id === id);
    if (index !== -1) {
      mockRepairs.splice(index, 1);
      saveRepairs();
      return { success: true };
    }
    return { success: false, error: 'Repair not found' };
  },
};
