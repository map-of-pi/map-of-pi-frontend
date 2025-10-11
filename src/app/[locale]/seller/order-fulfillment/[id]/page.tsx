'use client';

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/shared/Forms/Buttons/Buttons";
import { Input, Select, TextArea } from "@/components/shared/Forms/Inputs/Inputs";
import { OrderItemStatus, OrderItemType, OrderStatusType, PartialOrderType } from "@/constants/types";
import { fetchOrderById, updateOrderStatus, updateOrderItemStatus, getOrders } from "@/services/orderApi";
import { resolveDate } from "@/utils/date";
import { 
  getFulfillmentMethodOptions, 
  translateSellerCategory 
} from "@/utils/translate";
import { AppContext } from '../../../../../../context/AppContextProvider';
import logger from '../../../../../../logger.config.mjs';

export default function OrderItemPage({ params, searchParams }: { params: { id: string }, searchParams: { seller_name: string, seller_type: string } }) {
  const HEADER = 'font-bold text-lg md:text-2xl';
  const SUBHEADER = 'font-bold mb-2';
  
  const locale = useLocale();
  const t = useTranslations();
  const { setOrdersCount } = useContext(AppContext);

  const orderId = params.id;
  const sellerName = searchParams.seller_name;
  const sellerType = searchParams.seller_type;

  const [currentOrder, setCurrentOrder] = useState<PartialOrderType | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemType[]>([]);
  const [buyerName, setBuyerName] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    const getOrder= async (id: string) => {
      try {
        const data = await fetchOrderById(id);
        if (data) {
          setCurrentOrder(data.order);
          setOrderItems(data.orderItems);
          setBuyerName(data.pi_username);
        } else {
          setCurrentOrder(null);
          setOrderItems([]);
          setBuyerName('');
        }
      } catch (error) {
        logger.error('Error fetching order item data:', error);
      }
    };
    
    getOrder(orderId);
  }, [orderId]);
  
  const handleFulfillment = async (itemId: string, status: OrderItemStatus) => {
    try {
      logger.info(`Updating order item status to ${status} with id: ${itemId}`);
      const updateItem = await updateOrderItemStatus(itemId, status);

      if (updateItem) {
        setOrderItems((prev) => {
          const updatedItems = prev.map((item) =>
            item._id === itemId ? { ...item, status: status } : item
          );
          return updatedItems;
        });
      } else {
        logger.warn("Failed to update order item status on the server.");
      }
    } catch (error) {
      logger.error(`Error updating order item status to ${status}:`, error);
    }
  };

  const handleCompleted = async (status: OrderStatusType) => {
    const prev = currentOrder;
    if (!prev) return;

    // Optimistic local update
    setIsCompleted(true);
    
    // If the previous status was Pending and now it's Completed, decrement the counter
    if (prev.status === OrderStatusType.Pending && status === OrderStatusType.Completed) {
      setOrdersCount((c) => Math.max(0, c - 1)); // optimistic badge update
    }

    try {
      logger.info(`Updating order status to ${status} with id: ${orderId}`);
      const data = await updateOrderStatus(orderId, status);

      if (data) {
        setCurrentOrder(data.order);
        setOrderItems(data.orderItems);
        setBuyerName(data.pi_username);

        // Background sync with BE (optional, to avoid drift)
        const { count } = await getOrders({ skip: 0, limit: 1, status: 'pending' });
        setOrdersCount(count);
      } else {
        logger.warn("Failed to update completed order on the server.");
        // Rollback if API fails
        setIsCompleted(false);
      }
    }
    catch (error) {
      logger.error(`Error updating order status to ${status}:`, error);
    }
  };

  const orderDateTime = resolveDate(currentOrder?.createdAt, locale);

  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4">
      <div className="text-center mb-5">
        <h3 className="text-gray-400 text-sm">
          {sellerName}
        </h3>
        <h1 className={HEADER}>
          {t('SCREEN.SELLER_ORDER_FULFILLMENT.SELLER_ORDER_FULFILLMENT_HEADER')}
        </h1>
        <p className="text-gray-400 text-sm">
          {translateSellerCategory(sellerType, t)}
        </p>
      </div>

      <h2 className={SUBHEADER}>
        {t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_SUBHEADER')}
      </h2>
      {currentOrder && <div className={`relative outline outline-50 outline-gray-600 rounded-lg mb-7`}
      >
        <div className="p-3">
          <div className="flex gap-x-4">
            <div className="flex-auto w-64">
              <Input
                label={t('SHARED.PIONEER_ID_LABEL')}
                name="name"
                type="text"
                value={buyerName}
                disabled={true}
              />
            </div>

            <div className="flex-auto w-32">
              <div className="flex items-center gap-2">
                <Input
                  label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.TOTAL_PRICE_LABEL')}
                  name="price"
                  type="number"
                  value={currentOrder.total_amount.$numberDecimal || currentOrder.total_amount.$numberDecimal.toString()}
                  disabled={true}
                />
                <p className="text-gray-500 text-sm">π</p>
              </div>
            </div>
          </div>
          <div>
          </div>
          <div className="flex items-center gap-4 w-full mt-1">
            <div
              className={`p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 focus:border-[#1d724b] border-[2px] w-full`}
            >
              {orderDateTime.date && (
                <label className="text-[14px] text-[#333333]">
                  {orderDateTime.date}, {orderDateTime.time}
                </label>
              )}
            </div>
          </div>
        </div>
      </div>}

      <h2 className={SUBHEADER}>
        {t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDERED_ITEMS_SUBHEADER')}
      </h2>
      <div className="overflow-x-auto p-2 mb-5 mt-3 flex gap-x-5">
        {orderItems && orderItems.length>0 && orderItems.map((item, index)=>(<div
          data-id={item._id}
          className={`relative outline outline-50 outline-gray-600 rounded-lg mb-7 ${
            item.status === OrderItemStatus.Fulfilled || item.status === OrderItemStatus.Refunded ? 
            'bg-yellow-100' : ''
          }`}
          key={index}
        >
          <div className="p-3">
            <div className="flex gap-x-4">
              <div className="flex-auto w-64">
                <Input
                  label={t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.ITEM_LABEL') + ':'}
                  name="name"
                  type="text"
                  value={item.seller_item_id.name}
                  disabled={true}
                />
              </div>

              <div className="flex-auto w-32">
                <div className="flex items-center gap-2">
                  <Input
                    label={t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PRICE_LABEL') + ':'}
                    name="price"
                    type="number"
                    value={item.subtotal.$numberDecimal || item.subtotal.$numberDecimal.toString()}
                    disabled={true}
                  />
                  <p className="text-gray-500 text-sm">π</p>
                </div>
              </div>
            </div>

            <div className="flex gap-x-4">
              <div className="flex-auto w-64">
                <TextArea
                  label={t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.DESCRIPTION_LABEL') + ':'}
                  name="description"
                  value={item.seller_item_id.description}
                  disabled={true}
                  styles={{ maxHeight: '100px' }}
                />
              </div>
              <div className="flex-auto w-32 gap-2">
                <label className="block text-[17px] text-[#333333]">
                  {t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PHOTO') + ':'}
                </label>
                <Image
                  src={item.seller_item_id.image || ''}
                  height={50}
                  width={50}
                  alt="image"
                  className={'h-[100px] w-auto'}
                />
              </div>
            </div>

            <label className="text-[18px] text-[#333333]">
              {t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.BUYING_QUANTITY_LABEL')}:
            </label>
            <div className="flex items-center gap-3 w-full mt-1">
              <div className="flex gap-2 items-center justify-between mr-2">
                <input
                  name="duration"
                  type="number"
                  value={item.quantity}
                  className="p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 text-center focus:border-[#1d724b] border-[2px] max-w-[100px]"
                  disabled={true}
                />
              </div>
              <Button
                label={t('SHARED.RESET')}
                styles={{
                  color: '#ffc153',
                  width: '100%',
                }}
                disabled={isCompleted || !(item.status === OrderItemStatus.Fulfilled || item.status === OrderItemStatus.Refunded)}
                onClick={() => handleFulfillment(item._id, OrderItemStatus.Pending)}
              />

              <Button
                label={t('SHARED.REFUND')}
                styles={{
                  color: '#ffc153',
                  width: '100%',
                }}
                disabled={item.status === OrderItemStatus.Fulfilled || item.status === OrderItemStatus.Refunded}
                onClick={() => handleFulfillment(item._id, OrderItemStatus.Refunded)}
              />
              <Button
                label={t('SHARED.FULFILLED')}
                styles={{
                  color: '#ffc153',
                  width: '100%',
                }}
                disabled={item.status===OrderItemStatus.Fulfilled || item.status===OrderItemStatus.Refunded}
                onClick={() => handleFulfillment(item._id, OrderItemStatus.Fulfilled)}
              />
            </div>
          </div>
        </div>
        ))}
      </div>
      <div>
        <h2 className={SUBHEADER}>{t('SCREEN.SELLER_REGISTRATION.FULFILLMENT_METHOD_TYPE.FULFILLMENT_METHOD_TYPE_LABEL')}</h2>
        <Select
          name="fulfillment_method"
          options={getFulfillmentMethodOptions(t)}
          value={currentOrder?.fulfillment_method}
          disabled={true}
        />
        <h2 className={SUBHEADER}>{t('SCREEN.SELLER_REGISTRATION.SELLER_TO_BUYER_FULFILLMENT_INSTRUCTIONS_LABEL')}</h2>
        <TextArea
          name="fulfillment_description"
          type="text"
          value={currentOrder?.seller_fulfillment_description}
          disabled
        />
        <h2 className={SUBHEADER}>{t('SCREEN.SELLER_REGISTRATION.BUYER_TO_SELLER_FULFILLMENT_DETAILS_LABEL')}</h2>
        <TextArea
          name="buying_details"
          value={currentOrder?.buyer_fulfillment_description}
        />
        <div className="flex flex-col gap-y-4">
          <Button
            label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_COMPLETED_LABEL')}
            disabled={isCompleted}
            styles={{
              color: '#ffc153',
              height: '40px',
              padding: '15px 20px',
              width:'100%'
            }}
            onClick={()=>handleCompleted(OrderStatusType.Completed)}
          />

          <Button
            label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_DISPATCHED_COLLECTED_LABEL')}
            styles={{
              color: '#ffc153',
              height: '40px',
              padding: '15px 20px',
              width:'100%'
            }}
          />
        </div>
      </div>
    </div>
  );
};
