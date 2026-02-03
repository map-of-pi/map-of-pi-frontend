/**
 * AppContextProvider Logic Verification Suite
 * Using relative paths to ensure compatibility with Jest's module resolver.
 */

import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { AppContextProvider } from '../AppContextProvider';

/**
 * FIX: Using relative paths instead of '@/' alias to prevent module resolution errors.
 * This maintains compatibility with the existing CI/CD Jest environment.
 */
import { getOrders } from '../services/orderApi';
import { getNotifications } from '../services/notificationApi';

/**
 * Service Mocking
 * Isolating backend services to prevent actual network requests during CI/CD.
 */
jest.mock('../services/orderApi');
jest.mock('../services/notificationApi');
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('AppContextProvider Lifecycle Tests', () => {
  
  /**
   * Test: Backend Sync on Initialization
   * Verifies the core logic of fetching data from Pi Network backend services.
   */
  it('should initiate data fetching for orders and notifications upon mounting', async () => {
    // Setting up mock behavior for backend services
    (getOrders as jest.Mock).mockResolvedValue({ count: 10 });
    (getNotifications as jest.Mock).mockResolvedValue({ count: 5 });

    /**
     * Using React.createElement to bypass JSX parsing issues encountered in CI/CD.
     */
    render(
      React.createElement(
        AppContextProvider,
        null,
        React.createElement('div', null, 'Logic Test')
      )
    );

    // Verify that services are synchronized as per the app requirements
    await waitFor(() => {
      expect(getOrders).toHaveBeenCalled();
      expect(getNotifications).toHaveBeenCalled();
    });
  });

  /**
   * Test: Resilience and Error Handling
   * Ensures the application doesn't crash if the backend service returns an error.
   */
  it('should maintain stability and handle API rejection without crashing', async () => {
    (getOrders as jest.Mock).mockRejectedValue(new Error('Backend Sync Failed'));

    render(
      React.createElement(
        AppContextProvider,
        null,
        React.createElement('div', null, 'Resilience Test')
      )
    );

    await waitFor(() => {
      expect(getOrders).toHaveBeenCalled();
    });
  });
});
