import { 
  DeviceLocationType,
  FulfillmentType, 
  OrderItemStatus, 
  OrderStatusType, 
  SellerType, 
  StockLevelType
} from "@/constants/types";

export const getFindMeOptions = (t: (key: string) => string) => [
  {
    value: DeviceLocationType.Automatic,
    name: t('SIDE_NAVIGATION.FIND_ME_OPTIONS.PREFERRED_AUTO'),
  },
  {
    value: DeviceLocationType.GPS,
    name: t('SIDE_NAVIGATION.FIND_ME_OPTIONS.PREFERRED_DEVICE_GPS'),
  },
  {
    value: DeviceLocationType.SearchCenter,
    name: t('SIDE_NAVIGATION.FIND_ME_OPTIONS.PREFERRED_SEARCH_CENTER'),
  },
];

export const getStockLevelOptions = (t: (key: string) => string) => [
  {
    value: StockLevelType.available_1,
    name: t(
      'SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.STOCK_LEVEL_OPTIONS.AVAILABLE_1',
    ),
  },
  {
    value: StockLevelType.available_2,
    name: t(
      'SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.STOCK_LEVEL_OPTIONS.AVAILABLE_2',
    ),
  },
  {
    value: StockLevelType.available_3,
    name: t(
      'SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.STOCK_LEVEL_OPTIONS.AVAILABLE_3',
    ),
  },
  {
    value: StockLevelType.many,
    name: t(
      'SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.STOCK_LEVEL_OPTIONS.MANY',
    ),
  },
  {
    value: StockLevelType.made_to_order,
    name: t(
      'SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.STOCK_LEVEL_OPTIONS.MADE_TO_ORDER',
    ),
  },
  {
    value: StockLevelType.ongoing_service,
    name: t(
      'SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.STOCK_LEVEL_OPTIONS.ONGOING_SERVICE',
    ),
  },
  {
    value: StockLevelType.sold,
    name: t(
      'SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.STOCK_LEVEL_OPTIONS.SOLD',
    ),
  },
]

export const getSellerCategoryOptions = (t: (key: string) => string) => [
  {
    value: SellerType.active_seller,
    name: t(
      'SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_OPTIONS.ACTIVE_SELLER',
    ),
  },
  {
    value: SellerType.inactive_seller,
    name: t(
      'SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_OPTIONS.INACTIVE_SELLER',
    ),
  },
  {
    value: SellerType.test_seller,
    name: t(
      'SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_OPTIONS.TEST_SELLER',
    ),
  },
];

export const getFulfillmentMethodOptions = (t: (key: string) => string) => [
  {
    value: FulfillmentType.CollectionByBuyer,
    name: t('SCREEN.SELLER_REGISTRATION.FULFILLMENT_METHOD_TYPE.FULFILLMENT_METHOD_TYPE_OPTIONS.COLLECTION_BY_BUYER'),
  },
  {
    value: FulfillmentType.DeliveredToBuyer,
    name: t('SCREEN.SELLER_REGISTRATION.FULFILLMENT_METHOD_TYPE.FULFILLMENT_METHOD_TYPE_OPTIONS.DELIVERED_TO_BUYER'),
  },
];

export const translateSellerCategory = (category: string, t: (key: string) => string): string => {
  switch (category) {
    case SellerType.active_seller:
      return t('SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_OPTIONS.ACTIVE_SELLER');
    case SellerType.inactive_seller:
      return t('SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_OPTIONS.INACTIVE_SELLER');
    case SellerType.test_seller:
      return t('SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_OPTIONS.TEST_SELLER');
    default:
      return '';
  }
};

export const translateOrderStatusType = (status: string, t: (key: string) => string): string => {
  switch (status) {
    case OrderStatusType.Initialized:
      return t('SCREEN.SELLER_ORDER_FULFILLMENT.STATUS_TYPE.INITIALIZED');
    case OrderStatusType.Pending:
      return t('SCREEN.SELLER_ORDER_FULFILLMENT.STATUS_TYPE.PENDING');
    case OrderStatusType.Completed:
      return t('SCREEN.SELLER_ORDER_FULFILLMENT.STATUS_TYPE.COMPLETED');
    case OrderStatusType.Cancelled:
      return t('SCREEN.SELLER_ORDER_FULFILLMENT.STATUS_TYPE.CANCELED');
    default:
      return '';
  }
};

export const translateOrderItemStatusType = (status: string, t: (key: string) => string): string => {
  switch (status) {
    case OrderItemStatus.Refunded:
      return t('SCREEN.SELLER_ORDER_FULFILLMENT.STATUS_TYPE.REFUNDED');
    case OrderItemStatus.Fulfilled:
      return t('SCREEN.SELLER_ORDER_FULFILLMENT.STATUS_TYPE.FULFILLED');
    case OrderItemStatus.Pending:
      return t('SCREEN.SELLER_ORDER_FULFILLMENT.STATUS_TYPE.PENDING');
    default:
      return '';
  }
};