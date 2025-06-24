// jest.setup.js
// Removed problematic import: react-native-gesture-handler/jestSetup
import '@testing-library/jest-native/extend-expect';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({}));

// Mock the expo modules that might cause issues in tests
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve())
}));

// Mock expo-location with Accuracy constants
const mockLocation = {
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  startLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
  stopLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
  hasStartedLocationUpdatesAsync: jest.fn(() => Promise.resolve(false)),
  watchPositionAsync: jest.fn(() => Promise.resolve({
    remove: jest.fn()
  })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 0,
      accuracy: 5,
      altitudeAccuracy: 5,
      heading: 0,
      speed: 0
    },
    timestamp: 1625097600000
  })),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6
  },
  GeofencingEventType: {
    Enter: 'enter',
    Exit: 'exit'
  },
  GeofencingRegionState: {
    Inside: 'inside',
    Outside: 'outside'
  }
};

// Add mock methods to the location functions
mockLocation.requestForegroundPermissionsAsync.mockResolvedValue = jest.fn(() => mockLocation.requestForegroundPermissionsAsync);
mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce = jest.fn(() => mockLocation.requestForegroundPermissionsAsync);
mockLocation.requestBackgroundPermissionsAsync.mockResolvedValue = jest.fn(() => mockLocation.requestBackgroundPermissionsAsync);
mockLocation.requestBackgroundPermissionsAsync.mockResolvedValueOnce = jest.fn(() => mockLocation.requestBackgroundPermissionsAsync);
mockLocation.startLocationUpdatesAsync.mockResolvedValue = jest.fn(() => mockLocation.startLocationUpdatesAsync);
mockLocation.startLocationUpdatesAsync.mockResolvedValueOnce = jest.fn(() => mockLocation.startLocationUpdatesAsync);
mockLocation.stopLocationUpdatesAsync.mockResolvedValue = jest.fn(() => mockLocation.stopLocationUpdatesAsync);
mockLocation.stopLocationUpdatesAsync.mockResolvedValueOnce = jest.fn(() => mockLocation.stopLocationUpdatesAsync);
mockLocation.hasStartedLocationUpdatesAsync.mockResolvedValue = jest.fn(() => mockLocation.hasStartedLocationUpdatesAsync);
mockLocation.hasStartedLocationUpdatesAsync.mockResolvedValueOnce = jest.fn(() => mockLocation.hasStartedLocationUpdatesAsync);
mockLocation.watchPositionAsync.mockResolvedValue = jest.fn(() => mockLocation.watchPositionAsync);
mockLocation.watchPositionAsync.mockResolvedValueOnce = jest.fn(() => mockLocation.watchPositionAsync);
mockLocation.getCurrentPositionAsync.mockResolvedValue = jest.fn(() => mockLocation.getCurrentPositionAsync);
mockLocation.getCurrentPositionAsync.mockResolvedValueOnce = jest.fn(() => mockLocation.getCurrentPositionAsync);

jest.mock('expo-location', () => mockLocation);

jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {
      Type: {
        back: 'back',
        front: 'front'
      },
      FlashMode: {
        on: 'on',
        off: 'off',
        auto: 'auto',
        torch: 'torch'
      }
    },
    requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' }))
  }
}));

const mockImagePicker = {
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{
      uri: 'test-uri',
      width: 100,
      height: 100,
      type: 'image',
      fileName: 'test-image.jpg'
    }]
  })),
  launchCameraAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{
      uri: 'test-uri',
      width: 100,
      height: 100,
      type: 'image',
      fileName: 'test-image.jpg'
    }]
  })),
  MediaTypeOptions: {
    Images: 'Images'
  }
};

mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue = jest.fn(() => mockImagePicker.requestMediaLibraryPermissionsAsync);
mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce = jest.fn(() => mockImagePicker.requestMediaLibraryPermissionsAsync);
mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue = jest.fn(() => mockImagePicker.requestCameraPermissionsAsync);
mockImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce = jest.fn(() => mockImagePicker.requestCameraPermissionsAsync);
mockImagePicker.launchImageLibraryAsync.mockResolvedValue = jest.fn(() => mockImagePicker.launchImageLibraryAsync);
mockImagePicker.launchImageLibraryAsync.mockResolvedValueOnce = jest.fn(() => mockImagePicker.launchImageLibraryAsync);
mockImagePicker.launchCameraAsync.mockResolvedValue = jest.fn(() => mockImagePicker.launchCameraAsync);
mockImagePicker.launchCameraAsync.mockResolvedValueOnce = jest.fn(() => mockImagePicker.launchCameraAsync);

jest.mock('expo-image-picker', () => mockImagePicker);

// Mock firebase
jest.mock('firebase/app', () => {
  const firebaseMock = {
    apps: [],
    initializeApp: jest.fn(() => {
      firebaseMock.apps.push({});
      return {};
    })
  };
  return firebaseMock;
});

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  signOut: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  })
}));

// Create mock functions with proper mock methods
const mockAddDoc = jest.fn(() => Promise.resolve({ id: 'test-doc-id' }));
mockAddDoc.mockResolvedValue = jest.fn(() => mockAddDoc);
mockAddDoc.mockResolvedValueOnce = jest.fn(() => mockAddDoc);
mockAddDoc.mockRejectedValue = jest.fn(() => mockAddDoc);
mockAddDoc.mockRejectedValueOnce = jest.fn(() => mockAddDoc);

const mockSetDoc = jest.fn(() => Promise.resolve());
mockSetDoc.mockResolvedValue = jest.fn(() => mockSetDoc);
mockSetDoc.mockResolvedValueOnce = jest.fn(() => mockSetDoc);
mockSetDoc.mockRejectedValue = jest.fn(() => mockSetDoc);
mockSetDoc.mockRejectedValueOnce = jest.fn(() => mockSetDoc);

