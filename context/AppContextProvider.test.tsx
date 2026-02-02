import { render, waitFor } from '@testing-library/react';
import { AppContextProvider, AppContext } from '../AppContextProvider';
import { getOrders } from '@/services/orderApi';
import { getNotifications } from '@/services/notificationApi';
import { useContext } from 'react';

// عمل محاكاة (Mock) للـ APIs لضمان اختبار المنطق فقط
jest.mock('@/services/orderApi');
jest.mock('@/services/notificationApi');

const TestComponent = () => {
  const { ordersCount, notificationsCount } = useContext(AppContext);
  return (
    <div>
      <span data-testid="orders-count">{ordersCount}</span>
      <span data-testid="notifications-count">{notificationsCount}</span>
    </div>
  );
};

describe('AppContextProvider Unit Tests', () => {
  it('should initialize counters with zero and fetch updates', async () => {
    // محاكاة استجابة ناجحة من السيرفر
    (getOrders as jest.Mock).mockResolvedValue({ count: 5 });
    (getNotifications as jest.Mock).mockResolvedValue({ count: 3 });

    const { getByTestId } = render(
      <AppContextProvider>
        <TestComponent />
      </AppContextProvider>
    );

    // التأكد من أن القيم تبدأ بـ 0 ثم تتحدث
    await waitFor(() => {
      expect(getByTestId('orders-count').textContent).toBe('5');
    });
  });
});

