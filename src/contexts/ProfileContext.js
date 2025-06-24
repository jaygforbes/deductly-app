import React, { createContext, useState, useContext, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const db = getFirestore();

  // Load profiles when user changes
  useEffect(() => {
    if (user) {
      fetchProfiles();
    } else {
      setProfiles([]);
      setActiveProfile(null);
      setIsLoading(false);
    }
  }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const profilesRef = collection(db, 'users', user.uid, 'profiles');
      const querySnapshot = await getDocs(profilesRef);
      
      const profilesList = [];
      querySnapshot.forEach((doc) => {
        profilesList.push({ id: doc.id, ...doc.data() });
      });
      
      setProfiles(profilesList);
      
      // Set active profile to the first one if none is active
      if (profilesList.length > 0 && !activeProfile) {
        setActiveProfile(profilesList[0]);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async (profileData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const profilesRef = collection(db, 'users', user.uid, 'profiles');
      const docRef = await addDoc(profilesRef, {
        ...profileData,
        createdAt: new Date(),
      });
      
      const newProfile = { id: docRef.id, ...profileData };
      setProfiles([...profiles, newProfile]);
      
      // If this is the first profile, set it as active
      if (profiles.length === 0) {
        setActiveProfile(newProfile);
      }
      
      return { success: true, profile: newProfile };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileId, profileData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const profileRef = doc(db, 'users', user.uid, 'profiles', profileId);
      await updateDoc(profileRef, {
        ...profileData,
        updatedAt: new Date(),
      });
      
      const updatedProfiles = profiles.map(profile => 
        profile.id === profileId ? { ...profile, ...profileData } : profile
      );
      
      setProfiles(updatedProfiles);
      
      // Update active profile if it was the one modified
      if (activeProfile && activeProfile.id === profileId) {
        setActiveProfile({ ...activeProfile, ...profileData });
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteProfile = async (profileId) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const profileRef = doc(db, 'users', user.uid, 'profiles', profileId);
      await deleteDoc(profileRef);
      
      const updatedProfiles = profiles.filter(profile => profile.id !== profileId);
      setProfiles(updatedProfiles);
      
      // If active profile was deleted, set a new active profile
      if (activeProfile && activeProfile.id === profileId) {
        setActiveProfile(updatedProfiles.length > 0 ? updatedProfiles[0] : null);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const setCurrentProfile = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setActiveProfile(profile);
      return true;
    }
    return false;
  };

  const value = {
    profiles,
    activeProfile,
    isLoading,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    setCurrentProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
