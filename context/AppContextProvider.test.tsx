/**
 * AppContextProvider Logic Verification Suite
 * This test suite focuses on the core business logic and API synchronization 
 * to ensure compatibility with the Pi Network ecosystem backend.
 */

import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { AppContextProvider } from '../AppContextProvider';
import { getOrders } from '@/services/orderApi';
import { getNotifications } from '@/services/notificationApi';

/**
 * Service Mocking
 * Isolating backend services to prevent actual network requests during CI/CD.
 */
jest.mock('@/services/orderApi');
jest.mock('@/services/notificationApi');
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('AppContextProvider Lifecycle Tests', () => {
  
  /**
   * Test: Backend Sync on Initialization
   * Ensures the provider triggers the necessary API calls for orders and notifications.
   */
  it('should initiate data fetching for orders and notifications upon mounting', async () => {
    // Setting up mock behavior for backend services
    (getOrders as jest.Mock).mockResolvedValue({ count: 10 });
    (getNotifications as jest.Mock).mockResolvedValue({ count: 5 });

    /**
     * Using React.createElement instead of JSX syntax to avoid 
     * Jest transformation errors (Unexpected token '<').
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
   * Verifies that the application remains stable even if a backend service fails.
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
