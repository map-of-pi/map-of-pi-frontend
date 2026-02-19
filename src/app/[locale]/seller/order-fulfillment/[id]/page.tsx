'use client';

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Forms/Buttons/Buttons";
import { Input, Select, TextArea } from "@/components/shared/Forms/Inputs/Inputs";
import Skeleton from "@/components/skeleton/skeleton"; // Added for consistent UX
import { OrderItemStatus, OrderItemType, OrderStatusType, PartialOrderType } from "@/constants/types";
import { fetchOrderById, updateOrderStatus, updateOrderItemStatus } from "@/services/orderApi";
import { resolveDate } from "@/utils/date";
import { 
  getFulfillmentMethodOptions, 
  translateSellerCategory 
} from "@/utils/translate";
import logger from '../../../../../../logger.config.mjs';

/**
 * OrderItemPage Component (Seller View)
 * Facilitates order fulfillment workflows, allowing sellers to update item and order statuses.
 * Hardened with null-safety and defensive data mapping for high-load environments.
 */
export default function OrderItemPage({ params, searchParams }: { params: { id: string }, searchParams: { seller_name: string, seller_type: string } }) {
  const HEADER = 'font-bold text-lg md:text-2xl';
  const SUBHEADER = 'font-bold mb-2';
  
  const locale = useLocale();
  const t = useTranslations();

  const orderId = params.id;
  const sellerName = searchParams.seller_name;
  const sellerType = searchParams.seller_type;

  const [currentOrder, setCurrentOrder] = useState<PartialOrderType | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemType[]>([]);
  const [buyerName, setBuyerName] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Fetches the order details upon component mount.
   * Ensures buyer information and order items are correctly mapped.
   */
  useEffect(() => {
    const getOrder = async (id: string) => {
      if (!id) return;
      try {
        setLoading(true);
        logger.info(`Fetching fulfillment data for Order ID: ${id}`);
        const data = await fetchOrderById(id);
        
        if (data && data.order) {
          setCurrentOrder(data.order);
          setOrderItems(data.orderItems || []);
          setBuyerName(data.pi_username || t('SHARED.UNKNOWN_PIONEER'));
          // Sync completion state based on order status
          if (data.order.status === OrderStatusType.Completed) {
            setIsCompleted(true);
          }
        } else {
          logger.warn(`No fulfillment data found for Order ID: ${id}`);
          setCurrentOrder(null);
          setOrderItems([]);
        }
      } catch (error) {
        logger.error('Critical failure in fetching order fulfillment details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getOrder(orderId);
  }, [orderId, t]);
  
  /**
   * Updates individual item status (Fulfilled, Refunded, Pending).
   * Implements optimistic UI updates for a seamless seller experience.
   */
  const handleFulfillment = async (itemId: string, status: OrderItemStatus) => {
    try {
      logger.info(`Initiating status update to ${status} for item: ${itemId}`);
      const updateItem = await updateOrderItemStatus(itemId, status);

      if (updateItem) {
        setOrderItems((prev) => 
          prev.map((item) => item._id === itemId ? { ...item, status: status } : item)
        );
        logger.info(`Successfully updated item ${itemId} to ${status}`);
      } else {
        logger.warn("Server rejected the order item status update.");
      }
    } catch (error) {
      logger.error(`Status update failure for item ${itemId}:`, error);
    }
  };

  /**
   * Finalizes the entire order status.
   * Locks the fulfillment actions upon successful completion.
   */
  const handleCompleted = async (status: OrderStatusType) => {
    try {
      logger.info(`Transitioning Order ${orderId} status to: ${status}`);
      const data = await updateOrderStatus(orderId, status);

      if (data && data.order) {
        setCurrentOrder(data.order);
        setOrderItems(data.orderItems || []);
        setBuyerName(data.pi_username || buyerName);
        setIsCompleted(true);
        logger.info(`Order ${orderId} successfully marked as ${status}`);
      } else {
        logger.warn("Server failed to finalize the order status.");
      }
    } catch (error) {
      logger.error(`Order completion failure for ID ${orderId}:`, error);
    }
  };

  const orderDateTime = resolveDate(currentOrder?.createdAt, locale);

  // Loading state feedback using standardized skeletons
  if (loading) {
    return <Skeleton type="seller_review" />;
  }

  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4 animate-fadeIn">
      <div className="text-center mb-5">
        <h3 className="text-gray-400 text-sm">{sellerName}</h3>
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

      {currentOrder && (
        <div className="relative outline outline-50 outline-gray-600 rounded-lg mb-7 shadow-sm">
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
                    type="text"
                    value={currentOrder.total_amount?.$numberDecimal?.toString() || "0"}
                    disabled={true}
                  />
                  <p className="text-gray-500 text-sm">π</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full mt-1">
              <div className="p-[10px] block rounded-xl border-[#BDBDBD] bg-gray-50 border-[2px] w-full">
                <label className="text-[14px] text-[#333333]">
                  {orderDateTime.date ? `${orderDateTime.date}, ${orderDateTime.time}` : t('SHARED.DATE_NOT_AVAILABLE')}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className={SUBHEADER}>
        {t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDERED_ITEMS_SUBHEADER')}
      </h2>

      <div className="overflow-x-auto p-2 mb-5 mt-3 flex gap-x-5">
        {orderItems && orderItems.length > 0 && orderItems.map((item, index) => (
          <div
            key={item._id || index}
            data-id={item._id}
            className={`relative flex-shrink-0 w-full outline outline-50 outline-gray-600 rounded-lg mb-7 transition-colors ${
              item.status === OrderItemStatus.Fulfilled || item.status === OrderItemStatus.Refunded ? 'bg-yellow-50' : 'bg-white'
            }`}
          >
            <div className="p-3">
              <div className="flex gap-x-4">
                <div className="flex-auto w-64">
                  <Input
                    label={t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.ITEM_LABEL') + ':'}
                    name="name"
                    type="text"
                    value={item.seller_item_id?.name || t('SHARED.ITEM_NOT_FOUND')}
                    disabled={true}
                  />
                </div>

                <div className="flex-auto w-32">
                  <div className="flex items-center gap-2">
                    <Input
                      label={t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PRICE_LABEL') + ':'}
                      name="price"
                      type="text"
                      value={item.subtotal?.$numberDecimal?.toString() || "0"}
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
                    value={item.seller_item_id?.description || ""}
                    disabled={true}
                    styles={{ maxHeight: '100px' }}
                  />
                </div>
                <div className="flex-auto w-32 gap-2">
                  <label className="block text-[17px] text-[#333333]">
                    {t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PHOTO') + ':'}
                  </label>
                  <div className="relative h-[100px] w-auto">
                    <Image
                      src={item.seller_item_id?.image || '/images/shared/placeholder.png'}
                      height={100}
                      width={100}
                      alt="product image"
                      className="h-[100px] w-auto object-cover rounded shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <label className="text-[17px] text-[#333333] mt-2 block font-medium">
                {t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.BUYING_QUANTITY_LABEL')}:
              </label>
              <div className="flex items-center gap-3 w-full mt-1">
                <input
                  name="quantity"
                  type="number"
                  value={item.quantity}
                  className="p-[10px] block rounded-xl border-[#BDBDBD] bg-gray-100 text-center border-[2px] max-w-[80px]"
                  disabled={true}
                />
                <Button
                  label={t('SHARED.RESET')}
                  styles={{ color: '#ffc153', width: '100%', fontSize: '12px' }}
                  disabled={isCompleted || !(item.status === OrderItemStatus.Fulfilled || item.status === OrderItemStatus.Refunded)}
                  onClick={() => handleFulfillment(item._id, OrderItemStatus.Pending)}
                />
                <Button
                  label={t('SHARED.REFUND')}
                  styles={{ color: '#ffc153', width: '100%', fontSize: '12px' }}
                  disabled={isCompleted || item.status === OrderItemStatus.Fulfilled || item.status === OrderItemStatus.Refunded}
                  onClick={() => handleFulfillment(item._id, OrderItemStatus.Refunded)}
                />
                <Button
                  label={t('SHARED.FULFILLED')}
                  styles={{ color: '#ffc153', width: '100%', fontSize: '12px' }}
                  disabled={isCompleted || item.status === OrderItemStatus.Fulfilled || item.status === OrderItemStatus.Refunded}
                  onClick={() => handleFulfillment(item._id, OrderItemStatus.Fulfilled)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fulfillment-meta-section">
        <h2 className={SUBHEADER}>{t('SCREEN.SELLER_REGISTRATION.FULFILLMENT_METHOD_TYPE.FULFILLMENT_METHOD_TYPE_LABEL')}</h2>
        <Select
          name="fulfillment_method"
          options={getFulfillmentMethodOptions(t)}
          value={currentOrder?.fulfillment_method || ""}
          disabled={true}
        />
        <h2 className={SUBHEADER}>{t('SCREEN.SELLER_REGISTRATION.SELLER_TO_BUYER_FULFILLMENT_INSTRUCTIONS_LABEL')}</h2>
        <TextArea
          name="fulfillment_description"
          value={currentOrder?.seller_fulfillment_description || ""}
          disabled
        />
        <h2 className={SUBHEADER}>{t('SCREEN.SELLER_REGISTRATION.BUYER_TO_SELLER_FULFILLMENT_DETAILS_LABEL')}</h2>
        <TextArea
          name="buying_details"
          value={currentOrder?.buyer_fulfillment_description || ""}
          disabled={true}
        />
        
        <div className="flex flex-col gap-y-4 mt-6">
          <Button
            label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_COMPLETED_LABEL')}
            disabled={isCompleted}
            styles={{
              color: '#ffc153',
              height: '45px',
              padding: '10px 20px',
              width: '100%',
              fontWeight: 'bold'
            }}
            onClick={() => handleCompleted(OrderStatusType.Completed)}
          />

          <Button
            label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_DISPATCHED_COLLECTED_LABEL')}
            styles={{
              color: '#ffc153',
              height: '45px',
              padding: '10px 20px',
              width: '100%',
              fontWeight: 'bold'
            }}
            disabled={isCompleted}
          />
        </div>
      </div>
    </div>
  );
}
