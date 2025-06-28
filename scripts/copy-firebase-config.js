/**
 * Temporary script to copy Firebase configuration from src to scripts directory
 * This script extracts the Firebase config from your main app and creates a proper config file
 * for the reviewer account script
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the Firebase config from the main app
import * as firebaseModule from '../src/firebase.js';

// Find the Firebase config object
let configObject = null;
for (const key in firebaseModule) {
  // Look for an object with Firebase config properties
  if (typeof firebaseModule[key] === 'object' && 
      firebaseModule[key] !== null &&
      'apiKey' in firebaseModule[key] &&
      'authDomain' in firebaseModule[key] &&
      'projectId' in firebaseModule[key]) {
    configObject = firebaseModule[key];
    break;
  }
}

if (!configObject) {
  console.error('Could not find Firebase configuration in src/firebase.js');
  process.exit(1);
}

// Create the new config file content
const configFileContent = `/**
 * Firebase configuration for Deductly App
 * This file contains the configuration for connecting to Firebase services
 * Auto-generated from your main app configuration
 */

export const firebaseConfig = ${JSON.stringify(configObject, null, 2)};
`;

// Write to the firebase-config.js file
fs.writeFileSync(
  path.join(__dirname, 'firebase-config.js'),
  configFileContent,
  'utf8'
);

console.log('Firebase configuration successfully copied to scripts/firebase-config.js');
process.exit(0);
