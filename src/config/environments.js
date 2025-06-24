/**
 * Environment-specific configuration for Deductly
 */

const ENV = {
  dev: {
    apiUrl: 'https://dev-api.deductly.com',
    firebaseConfig: {
      // These values should be replaced with your actual Firebase config
      apiKey: "YOUR_DEV_API_KEY",
      authDomain: "dev-deductly.firebaseapp.com",
      projectId: "dev-deductly",
      storageBucket: "dev-deductly.appspot.com",
      messagingSenderId: "YOUR_DEV_SENDER_ID",
      appId: "YOUR_DEV_APP_ID",
      measurementId: "YOUR_DEV_MEASUREMENT_ID"
    },
    enableAnalytics: false,
    logLevel: 'debug',
    tesseractConfig: {
      cacheDir: 'tessdata-dev',
      langPath: 'eng',
    }
  },
  staging: {
    apiUrl: 'https://staging-api.deductly.com',
    firebaseConfig: {
      // These values should be replaced with your actual Firebase config
      apiKey: "YOUR_STAGING_API_KEY",
      authDomain: "staging-deductly.firebaseapp.com",
      projectId: "staging-deductly",
      storageBucket: "staging-deductly.appspot.com",
      messagingSenderId: "YOUR_STAGING_SENDER_ID",
      appId: "YOUR_STAGING_APP_ID",
      measurementId: "YOUR_STAGING_MEASUREMENT_ID"
    },
    enableAnalytics: true,
    logLevel: 'warning',
    tesseractConfig: {
      cacheDir: 'tessdata-staging',
      langPath: 'eng',
    }
  },
  prod: {
    apiUrl: 'https://api.deductly.com',
    firebaseConfig: {
      // These values should be replaced with your actual Firebase config
      apiKey: "YOUR_PROD_API_KEY",
      authDomain: "deductly.firebaseapp.com",
      projectId: "deductly",
      storageBucket: "deductly.appspot.com",
      messagingSenderId: "YOUR_PROD_SENDER_ID",
      appId: "YOUR_PROD_APP_ID",
      measurementId: "YOUR_PROD_MEASUREMENT_ID"
    },
    enableAnalytics: true,
    logLevel: 'error',
    tesseractConfig: {
      cacheDir: 'tessdata',
      langPath: 'eng',
    }
  }
};

// Default to dev if not specified
const getEnvVars = (env = process.env.NODE_ENV || 'dev') => {
  // For production builds from Expo / EAS
  if (env === 'production') {
    return ENV.prod;
  }
  
  if (env === 'staging') {
    return ENV.staging;
  }
  
  return ENV.dev;
};

export default getEnvVars;
