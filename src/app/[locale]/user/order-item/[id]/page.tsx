'use client';

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Input, Select, TextArea } from "@/components/shared/Forms/Inputs/Inputs";
import Skeleton from "@/components/skeleton/skeleton";
import { 
  OrderItemStatus, 
  OrderItemType, 
  PartialOrderType 
} from "@/constants/types";
import { fetchOrderById } from "@/services/orderApi";
import { resolveDate } from "@/utils/date";
import { 
  getFulfillmentMethodOptions, 
  translateOrderItemStatusType, 
  translateOrderStatusType 
} from "@/utils/translate";
import logger from '../../../../../../logger.config.mjs';

export default function ReviewOrderItemPage({ params, searchParams }: { params: { id: string }, searchParams: { user_name: string, seller_type: string } }) {
  const HEADER = 'font-bold text-lg md:text-2xl';
  const SUBHEADER = 'font-bold mb-2';
  
  const locale = useLocale();
  const t = useTranslations();

  const orderId = params.id;
  const buyerName = searchParams.user_name;

  const [currentOrder, setCurrentOrder] = useState<PartialOrderType | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemType[]>([]);
  const [sellerName, setSellerName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getOrder= async (id: string) => {
      try {
        setLoading(true);
        const data = await fetchOrderById(id);
        if (data) {
          setCurrentOrder(data.order);
          setOrderItems(data.orderItems);
          setSellerName(data.order.seller_id.name);
        } else {
          setCurrentOrder(null);
          setOrderItems([]);
          setSellerName('');
        }
      } catch (error) {
        logger.error('Error fetching order items data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getOrder(orderId);
  }, [orderId]);

  const orderDateTime = resolveDate(currentOrder?.createdAt, locale);

  // loading condition
  if (loading) {
    logger.info('Loading seller data..');
    return (
      <Skeleton type="seller_review" />
    );
  }

  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4">
      <div className="text-center mb-5">
        <h3 className="text-gray-400 text-sm">
          {buyerName}
        </h3>
        <h1 className={HEADER}>
          {t('SCREEN.SELLER_ORDER_FULFILLMENT.VIEW_ORDER_HEADER')}
        </h1>
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
                label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.SELLER_LABEL') + ':'}
                name="name"
                type="text"
                value={sellerName}
                disabled={true}
              />
            </div>

            <div className="flex-auto w-32">
              <div className="flex items-center gap-2">
                <Input
                  label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.TOTAL_PRICE_LABEL') + ':'}
                  name="Total price"
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
          <div className="flex gap-x-4 w-full mt-1">
            <div className="flex-auto w-64">
              <label className="block text-[17px] text-[#333333] mb-1">
                {t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.TIME_OF_ORDER_LABEL') + ':'}
              </label>
              <div
                className={`p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 focus:border-[#1d724b] border-[2px] w-full mb-2`}
              >
                {orderDateTime.date && (
                  <label className="text-[14px] text-[#333333]">
                    {orderDateTime.date}, {orderDateTime.time}
                  </label>
                )}
              </div>
            </div>
            <div className="flex-auto w-32">
              <Input
                label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.STATUS_LABEL') + ':'}
                name="status"
                type="text"
                value={translateOrderStatusType(currentOrder.status, t) || t('SCREEN.SELLER_ORDER_FULFILLMENT.STATUS_TYPE.PENDING')}
                disabled={true}
              />
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
            item.status === OrderItemStatus.Fulfilled || item.status === OrderItemStatus.Refunded? 
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

            <div className="flex items-center gap-x-5 w-full mt-2">
              <div className="flex-auto w-64 mr-2">
                <Input
                  label={t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.BUYING_QUANTITY_LABEL') + ':'}
                  name="quantity"
                  type="number"
                  value={item.quantity}
                  className="p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 text-center focus:border-[#1d724b] border-[2px] max-w-[100px]"
                  disabled={true}
                />
                
              </div> 
              <div className="flex-auto w-32">
                <Input
                  label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.STATUS_LABEL') + ':'}
                  name="Status"
                  type="text"
                  value={translateOrderItemStatusType(item.status, t)}
                  className="p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 text-center focus:border-[#1d724b] border-[2px] max-w-[100px]"
                  disabled={true}
                />
              </div>
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
      </div>
    </div>
  );
};
