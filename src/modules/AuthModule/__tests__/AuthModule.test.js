import AuthModule from '../index';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';

// Mock Firebase and SecureStore
jest.mock('firebase/auth');
jest.mock('expo-secure-store');

describe('AuthModule', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      // Mock successful sign in
      const mockUserCredential = {
        user: { uid: 'test-user-id' }
      };
      signInWithEmailAndPassword.mockResolvedValueOnce(mockUserCredential);
      SecureStore.setItemAsync.mockResolvedValueOnce(undefined);

      const result = await AuthModule.signIn('test@example.com', 'password123');

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('userToken', 'test-user-id');
      expect(result).toEqual({
        success: true,
        user: mockUserCredential.user
      });
    });

    it('should return error when sign in fails', async () => {
      // Mock failed sign in
      const mockError = new Error('Invalid credentials');
      signInWithEmailAndPassword.mockRejectedValueOnce(mockError);

      const result = await AuthModule.signIn('test@example.com', 'wrongpassword');

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'wrongpassword'
      );
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: mockError.message
      });
    });
  });

  describe('signUp', () => {
    it('should create account successfully with valid credentials', async () => {
      // Mock successful sign up
      const mockUserCredential = {
        user: { uid: 'new-user-id' }
      };
      createUserWithEmailAndPassword.mockResolvedValueOnce(mockUserCredential);
      SecureStore.setItemAsync.mockResolvedValueOnce(undefined);

      const result = await AuthModule.signUp('new@example.com', 'newpassword123');

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'new@example.com',
        'newpassword123'
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('userToken', 'new-user-id');
      expect(result).toEqual({
        success: true,
        user: mockUserCredential.user
      });
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      // Mock successful password reset
      sendPasswordResetEmail.mockResolvedValueOnce(undefined);

      const result = await AuthModule.resetPassword('test@example.com');

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com'
      );
      expect(result).toEqual({
        success: true
      });
    });
  });
});
