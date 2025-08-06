// Asset ID Generator Utility
// Generates hierarchical asset IDs based on category and subcategory

// Sample subcategories mapping
export const SUBCATEGORIES = {
    'IT Equipment': [
        { code: 'LAP', name: 'Laptop' },
        { code: 'DES', name: 'Desktop' },
        { code: 'MON', name: 'Monitor' },
        { code: 'PRN', name: 'Printer' },
        { code: 'NET', name: 'Network Device' },
        { code: 'TAB', name: 'Tablet' },
        { code: 'PHO', name: 'Phone' }
    ],
    'Office Furniture': [
        { code: 'CHA', name: 'Chair' },
        { code: 'DES', name: 'Desk' },
        { code: 'CAB', name: 'Cabinet' },
        { code: 'SHE', name: 'Shelf' },
        { code: 'SOF', name: 'Sofa' },
        { code: 'TAB', name: 'Table' }
    ],
    'Vehicles': [
        { code: 'CAR', name: 'Car' },
        { code: 'VAN', name: 'Van' },
        { code: 'TRU', name: 'Truck' },
        { code: 'MOT', name: 'Motorcycle' }
    ],
    'Machinery': [
        { code: 'CNC', name: 'CNC Machine' },
        { code: 'LAT', name: 'Lathe' },
        { code: 'MILL', name: 'Milling Machine' },
        { code: 'DRI', name: 'Drill Press' }
    ]
};

// Category code mapping
export const CATEGORY_CODES = {
    'IT Equipment': 'IT',
    'Office Furniture': 'OF',
    'Vehicles': 'VEH',
    'Machinery': 'MAC',
    'Tools': 'TOOL',
    'Electronics': 'ELEC',
    'Appliances': 'APP'
};

/**
 * Generate asset ID based on category and subcategory
 * @param {string} category - Main category name
 * @param {string} subcategory - Subcategory name
 * @param {number} sequenceNumber - Current sequence number for this subcategory
 * @returns {string} Formatted asset ID
 */
export const generateAssetId = (category, subcategory, sequenceNumber = 1) => {
    const categoryCode = CATEGORY_CODES[category] || category.substring(0, 3).toUpperCase();
    const subcategoryCode = getSubcategoryCode(category, subcategory);
    
    // Format: [Category Code]-[Subcategory Code]-[Zero-padded sequence number]
    const formattedNumber = sequenceNumber.toString().padStart(4, '0');
    
    return `${categoryCode}-${subcategoryCode}-${formattedNumber}`;
};

/**
 * Get subcategory code from category and subcategory name
 * @param {string} category - Main category name
 * @param {string} subcategory - Subcategory name
 * @returns {string} Subcategory code
 */
export const getSubcategoryCode = (category, subcategory) => {
    const categorySubcategories = SUBCATEGORIES[category] || [];
    const found = categorySubcategories.find(sub => 
        sub.name.toLowerCase() === subcategory.toLowerCase()
    );
    
    if (found) {
        return found.code;
    }
    
    // Fallback: use first 3 characters of subcategory name
    return subcategory.substring(0, 3).toUpperCase();
};

/**
 * Get available subcategories for a category
 * @param {string} category - Main category name
 * @returns {Array} Array of subcategory objects with code and name
 */
export const getSubcategoriesForCategory = (category) => {
    return SUBCATEGORIES[category] || [];
};

/**
 * Get category code for a category name
 * @param {string} category - Main category name
 * @returns {string} Category code
 */
export const getCategoryCode = (category) => {
    return CATEGORY_CODES[category] || category.substring(0, 3).toUpperCase();
};

/**
 * Parse asset ID to extract components
 * @param {string} assetId - Asset ID to parse
 * @returns {Object} Parsed components
 */
export const parseAssetId = (assetId) => {
    const parts = assetId.split('-');
    if (parts.length >= 3) {
        return {
            categoryCode: parts[0],
            subcategoryCode: parts[1],
            sequenceNumber: parseInt(parts[2])
        };
    }
    return null;
};

/**
 * Get next sequence number for a subcategory
 * This would typically query the database for the highest sequence number
 * @param {string} category - Main category name
 * @param {string} subcategory - Subcategory name
 * @param {Array} existingAssets - Array of existing assets for this subcategory
 * @returns {number} Next sequence number
 */
export const getNextSequenceNumber = (category, subcategory, existingAssets = []) => {
    const subcategoryCode = getSubcategoryCode(category, subcategory);
    const categoryCode = getCategoryCode(category);
    
    // Filter assets for this specific subcategory
    const relevantAssets = existingAssets.filter(asset => {
        const parsed = parseAssetId(asset.assetId);
        return parsed && parsed.categoryCode === categoryCode && parsed.subcategoryCode === subcategoryCode;
    });
    
    if (relevantAssets.length === 0) {
        return 1;
    }
    
    // Get the highest sequence number and add 1
    const maxSequence = Math.max(...relevantAssets.map(asset => {
        const parsed = parseAssetId(asset.assetId);
        return parsed ? parsed.sequenceNumber : 0;
    }));
    
    return maxSequence + 1;
};

/**
 * Validate asset ID format
 * @param {string} assetId - Asset ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidAssetIdFormat = (assetId) => {
    const pattern = /^[A-Z]{2,4}-[A-Z]{2,4}-\d{4}$/;
    return pattern.test(assetId);
}; 