import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  serverTimestamp,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, DriverProfile, UserRole, AccountStatus, EBikeDevice } from '../types';
import { subscribeToEBikes, autoResolveRfidAssignment } from '../services/ebikeService';
import { sanitizeVehicleInfo } from '../utils/sanitizeVehicle';
import { logActivity } from '../services/activityLogService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  driverProfile: DriverProfile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signInAdmin: (email: string, pass: string) => Promise<void>;
  signUpCustomer: (fullName: string, email: string, phone: string, pass: string) => Promise<void>;
  signUpDriver: (
    fullName: string,
    email: string,
    phone: string,
    pass: string,
    vehicleType?: string,
    vehicleInfo?: string,
    driverLicenseCardUrl?: string,
    driverLicenseNumber?: string
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Sync auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserProfile(null);
        setDriverProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 1b. Global Real-time Hardware RFID Auto-Resolution Listener
  // Listens continually to E-Bikes and Drivers across the whole app so ESP32 physical RFID taps resolve instantly
  useEffect(() => {
    let globalBikes: EBikeDevice[] = [];
    let globalDrivers: DriverProfile[] = [];

    const checkAndResolve = () => {
      if (globalBikes.length > 0 && globalDrivers.length > 0) {
        globalBikes.forEach((bike) => {
          if (bike.lastRfidCardUid) {
            autoResolveRfidAssignment(bike, globalDrivers);
          }
        });
      }
    };

    const unsubBikes = subscribeToEBikes((bikes) => {
      globalBikes = bikes;
      checkAndResolve();
    });

    const driversRef = collection(db, 'drivers');
    const unsubDrivers = onSnapshot(
      driversRef,
      (snap) => {
        globalDrivers = snap.docs.map((d) => {
          const raw = d.data() as DriverProfile;
          return {
            ...raw,
            uid: d.id,
            vehicleInfo: sanitizeVehicleInfo(raw.vehicleInfo),
          };
        });
        checkAndResolve();
      },
      (err) => {
        if (err.code !== 'permission-denied') {
          console.error('Global driver snapshot error:', err);
        }
      }
    );

    return () => {
      unsubBikes();
      unsubDrivers();
    };
  }, []);

  // 2. Load user/driver profile and subscribe to updates
  useEffect(() => {
    if (!currentUser) {
      setUserProfile(null);
      setDriverProfile(null);
      setRole(null);
      setLoading(false);
      return;
    }

    let unsubProfile: (() => void) | null = null;
    let isCancelled = false;

    async function loadProfileAndSubscribe() {
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', currentUser!.uid);
        const userSnap = await getDoc(userDocRef);

        if (isCancelled) return;

        if (userSnap.exists()) {
          const uData = userSnap.data() as UserProfile;
          setUserProfile(uData);
          setRole(uData.role);
          setDriverProfile(null);
          setLoading(false);

          unsubProfile = onSnapshot(
            userDocRef,
            (snap) => {
              if (snap.exists()) {
                const updated = snap.data() as UserProfile;
                setUserProfile(updated);
                setRole(updated.role);
              }
            },
            (err) => {
              if (err.code !== 'permission-denied') {
                console.error('User listener error:', err);
              }
            }
          );
          return;
        }

        const driverDocRef = doc(db, 'drivers', currentUser!.uid);
        const driverSnap = await getDoc(driverDocRef);

        if (isCancelled) return;

        if (driverSnap.exists()) {
          const dData = driverSnap.data() as DriverProfile;
          const rawVehicle = dData.vehicleInfo || '';
          const cleanedVehicle = sanitizeVehicleInfo(rawVehicle);
          dData.vehicleInfo = cleanedVehicle;

          // Auto-migrate legacy document in Firestore if it contained 'fleet' or 'e-bike'
          if (
            rawVehicle.toLowerCase().includes('fleet') ||
            rawVehicle.toLowerCase().includes('e-bike')
          ) {
            updateDoc(driverDocRef, {
              vehicleInfo: cleanedVehicle,
              vehicleType: 'E-Shuttle Transit',
              updatedAt: serverTimestamp(),
            }).catch(() => {});
          }

          setDriverProfile(dData);
          setRole('driver');
          setUserProfile(null);
          setLoading(false);

          unsubProfile = onSnapshot(
            driverDocRef,
            (snap) => {
              if (snap.exists()) {
                const updated = snap.data() as DriverProfile;
                const snapCleaned = sanitizeVehicleInfo(updated.vehicleInfo);
                updated.vehicleInfo = snapCleaned;
                setDriverProfile(updated);
              }
            },
            (err) => {
              if (err.code !== 'permission-denied') {
                console.error('Driver listener error:', err);
              }
            }
          );
          return;
        }

        // Auto-provision admin user profile if logging in as admin@eshuttle.com
        if (currentUser?.email === 'admin@eshuttle.com') {
          const adminDoc: UserProfile = {
            uid: currentUser.uid,
            role: 'admin',
            fullName: 'Platform Administrator',
            email: currentUser.email,
            username: 'admin',
            phone: '+63 917 000 0000',
            accountStatus: 'APPROVED',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userDocRef, adminDoc);
          setUserProfile(adminDoc);
          setRole('admin');
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (err: any) {
        if (err?.code !== 'permission-denied' && !err?.message?.includes('permissions')) {
          console.error('Error fetching user context:', err);
        }
        if (!isCancelled) setLoading(false);
      }
    }

    loadProfileAndSubscribe();

    return () => {
      isCancelled = true;
      if (unsubProfile) {
        unsubProfile();
      }
    };
  }, [currentUser?.uid]);

  const resolveEmailFromIdentifier = async (identifier: string): Promise<string> => {
    const clean = identifier.trim().toLowerCase();
    if (clean.includes('@')) {
      return clean;
    }
    
    if (clean === 'admin') {
      return 'admin@eshuttle.com';
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', clean));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const uData = snap.docs[0].data();
        if (uData.email) return uData.email;
      }

      const driversRef = collection(db, 'drivers');
      const qD = query(driversRef, where('username', '==', clean));
      const snapD = await getDocs(qD);
      if (!snapD.empty) {
        const dData = snapD.docs[0].data();
        if (dData.email) return dData.email;
      }
    } catch (err) {
      console.warn('Username lookup error:', err);
    }

    if (clean.startsWith('admin')) {
      return 'admin@eshuttle.com';
    }

    return identifier;
  };

  const signIn = async (emailOrUsername: string, pass: string) => {
    setLoading(true);
    const resolvedEmail = await resolveEmailFromIdentifier(emailOrUsername);
    const res = await signInWithEmailAndPassword(auth, resolvedEmail, pass);
    logActivity({
      action: 'AUTH_LOGIN',
      actionLabel: 'User Signed In',
      entityType: 'AUTH',
      entityId: res.user.uid,
      entityName: resolvedEmail,
      summary: `User "${resolvedEmail}" logged into system`,
      performedBy: { uid: res.user.uid, name: res.user.displayName || resolvedEmail, email: resolvedEmail },
      severity: 'info',
    }).catch(() => {});
  };

  const signInAdmin = async (emailOrUsername: string, pass: string) => {
    setLoading(true);
    try {
      const resolvedEmail = await resolveEmailFromIdentifier(emailOrUsername);
      const res = await signInWithEmailAndPassword(auth, resolvedEmail, pass);
      const userDocRef = doc(db, 'users', res.user.uid);
      const userSnap = await getDoc(userDocRef);

      const isAdminEmail = res.user.email === 'admin@eshuttle.com' || resolvedEmail.trim().toLowerCase() === 'admin@eshuttle.com';
      const isRoleAdmin = userSnap.exists() && userSnap.data()?.role === 'admin';

      if (!isAdminEmail && !isRoleAdmin) {
        await firebaseSignOut(auth);
        setUserProfile(null);
        setDriverProfile(null);
        setRole(null);
        throw new Error('Access Denied: Account does not have administrator privileges.');
      }

      if (isAdminEmail && !userSnap.exists()) {
        const adminDoc: UserProfile = {
          uid: res.user.uid,
          role: 'admin',
          fullName: 'Platform Administrator',
          email: res.user.email || resolvedEmail,
          username: 'admin',
          phone: '+63 917 000 0000',
          accountStatus: 'APPROVED',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userDocRef, adminDoc);
        setUserProfile(adminDoc);
        setRole('admin');
      }

      logActivity({
        action: 'AUTH_LOGIN',
        actionLabel: 'Admin Signed In',
        entityType: 'AUTH',
        entityId: res.user.uid,
        entityName: resolvedEmail,
        summary: `Administrator "${resolvedEmail}" authenticated into Admin Console`,
        performedBy: { uid: res.user.uid, name: 'Platform Administrator', email: resolvedEmail, role: 'admin' },
        severity: 'info',
      }).catch(() => {});
    } catch (err) {
      setUserProfile(null);
      setDriverProfile(null);
      setRole(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpCustomer = async (
    fullName: string,
    email: string,
    phone: string,
    pass: string
  ) => {
    setLoading(true);
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const userDoc: UserProfile = {
      uid: res.user.uid,
      role: 'customer',
      fullName,
      email,
      phone,
      accountStatus: 'APPROVED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', res.user.uid), userDoc);
    setUserProfile(userDoc);
    setRole('customer');
    setLoading(false);

    logActivity({
      action: 'AUTH_REGISTER',
      actionLabel: 'Registered Passenger Account',
      entityType: 'USER',
      entityId: res.user.uid,
      entityName: fullName,
      summary: `New passenger registered: "${fullName}" (${email})`,
      details: {
        summary: `Customer registered account with phone ${phone}`,
        after: { uid: res.user.uid, fullName, email, phone, role: 'customer' },
      },
      performedBy: { uid: res.user.uid, name: fullName, email, role: 'customer' },
      severity: 'success',
    }).catch(() => {});
  };

  const signUpDriver = async (
    fullName: string,
    email: string,
    phone: string,
    pass: string,
    vehicleType: string = 'E-Shuttle Transit',
    vehicleInfo: string = 'Unassigned E-Shuttle',
    driverLicenseCardUrl?: string,
    driverLicenseNumber?: string
  ) => {
    setLoading(true);
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const driverDoc: DriverProfile = {
      uid: res.user.uid,
      role: 'driver',
      fullName,
      email,
      phone,
      accountStatus: 'PENDING', // Drivers start as PENDING requiring Admin approval
      availability: 'OFFLINE',
      vehicleType,
      vehicleInfo,
      driverLicenseCardUrl: driverLicenseCardUrl || undefined,
      driverLicenseNumber: driverLicenseNumber || undefined,
      currentLocation: {
        latitude: 14.5547,
        longitude: 121.0244,
        address: 'Central E-Shuttle Hub',
      },
      activeBookingId: null,
      rating: 5.0,
      totalRides: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'drivers', res.user.uid), driverDoc);
    try {
      await deleteDoc(doc(db, 'users', res.user.uid));
    } catch {
      // ignore
    }
    setDriverProfile(driverDoc);
    setRole('driver');
    setLoading(false);

    logActivity({
      action: 'AUTH_REGISTER',
      actionLabel: 'Applied as Driver',
      entityType: 'DRIVER',
      entityId: res.user.uid,
      entityName: fullName,
      summary: `New driver registered application: "${fullName}" (${email}) - Pending Admin Verification`,
      details: {
        summary: `Driver application submitted with license ${driverLicenseNumber || 'N/A'}`,
        after: { uid: res.user.uid, fullName, email, phone, role: 'driver', accountStatus: 'PENDING' },
      },
      performedBy: { uid: res.user.uid, name: fullName, email, role: 'driver' },
      severity: 'warning',
    }).catch(() => {});
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    const prevUser = currentUser;
    const prevProfile = userProfile || driverProfile;
    setLoading(true);
    await firebaseSignOut(auth);
    setUserProfile(null);
    setDriverProfile(null);
    setRole(null);
    setLoading(false);

    if (prevUser) {
      logActivity({
        action: 'AUTH_LOGOUT',
        actionLabel: 'User Signed Out',
        entityType: 'AUTH',
        entityId: prevUser.uid,
        entityName: prevProfile?.fullName || prevUser.email || prevUser.uid,
        summary: `User "${prevProfile?.fullName || prevUser.email || prevUser.uid}" signed out of session`,
        performedBy: { uid: prevUser.uid, name: prevProfile?.fullName || 'User', email: prevUser.email || undefined },
        severity: 'info',
      }).catch(() => {});
    }
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    if (role === 'customer' || role === 'admin') {
      const uSnap = await getDoc(doc(db, 'users', currentUser.uid));
      if (uSnap.exists()) setUserProfile(uSnap.data() as UserProfile);
    } else if (role === 'driver') {
      const dSnap = await getDoc(doc(db, 'drivers', currentUser.uid));
      if (dSnap.exists()) setDriverProfile(dSnap.data() as DriverProfile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        driverProfile,
        role,
        loading,
        signIn,
        signInAdmin,
        signUpCustomer,
        signUpDriver,
        resetPassword,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
