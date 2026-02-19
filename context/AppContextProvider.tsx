"use client";

import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';
import {
  createContext,
  useState,
  SetStateAction,
  ReactNode,
  useEffect,
  useRef
} from 'react';
import axiosClient, { setAuthToken } from '@/config/client';
import { onIncompletePaymentFound } from '@/config/payment';
import { AuthResult } from '@/constants/pi';
import { IUser, MembershipClassType } from '@/constants/types';
import { getNotifications } from '@/services/notificationApi';
import logger from '../logger.config.mjs';

const MAX_LOGIN_RETRIES = 3;
const BASE_DELAY_MS = 5000; // 5s → 15s → 45s

interface IAppContextProps {
  currentUser: IUser | null;
  setCurrentUser: React.Dispatch<SetStateAction<IUser | null>>;
  authenticateUser: () => void;
  userMembership: MembershipClassType;
  setUserMembership: React.Dispatch<SetStateAction<MembershipClassType>>;
  isSigningInUser: boolean;
  reload: boolean;
  alertMessage: string | null;
  setAlertMessage: React.Dispatch<SetStateAction<string | null>>;
  showAlert: (message: string) => void;
  setReload: React.Dispatch<SetStateAction<boolean>>;
  isSaveLoading: boolean;
  setIsSaveLoading: React.Dispatch<SetStateAction<boolean>>;
  adsSupported: boolean;
  toggleNotification: boolean;
  setToggleNotification: React.Dispatch<SetStateAction<boolean>>;
  setNotificationsCount: React.Dispatch<SetStateAction<number>>;
  notificationsCount: number;
};

const initialState: IAppContextProps = {
  currentUser: null,
  setCurrentUser: () => {},
  authenticateUser: () => {},
  isSigningInUser: false,
  userMembership: MembershipClassType.CASUAL,
  setUserMembership: () => {},
  reload: false,
  alertMessage: null,
  setAlertMessage: () => {},
  showAlert: () => {},
  setReload: () => {},
  isSaveLoading: false,
  setIsSaveLoading: () => {},
  adsSupported: false,
  toggleNotification: false,
  setToggleNotification: () => {},
  setNotificationsCount: () => {},
  notificationsCount: 0
};

/**
 * Utility: Sleep/Delay helper for exponential backoff.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Utility: Identifies critical authentication failures (401/403).
 * These errors signify that the server has explicitly rejected the credentials.
 */
const isHardFail = (err: any) => {
  const code = err?.response?.status || err?.status;
  return code === 401 || code === 403;
};

export const AppContext = createContext<IAppContextProps>(initialState);

interface AppContextProviderProps {
  children: ReactNode;
}

/**
 * AppContextProvider
 * The central state management hub for the Map of Pi application.
 * Manages Pi SDK initialization, multi-stage authentication, and global notifications.
 */
