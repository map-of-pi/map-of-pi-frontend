import { MembershipClassType, MembershipOption } from "./types";

export const dummyList: MembershipOption[] = [  
  {
    value: MembershipClassType.CASUAL,
    mappi_allowance: 0,
    cost: 0,
    duration: null,
  },
  {
    value: MembershipClassType.SINGLE,
    mappi_allowance: 1,
    cost: 2,
    duration: 0,
  },
  {
    value: MembershipClassType.WHITE,
    mappi_allowance: 0,
    cost: 10,
    duration: 50,
  },
  {
    value: MembershipClassType.GREEN,
    mappi_allowance: 20,
    cost: 20,
    duration: 4,
  },
  {
    value: MembershipClassType.GOLD,
    mappi_allowance: 100,
    cost: 50,
    duration: 10,
  },
  {
    value: MembershipClassType.DOUBLE_GOLD,
    mappi_allowance: 400,
    cost: 100,
    duration: 20,
  },
  {
    value: MembershipClassType.TRIPLE_GOLD,
    mappi_allowance: 2000,
    cost: 200,
    duration: 50,
  }
];

export interface StatsData {
  registeredUsers: number;
  sellers: number;
  reviews: number;
  itemsListed: number;
  ordersCreated: number;
  ordersFulfilled: number;
  orderedItems: number;
  membershipTotals: Record<string, number>;
  totalMembers: number;
  individualMappi: number;
}

export const MOCK_STATS: StatsData = {
  registeredUsers: 0,
  sellers: 0,
  reviews: 0,
  itemsListed: 0,
  ordersCreated: 0,
  ordersFulfilled: 0,
  orderedItems: 0,
  membershipTotals: {
    White: 0,
    Green: 0,
    Gold: 0,
    'Double Gold': 0,
    'Triple Gold': 0,
  },
  totalMembers: 0,
  individualMappi: 0,
};


export const SUBHEADER = 'font-bold mb-2';