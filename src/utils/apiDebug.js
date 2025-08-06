import axios from 'axios';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

// Debug utility for API connectivity
export const debugApiConnectivity = async () => {
  const results = {
    config: {
      apiURL: publicRuntimeConfig.apiURL,
      env: publicRuntimeConfig.env
    },
    tests: []
  };

  console.log('🔍 Starting API Connectivity Debug...');
  console.log('Configuration:', results.config);

  // Test 1: Basic connectivity
  try {
    const response = await axios.get(publicRuntimeConfig.apiURL, { 
      timeout: 5000,
      validateStatus: () => true // Accept any status code
    });
    results.tests.push({
      name: 'Basic Connectivity',
      success: true,
      status: response.status,
      message: `Server responded with status ${response.status}`
    });
    console.log('✅ Basic connectivity test passed');
  } catch (error) {
    results.tests.push({
      name: 'Basic Connectivity',
      success: false,
      error: error.message,
      code: error.code
    });
    console.log('❌ Basic connectivity test failed:', error.message);
  }

  // Test 2: Health endpoints
  const healthEndpoints = ['/health', '/api/health', '/actuator/health'];
  for (const endpoint of healthEndpoints) {
    try {
      const response = await axios.get(`${publicRuntimeConfig.apiURL}${endpoint}`, { 
        timeout: 3000,
        validateStatus: () => true
      });
      results.tests.push({
        name: `Health Check: ${endpoint}`,
        success: true,
        status: response.status,
        message: `Endpoint ${endpoint} responded with status ${response.status}`
      });
      console.log(`✅ Health check ${endpoint} passed`);
    } catch (error) {
      results.tests.push({
        name: `Health Check: ${endpoint}`,
        success: false,
        error: error.message,
        code: error.code
      });
      console.log(`❌ Health check ${endpoint} failed:`, error.message);
    }
  }

  // Test 3: Asset categories endpoint
  try {
    const response = await axios.get(`${publicRuntimeConfig.apiURL}/api/asset-settings/categories`, { 
      timeout: 5000,
      validateStatus: () => true
    });
    results.tests.push({
      name: 'Asset Categories Endpoint',
      success: true,
      status: response.status,
      message: `Asset categories endpoint responded with status ${response.status}`
    });
    console.log('✅ Asset categories endpoint test passed');
  } catch (error) {
    results.tests.push({
      name: 'Asset Categories Endpoint',
      success: false,
      error: error.message,
      code: error.code
    });
    console.log('❌ Asset categories endpoint test failed:', error.message);
  }

  // Test 4: Authentication test (without token)
  try {
    const response = await axios.get(`${publicRuntimeConfig.apiURL}/api/asset-settings/categories`, { 
      timeout: 5000,
      validateStatus: () => true
    });
    results.tests.push({
      name: 'Authentication Test (No Token)',
      success: true,
      status: response.status,
      message: `Endpoint responded with status ${response.status} (may be unauthorized)`
    });
    console.log('✅ Authentication test passed (no token)');
  } catch (error) {
    results.tests.push({
      name: 'Authentication Test (No Token)',
      success: false,
      error: error.message,
      code: error.code
    });
    console.log('❌ Authentication test failed:', error.message);
  }

  console.log('📊 API Debug Results:', results);
  return results;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.debugApiConnectivity = debugApiConnectivity;
} 