const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const t = useTranslations();
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [isSigningInUser, setIsSigningInUser] = useState(false);
  const [userMembership, setUserMembership] = useState<MembershipClassType>(MembershipClassType.CASUAL);
  const [reload, setReload] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [adsSupported, setAdsSupported] = useState(false);
  const [toggleNotification, setToggleNotification] = useState<boolean>(true);
  const [notificationsCount, setNotificationsCount] = useState(0);

  const piSdkLoaded = useRef(false);

  /**
   * Displays a global alert message that auto-clears.
   */
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage(null);
    }, 5000);
  };

  /* --- Pi SDK Orchestration --- */

  /**
   * Inject Pi SDK script into the document dynamically.
   */
  const loadPiSdk = (): Promise<typeof window.Pi> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return;
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      script.onload = () => resolve(window.Pi);
      script.onerror = () => reject(new Error('Failed to load Pi SDK'));
      document.head.appendChild(script);
    });
  };

  /**
   * Ensures the Pi SDK is loaded and initialized with the correct environment settings.
   */
  const ensurePiSdkLoaded = async () => {
    if (piSdkLoaded.current) return window.Pi;
    
    const Pi = await loadPiSdk();
    piSdkLoaded.current = true;

    Pi.init({
      version: '2.0',
      sandbox: process.env.NODE_ENV === 'development'
    });

    return Pi;
  };

  /* --- Authentication Logic --- */

  /**
   * Stage 1: Attempt to resume an existing session via JWT.
   */
  const autoLoginProcess = async (): Promise<boolean> => {
    try {
      const res = await axiosClient.get("/users/me");
      if (res.status === 200 && res.data?.user) {
        setCurrentUser(res.data.user);
        setUserMembership(res.data.membership_class || MembershipClassType.CASUAL);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  /**
   * Stage 2: Perform a fresh Pi SDK authentication and backend registration.
   */
  const piSdkLoginProcess = async (): Promise<boolean> => {
    try {
      const Pi = await ensurePiSdkLoaded();
      const pioneerAuth: AuthResult = await Pi.authenticate(
        ["username", "payments", "wallet_address"],
        onIncompletePaymentFound
      );

      // Exchange Pi AccessToken for a backend JWT
      const res = await axiosClient.post(
        "/users/authenticate",
        {},
        {
          headers: { Authorization: `Bearer ${pioneerAuth.accessToken}` },
        }
      );

      if (res.data?.token) {
        setAuthToken(res.data.token);
        setCurrentUser(res.data.user);
        setUserMembership(res.data.membership_class || MembershipClassType.CASUAL);
        return true;
      }
      return false;
    } catch (error: any) {
      if (isHardFail(error)) throw error; 
      return false;
    }
  };

  /**
   * Main Authentication Orchestrator
   * Implements a fallback strategy: Auto-login -> Pi SDK Login -> Exponential Retries.
   */
  const authenticateUser = async () => {
    if (isSigningInUser) return;

    setIsSigningInUser(true);
    logger.info("Starting authentication sequence...");

    try {
      // Step 1: Silent Auto-Login
      const autoLoggedIn = await autoLoginProcess();
      if (autoLoggedIn) {
        logger.info("Session resumed via auto-login.");
        return;
      }

      // Step 2: SDK Auth with Retry Logic
      for (let attempt = 0; attempt < MAX_LOGIN_RETRIES; attempt++) {
        try {
          const sdkLoggedIn = await piSdkLoginProcess();
          if (sdkLoggedIn) {
            logger.info("Pi SDK authentication successful.");
            return;
          }
        } catch (error: any) {
          if (isHardFail(error)) {
            logger.warn("Hard failure detected. Aborting auth sequence.");
            throw error;
          }
          logger.warn(`Auth attempt ${attempt + 1} soft failure:`, error);
        }
        
        // Step 3: Backoff & Jitter for network resilience
        const backoff = BASE_DELAY_MS * Math.pow(3, attempt);
        const jitter = Math.random() * 1000;
        const delay = backoff + jitter;
        logger.info(`Retrying auth in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
      
      logger.error("Authentication sequence exhausted all retries.");
    } catch (err) {
      logger.error("Authentication fatal error:", err);
    } finally {
      setIsSigningInUser(false);
    }
  };

  /**
   * Global Initialization: SDK Features and initial Auth.
   */
  useEffect(() => {
    if (currentUser) return;
    
    ensurePiSdkLoaded()
      .then(Pi => {
        Pi.nativeFeaturesList().then((features: string | string[]) => {
          setAdsSupported(features.includes("ad_network"));
        })
      })
      .catch(err => logger.error('Pi SDK load failure:', err));

    authenticateUser();
  }, [currentUser]);

  /**
   * Notification Management: Syncs unread counts with the UI.
   */
  useEffect(() => {
    if (!currentUser) return;

    const fetchNotificationsCount = async () => {
      try {
        const response = await getNotifications({
          skip: 0,
          limit: 1,
          status: 'uncleared'
        });
        
        // Defensive check for response structure
        const count = response?.count ?? 0;
        setNotificationsCount(count);
        setToggleNotification(count > 0);
      } catch (error) {
        logger.error('Notification sync failed:', error);
        setNotificationsCount(0);
        setToggleNotification(false);
      }
    };
  
    fetchNotificationsCount();
  }, [currentUser, reload]);

  return (
    <AppContext.Provider 
      value={{ 
        currentUser, 
        setCurrentUser, 
        authenticateUser, 
        isSigningInUser, 
        userMembership,
        setUserMembership,
        reload, 
        setReload, 
        showAlert, 
        alertMessage, 
        setAlertMessage, 
        isSaveLoading, 
        setIsSaveLoading, 
        adsSupported,
        toggleNotification,
        setToggleNotification,
        setNotificationsCount,
        notificationsCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