// Create a mock updateDoc with better error handling support
const mockUpdateDoc = jest.fn();

// Default implementation returns a resolved promise
mockUpdateDoc.mockImplementation(() => Promise.resolve());

// Add a flag to control whether updateDoc should fail
mockUpdateDoc.shouldFail = false;
mockUpdateDoc.errorMessage = 'Mock update error';

// Helper function to make updateDoc fail on next call
mockUpdateDoc.failNextCall = (errorMessage = 'Link error') => {
  const originalImpl = mockUpdateDoc.mockImplementation;
  mockUpdateDoc.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
  return mockUpdateDoc;
};

mockUpdateDoc.mockResolvedValue = jest.fn(() => mockUpdateDoc);
mockUpdateDoc.mockResolvedValueOnce = jest.fn(() => mockUpdateDoc);
mockUpdateDoc.mockRejectedValue = jest.fn(() => mockUpdateDoc);
mockUpdateDoc.mockRejectedValueOnce = jest.fn(() => mockUpdateDoc);

const mockDeleteDoc = jest.fn(() => Promise.resolve());
mockDeleteDoc.mockResolvedValue = jest.fn(() => mockDeleteDoc);
mockDeleteDoc.mockResolvedValueOnce = jest.fn(() => mockDeleteDoc);
mockDeleteDoc.mockRejectedValue = jest.fn(() => mockDeleteDoc);
mockDeleteDoc.mockRejectedValueOnce = jest.fn(() => mockDeleteDoc);

const mockGetDoc = jest.fn(() => Promise.resolve({
  exists: jest.fn(() => true),
  data: jest.fn(() => ({
    id: 'test-doc-id',
    name: 'Test Document',
    amount: 100,
    category: 'Office',
    date: new Date(),
    description: 'Test description',
    profileId: 'profile-1',
    userId: 'user-1',
    isActive: true
  })),
  id: 'test-doc-id'
}));
mockGetDoc.mockResolvedValue = jest.fn(() => mockGetDoc);
mockGetDoc.mockResolvedValueOnce = jest.fn(() => mockGetDoc);
mockGetDoc.mockRejectedValue = jest.fn(() => mockGetDoc);
mockGetDoc.mockRejectedValueOnce = jest.fn(() => mockGetDoc);

// Create a mock getDocs that can be configured to fail in tests
const mockGetDocs = jest.fn();

// Default successful response
const mockDocsResponse = {
  docs: [
    {
      id: 'deduction-1',
      data: jest.fn(() => ({
        id: 'deduction-1',
        amount: 50,
        category: 'Office',
        date: new Date(),
        description: 'Office supplies',
        profileId: 'profile-1',
        userId: 'user-1',
        isActive: true
      })),
      exists: true,
      ref: {
        id: 'deduction-1',
        path: 'deductions/deduction-1'
      }
    },
    {
      id: 'deduction-2',
      data: jest.fn(() => ({
        id: 'deduction-2',
        amount: 75,
        category: 'Travel',
        date: new Date(),
        description: 'Gas expense',
        profileId: 'profile-1',
        userId: 'user-1',
        isActive: true
      })),
      exists: true,
      ref: {
        id: 'deduction-2',
        path: 'deductions/deduction-2'
      }
    }
  ],
  forEach: jest.fn(callback => {
    [{
      id: 'deduction-1',
      data: () => ({
        id: 'deduction-1',
        amount: 50,
        category: 'Office',
        date: new Date(),
        description: 'Office supplies',
        profileId: 'profile-1',
        userId: 'user-1',
        isActive: true
      }),
      exists: true
    }, {
      id: 'deduction-2',
      data: () => ({
        id: 'deduction-2',
        amount: 75,
        category: 'Travel',
        date: new Date(),
        description: 'Gas expense',
        profileId: 'profile-1',
        userId: 'user-1',
        isActive: true
      }),
      exists: true
    }].forEach(callback);
  }),
  empty: false,
  size: 2
};

// Set default implementation
mockGetDocs.mockImplementation(() => Promise.resolve(mockDocsResponse));

// Helper function to make getDocs fail on next call
mockGetDocs.failNextCall = (errorMessage = 'Query error') => {
  mockGetDocs.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
  return mockGetDocs;
};

// Helper function to return empty results
mockGetDocs.returnEmptyResults = () => {
  const emptyResponse = { ...mockDocsResponse, docs: [], empty: true, size: 0 };
  mockGetDocs.mockImplementationOnce(() => Promise.resolve(emptyResponse));
  return mockGetDocs;
};

// Helper function to return custom forEach implementation
mockGetDocs.withCustomForEach = (forEachFn) => {
  mockGetDocs.mockImplementationOnce(() => Promise.resolve({
    docs: [],
    forEach: forEachFn,
    empty: false,
    size: 0
  }));
  return mockGetDocs;
};
mockGetDocs.mockResolvedValue = jest.fn(() => mockGetDocs);
mockGetDocs.mockResolvedValueOnce = jest.fn(() => mockGetDocs);
mockGetDocs.mockRejectedValue = jest.fn(() => mockGetDocs);
mockGetDocs.mockRejectedValueOnce = jest.fn(() => mockGetDocs);

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  addDoc: mockAddDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  query: jest.fn(() => ({})),
  where: jest.fn(() => ({})),
  orderBy: jest.fn(() => ({})),
  limit: jest.fn(() => ({})),
  serverTimestamp: jest.fn(() => ({}))
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => {
      return React.createElement('View', { ...props, ref });
    })
  };
});

// Mock the async storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve())
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock MileageModule.locationSubscription
global.MileageModule = {
  locationSubscription: {
    remove: jest.fn()
  }
};

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
