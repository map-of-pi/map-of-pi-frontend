import { SellerItem, StockLevelType, PaginatedResponse, PartialOrderType, OrderStatusType, FulfillmentType } from "./types";

export const itemData = {
  seller: {
    name: "seller name",
    seller_id: "seller username",
    image: "https://tse3.mm.bing.net/th?id=OIP.Ijh2DJJVlAmhBAYABFwI-wAAAA&pid=Api&P=0&h=220",
    ratings: 5.0,
    address: "Crescent Way, Bab 2/4, New York City",
    phone: '+234 567 8910',
    email: 'selleremail@example.com',
    description: "Discover handcrafted jewelry and artisanal candles, available for purchase using Pi cryptocurrency. Elevate your space and style with our unique offerings today.",
    sale_items: "seller items placeholder",
    average_rating: 5.0,
    trust_meter_rating: 100,
    type: "pioneer",
    coordinates: [],
    order_online_enabled_pref: false,
  },
};

export const PiFestJson = {
  User: {
    user_id: 'pioneer123',
    user_name: 'pioneer name',
  },

  ReviewFeedback: {
    review_id: "rvid123",
    review_receiver_id: "rcvid456",
    review_giver_id: "gvid798",
    reply_to_review_id: "repid321",
    rating: 1, 
    comment: "I am happy to let you all know that consumer to seller relationship is good.",
    image: "/images/shared/upload.png",
    review_date: "23 Oct. 2023 01:00pm",
  },

  Seller: {
    seller_id: 'user_id',
    name: 'User ID',
    description: 'I sell using pay with pi', 
    image: '/images/logo.svg',
    phone: '+234 567 8910',
    email: 'selleremail@example.com',
    address: 'Help your buyers find you by describing your address or whereabouts',
    sale_items: 'Describe your items for sale, pi prices etc',
    average_rating: {
      $numberDecimal: 5.0
    },
    trust_meter_rating: 100,
    coordinates: {
      type: "Point",
      coordinates: [
        [125.6, 10.1],
      ]
    },
    order_online_enabled_pref: true,
    _id: "666c84b9d77068c6efeeaa1a",
    __v: 0
  }
};

export const SellerItems: SellerItem[] = [
  {
    seller_id: '01',
    name: "Ham & cheese sandwich",
    _id: "01",
    duration: 4,
    price: {$numberDecimal: '10'},
    description: "A filling sandwich made with soft fresh-backed bread, tender, ham, cheese creamy slices, crisp lettuce, juicy tomato and mayo",
    image: "/images/business/product.png",
    stock_level: StockLevelType.available_1,
    created_at: new Date(),
    updated_at: new Date(),
    expired_by: new Date()
  }, 
  {
    seller_id: '02',
    name: "Coffee",
    _id: "02",
    duration: 0.5,
    price: {$numberDecimal: '10'},
    description: "A nice refreshing coffee",
    image: "/images/business/product.png",
    stock_level: StockLevelType.available_2,
    created_at: new Date(),
    updated_at: new Date(),
    expired_by: new Date()
  }, 
  {
    seller_id: '03',
    name: "Mobile phones",
    _id: "03",
    duration: 11,
    price: {$numberDecimal: '20'},
    description: "All kind of mobile phones",
    image: "/images/business/product.png",
    stock_level: StockLevelType.available_3,
    created_at: new Date(),
    updated_at: new Date(),
    expired_by: new Date()
  }, 
];

// ========================
// PAGINATED DEMO DATA
// ========================

/**
 * بيانات تجريبية لمحاكاة استجابة الـ Pagination لطلبات البائع.
 * تُستخدم لاختبار الـ Infinite Scroll في البيئة التطويرية.
 */
export const MockPaginatedOrders: PaginatedResponse<PartialOrderType> = {
  docs: [
    {
      _id: "ord_001",
      buyer_id: { pi_username: "Pioneer_Alpha" },
      seller_id: { name: "Central Mall" },
      total_amount: { $numberDecimal: 15.5 },
      status: OrderStatusType.Pending,
      fulfillment_method: FulfillmentType.CollectionByBuyer,
      buyer_fulfillment_description: "Pickup at 2 PM",
      seller_fulfillment_description: "Items ready at counter",
      createdAt: new Date()
    },
    // يمكن تكرار العناصر هنا لمحاكاة قائمة طويلة
  ],
  totalDocs: 50,
  limit: 10,
  totalPages: 5,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: true,
  prevPage: null,
  nextPage: 2
};
