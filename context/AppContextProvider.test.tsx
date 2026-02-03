/**
 * AppContextProvider Logic Tests
 * * This suite verifies the core synchronization logic between the AppContext 
 * and the Pi Network backend services (Orders and Notifications).
 */

import { render, waitFor } from '@testing-library/react';
import { AppContextProvider } from '../AppContextProvider';
import { getOrders } from '@/services/orderApi';
import { getNotifications } from '@/services/notificationApi';
import React from 'react';

/**
 * Mocking external dependencies to ensure isolated unit testing.
 * Prevents actual API calls and provides controlled responses for the test environment.
 */
jest.mock('@/services/orderApi');
jest.mock('@/services/notificationApi');

/**
 * Mocking next-intl to prevent translation loading issues during testing.
 */
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('AppContextProvider Unit Tests', () => {
  
  /**
   * Test Case: Verifies that the provider triggers data fetching on mount.
   * This aligns with the requirements of the order-counter feature.
   */
  it('should trigger backend synchronization for orders and notifications on mount', async () => {
    // Setting up mock resolved values to simulate successful API responses
    (getOrders as jest.Mock).mockResolvedValue({ count: 5 });
    (getNotifications as jest.Mock).mockResolvedValue({ count: 3 });

    /**
     * Minimalist wrapper component to test context initialization 
     * without introducing complex JSX syntax issues in the test runner.
     */
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      <AppContextProvider>{children}</AppContextProvider>
    );

    render(<TestWrapper><div>Sync Test</div></TestWrapper>);

    // Validating that the API services were called as expected during the component lifecycle
    await waitFor(() => {
      expect(getOrders).toHaveBeenCalled();
      expect(getNotifications).toHaveBeenCalled();
    });
  });

  /**
   * Test Case: Ensures graceful degradation if API services fail.
   */
  it('should handle API service failures gracefully without crashing', async () => {
    (getOrders as jest.Mock).mockRejectedValue(new Error('API Failure'));

    render(
      <AppContextProvider>
        <div>Resilience Test</div>
      </AppContextProvider>
    );

    await waitFor(() => {
      expect(getOrders).toHaveBeenCalled();
    });
  });
});
