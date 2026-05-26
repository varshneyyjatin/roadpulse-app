// Utility to save and load tab order - stored in localStorage in JSON format
// This persists across logout/login as localStorage is browser-specific

const STORAGE_KEY = 'app_tab_orders'; // Single key for all users

// Get all tab orders from storage
const getAllTabOrders = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

// Save all tab orders to storage
const saveAllTabOrders = (allOrders) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));
    return true;
  } catch {
    return false;
  }
};

// Save tab order for a specific user
export const saveTabOrder = (userId, tabOrder) => {
  try {
    const allOrders = getAllTabOrders();
    allOrders[userId] = {
      order: tabOrder,
      updatedAt: new Date().toISOString()
    };
    return saveAllTabOrders(allOrders);
  } catch {
    return false;
  }
};

// Load tab order for specific user
export const loadTabOrder = (userId) => {
  try {
    const allOrders = getAllTabOrders();
    return allOrders[userId]?.order || null;
  } catch {
    return null;
  }
};

// Delete tab order for a user (reset to default)
export const deleteTabOrder = (userId) => {
  try {
    const allOrders = getAllTabOrders();
    delete allOrders[userId];
    return saveAllTabOrders(allOrders);
  } catch {
    return false;
  }
};

// Export all tab orders as JSON file (for backup)
export const exportTabOrders = () => {
  try {
    const allOrders = getAllTabOrders();
    const blob = new Blob([JSON.stringify(allOrders, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tab_orders_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
};

// Import tab orders from JSON file
export const importTabOrders = (jsonData) => {
  try {
    const imported = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    return saveAllTabOrders(imported);
  } catch {
    return false;
  }
};
