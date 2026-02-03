/**
 * AppContextProvider Logic Verification Suite
 * Final path correction to ensure Jest finds the local provider and virtual services.
 */

import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

/**
 * PATH CORRECTION: 
 * Since this test is INSIDE the 'context' folder, we use './' 
 * to reference the AppContextProvider in the same directory.
 */
import { AppContextProvider } from './AppContextProvider';

/**
 * VIRTUAL MOCKING:
 * Decoupling from physical service files to ensure CI/CD stability.
 */
jest.mock('../services/orderApi', () => ({
  getOrders: jest.fn(() => Promise.resolve({ count: 0 }))
}), { virtual: true });

jest.mock('../services/notificationApi', () => ({
  getNotifications: jest.fn(() => Promise.resolve({ count: 0 }))
}), { virtual: true });

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}), { virtual: true });

describe('AppContextProvider Lifecycle Tests', () => {
  
  it('should initiate data fetching for orders and notifications upon mounting', async () => {
    const { getOrders } = require('../services/orderApi');
    const { getNotifications } = require('../services/notificationApi');

    getOrders.mockResolvedValue({ count: 10 });
    getNotifications.mockResolvedValue({ count: 5 });

    render(
      React.createElement(
        AppContextProvider,
        null,
        React.createElement('div', null, 'Logic Sync Test')
      )
    );

    await waitFor(() => {
      expect(getOrders).toHaveBeenCalled();
      expect(getNotifications).toHaveBeenCalled();
    });
  });

  it('should maintain application stability during API service rejections', async () => {
    const { getOrders } = require('../services/orderApi');
    mockGetOrders: getOrders.mockRejectedValue(new Error('Backend Offline'));

    render(
      React.createElement(
        AppContextProvider,
        null,
        React.createElement('div', null, 'Stability Test')
      )
    );

    await waitFor(() => {
      expect(getOrders).toHaveBeenCalled();
    });
  });
});
