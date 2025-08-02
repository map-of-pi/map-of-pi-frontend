"use client";

import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';
import {
  createContext,
  useState,
  SetStateAction,
  ReactNode,
  useEffect
} from 'react';
import axiosClient, { setAuthToken } from '@/config/client';
import { onIncompletePaymentFound } from '@/config/payment';
import { AuthResult } from '@/constants/pi';
import { IUser } from '@/constants/types';

import logger from '../logger.config.mjs';
import { MembershipClassType } from '@/constants/membershipClassType';

interface IAppContextProps {
  currentUser: IUser | null;
  setCurrentUser: React.Dispatch<SetStateAction<IUser | null>>;
  userMembership: MembershipClassType;
  setUserMembership: React.Dispatch<SetStateAction<MembershipClassType>>;
  registerUser: () => void;
  autoLoginUser: () => void;
  isSigningInUser: boolean;
  reload: boolean;
  alertMessage: string | null;
  setAlertMessage: React.Dispatch<SetStateAction<string | null>>;
  showAlert: (message: string) => void;
  setReload: React.Dispatch<SetStateAction<boolean>>;
  isSaveLoading: boolean;
  setIsSaveLoading: React.Dispatch<SetStateAction<boolean>>;
  adsSupported: boolean;
}

const initialState: IAppContextProps = {
  currentUser: null,
  setCurrentUser: () => {},
  userMembership: MembershipClassType.CASUAL,
  setUserMembership: () => {},
  registerUser: () => {},
  autoLoginUser: () => {},
  isSigningInUser: false,
  reload: false,
  alertMessage: null,
  setAlertMessage: () => {},
  showAlert: () => {},
  setReload: () => {},
  isSaveLoading: false,
  setIsSaveLoading: () => {},
  adsSupported: false
};

export const AppContext = createContext<IAppContextProps>(initialState);

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const t = useTranslations();
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [userMembership, setUserMembership] = useState<MembershipClassType>(MembershipClassType.CASUAL);
  const [isSigningInUser, setIsSigningInUser] = useState(false);
  const [reload, setReload] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [adsSupported, setAdsSupported] = useState(false);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage(null); // Clear alert after 5 seconds
    }, 5000);
  };

  /* Register User via Pi SDK */
  const registerUser = async () => {
    logger.info('Starting user registration.');

    if (typeof window !== 'undefined' && window.Pi?.initialized) {
      try {
        setIsSigningInUser(true);
        const pioneerAuth: AuthResult = await window.Pi.authenticate([
          'username', 
          'payments', 
          'wallet_address'
        ], onIncompletePaymentFound);

        // Send accessToken to backend
        const res = await axiosClient.post(
          "/users/authenticate", 
          {}, // empty body
          {
            headers: {
              Authorization: `Bearer ${pioneerAuth.accessToken}`,
            },
          }
        );

        if (res.status === 200) {
          setAuthToken(res.data?.token);
          setCurrentUser(res.data.user);
          setUserMembership(res.data.membership_class);
          logger.info('User authenticated successfully.');
        } else {
          setCurrentUser(null);
          logger.error('User authentication failed.');
        }
      } catch (error) {
        logger.error('Error during user registration:', error);
      } finally {
        setTimeout(() => setIsSigningInUser(false), 2500);
      }
    } else {
      logger.error('PI SDK failed to initialize.');
    }
  };

  /* Attempt Auto Login (fallback to Pi auth) */
  const autoLoginUser = async () => {
    logger.info('Attempting to auto-login user.');
    try {
      setIsSigningInUser(true);
      const res = await axiosClient.get('/users/me');

      if (res.status === 200) {
        logger.info('Auto-login successful.');
        setCurrentUser(res.data.user);
        setUserMembership(res.data.membership_class);
      } else {
        logger.warn('Auto-login failed.');
        setCurrentUser(null);
      }
    } catch (error) {
      logger.error('Auto login unresolved; attempting Pi SDK authentication:', error);
      await registerUser();
    } finally {
      setTimeout(() => setIsSigningInUser(false), 2500);
    }
  };

  const loadPiSdk = (): Promise<typeof window.Pi> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      script.onload = () => resolve(window.Pi);
      script.onerror = () => reject(new Error('Failed to load Pi SDK'));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    logger.info('AppContextProvider mounted.');

    autoLoginUser();

    // attempt to load and initialize Pi SDK in parallel
    loadPiSdk()
      .then(Pi => {
        Pi.init({ version: '2.0', sandbox: process.env.NODE_ENV === 'development' });
        return Pi.nativeFeaturesList();
      })
      .then(features => setAdsSupported(features.includes("ad_network")))
      .catch(err => logger.error('Pi SDK load/ init error:', err));
  }, []);

  return (
    <AppContext.Provider 
      value={{ 
        currentUser, 
        setCurrentUser, 
        userMembership,
        setUserMembership,
        registerUser, 
        autoLoginUser, 
        isSigningInUser, 
        reload, 
        setReload, 
        showAlert, 
        alertMessage, 
        setAlertMessage, 
        isSaveLoading, 
        setIsSaveLoading, 
        adsSupported
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;