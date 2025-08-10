// ========================
// USER MODELS
// ========================
export enum DeviceLocationType {
  Automatic = 'auto',
  GPS = 'deviceGPS',
  SearchCenter = 'searchCenter'
};

export interface IUser {
  pi_uid: string;
  pi_username: string;
  user_name: string;
};

export interface IUserSettings {
  user_settings_id?: string | null;
  user_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  image?: string; 
  findme?: string;
  trust_meter_rating: number;
  search_map_center?: {
    type: 'Point';
    coordinates: [number, number];
  };
  search_filters?: {
    include_active_sellers: boolean | undefined;
    include_inactive_sellers: boolean | undefined;
    include_test_sellers: boolean | undefined;
    include_trust_level_100: boolean | undefined;
    include_trust_level_80: boolean | undefined;
    include_trust_level_50: boolean | undefined;
    include_trust_level_0: boolean | undefined;
  };
};

// Select specific fields from IUserSettings
export type PartialUserSettings = Pick<IUserSettings, 'user_name' | 'email' | 'phone_number' | 'findme' | 'trust_meter_rating'>;

// ========================
// MEMBERSHIP MODELS
// ========================
type MembershipPaymentMetadataType = {
  membership_id: string
};

// ========================
// SELLER MODELS
// ========================
export enum FulfillmentType {
  CollectionByBuyer = 'Collection by buyer',
  DeliveredToBuyer = 'Delivered to buyer'
};

export enum StockLevelType {
  available_1 = '1 available', 
  available_2 = '2 available', 
  available_3 = '3 available',
  many = 'Many available', 
  made_to_order = 'Made to order', 
  ongoing_service = 'Ongoing service', 
  sold = 'Sold'
};

export interface ISeller {
  seller_id: string;
  name: string;
  description: string;
  seller_type: string;
  image: string;
  address: string;
  average_rating: {
    $numberDecimal: string;
  };
  sell_map_center: {
    type: 'Point';
    coordinates: [number, number];
  };
  coordinates: [number, number];
  order_online_enabled_pref: boolean;
  fulfillment_method: FulfillmentType;
  fulfillment_description?: string;
  isRestricted: boolean;
};

export enum SellerType {
  active_seller = 'activeSeller', 
  inactive_seller = 'inactiveSeller', 
  test_seller = 'testSeller',
};

// Combined interface representing a seller with selected user settings
export interface ISellerWithSettings extends ISeller, PartialUserSettings {}

export type SellerItem = {
  _id: string;
  seller_id: string;
  name: string;
  description?: string;
  duration: number;
  stock_level: StockLevelType;
  image?: string;
  price: {
    $numberDecimal: string;
  };
  created_at?: Date;
  updated_at?: Date;
  expired_by?: Date;
};

export type ShopItemData = {
  _id: string;
  seller_id: string;
  name: string;
  description?: string;
  duration: number;
  stock_level: StockLevelType;
  image?: string;
  price:  string;
  created_at?: Date;
  updated_at?: Date;
  expired_by?: Date;
};

// ========================
// REVIEW / FEEDBACK MODELS
// ========================
export interface IReviewFeedback {
  _id: string;
  review_receiver_id: string;
  review_giver_id: string;
  reply_to_review_id: string | null;
  rating: number;
  comment: string;
  image: string;
  review_date: string;
};

export interface ReviewInt {
  heading: string;
  date: string;
  time: string;
  giver: string;
  receiver: string;
  reviewId: string;
  receiverId: string;
  giverId: string;
  reaction: string;
  unicode: string;
  image: string;
};

export type PartialReview = {
  giver: string;
  receiver: string;
};

export interface IReviewOutput extends IReviewFeedback, PartialReview {}

// ========================
// ORDER MODELS
// ========================
export enum OrderStatusType {
  Initialized = 'initialized',
  Pending = 'pending',
  Completed = 'completed', 
  Cancelled = 'cancelled'
};

export enum OrderItemStatus { 
  Refunded = 'refunded',
  Fulfilled = "fulfilled",
  Pending = 'pending',
};

export interface OrderType {
  _id: string;
  buyer_id: {
    pi_username: string
  };
  seller_id: {
    name: string
  };
  payment_id: string;
  total_amount: {$numberDecimal: number};
  status: OrderStatusType;
  is_paid: boolean;
  is_fulfilled: boolean;
  fulfillment_method: FulfillmentType | undefined,
  seller_fulfillment_description:string | undefined,
  buyer_fulfillment_description: string
  createdAt?: Date;
  updatedAt?: Date;
};

export interface PartialOrderType extends Pick<OrderType, '_id' | 'buyer_id' | 'seller_id'| 'total_amount' | 'createdAt' |  'status' | 'fulfillment_method' | 'seller_fulfillment_description' | 'buyer_fulfillment_description' > {};

export interface OrderItemType {
  _id: string;
  order: string;
  seller_item_id: SellerItem;
  quantity: number;
  subtotal: {$numberDecimal: number};
  status: OrderItemStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface PickedItems {
  itemId: string,
  quantity: number,
};

// ========================
// PAYMENT MODELS
// ========================
export enum PaymentType {
  Membership = 'Membership', 
  BuyerCheckout = 'Buyer Checkout'
};

export enum U2UPaymentStatus {
  Pending = 'Pending', 
  U2ACompleted = 'U2A Completed',
  U2AFailed = 'U2A Failed',
  A2UCompleted = 'A2U Completed',
  A2UFailed = 'A2U Failed',
  Completed = 'Completed'
};

export type OrderPaymentMetadataType = {
  items: PickedItems[],
  buyer: string,
  seller: string,
  fulfillment_method: FulfillmentType | undefined,
  seller_fulfillment_description:string | undefined,
  buyer_fulfillment_description: string
};

export type PaymentDataType = {
  amount: number;
  memo: string;
  metadata: {
    payment_type: PaymentType,
    OrderPayment?: OrderPaymentMetadataType,
    MembershipPayment?: MembershipPaymentMetadataType
  }
};

export interface PaymentDTO {
  amount: number,
  user_uid: string,
  created_at: string,
  identifier: string,
  metadata: Object,
  memo: string,
  status: {
    developer_approved: boolean,
    transaction_verified: boolean,
    developer_completed: boolean,
    cancelled: boolean,
    user_cancelled: boolean,
  },
  to_address: string,
  transaction: null | {
    txid: string,
    verified: boolean,
    _link: string,
  },
};

export interface PaymentCrossReferenceType {
  _id: string;
  u2a_payment_id: string;
  a2u_payment_id: string;
  u2u_status: U2UPaymentStatus;
  error_message: string;
  u2a_completed_at: Date;
  a2u_completed_at: Date;
  createdAt: Date;
  updatedAt: Date;
};

export interface TransactionType {
  _id: string;
  order: string;
  user: string;
  amount: number;
  paid: boolean;
  memo: string;
  payment_id: string;
  txid: string | null;
  cancelled: boolean;
  createdAt?: Date;
};

// ========================
// NOTIFICATION MODELS
// ========================

export type NotificationType = {
  _id: string;
  pi_uid: string;
  is_cleared: boolean;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface INotification {
  is_cleared?: boolean;
  reason: string;
};
