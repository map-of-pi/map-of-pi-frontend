/**
 * AppContextProvider Logic Verification Suite
 * Professional testing approach for the Pi Network ecosystem synchronization logic.
 */

import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { AppContextProvider } from '../AppContextProvider';

/**
 * PATH CORRECTION: 
 * Navigating from './context/' to './services/' requires moving up one level.
 * This ensures the Jest resolver finds the backend API definitions correctly.
 */
import { getOrders } from '@/services/orderApi';
import { getNotifications } from '@/services/notificationApi';

/**
 * Service Mocking
 * Using string-based mocking to ensure absolute path resolution in CI/CD environments.
 */
jest.mock('@/services/orderApi', () => ({
  getOrders: jest.fn(),
}));
jest.mock('@/services/notificationApi', () => ({
  getNotifications: jest.fn(),
}));
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('AppContextProvider Lifecycle Tests', () => {
  
  /**
   * Test: Backend Sync on Initialization
   * Confirms that both Order and Notification services are invoked upon mounting.
   */
  it('should initiate data fetching for orders and notifications upon mounting', async () => {
    // Casting to jest.Mock to access mock methods safely
    const mockGetOrders = require('@/services/orderApi').getOrders;
    const mockGetNotifications = require('@/services/notificationApi').getNotifications;

    mockGetOrders.mockResolvedValue({ count: 10 });
    mockGetNotifications.mockResolvedValue({ count: 5 });

    /**
     * Using React.createElement to prevent JSX parsing issues in the runner.
     */
    render(
      React.createElement(
        AppContextProvider,
        null,
        React.createElement('div', null, 'Logic Sync Test')
      )
    );

    // Verify synchronization requirements
    await waitFor(() => {
      expect(mockGetOrders).toHaveBeenCalled();
      expect(mockGetNotifications).toHaveBeenCalled();
    });
  });

  /**
   * Test: Resilience Strategy
   * Ensures the provider handles backend rejections gracefully without crashing the UI.
   */
  it('should maintain application stability during API service rejections', async () => {
    const mockGetOrders = require('@/services/orderApi').getOrders;
    mockGetOrders.mockRejectedValue(new Error('Backend Offline'));

    render(
      React.createElement(
        AppContextProvider,
        null,
        React.createElement('div', null, 'Stability Test')
      )
    );

    await waitFor(() => {
      expect(mockGetOrders).toHaveBeenCalled();
    });
  });
});
