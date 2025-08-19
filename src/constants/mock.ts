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
    cost: 0.2,
    duration: 0,
  },
  {
    value: MembershipClassType.WHITE,
    mappi_allowance: 20,
    cost: 1,
    duration: 3,
  },
  {
    value: MembershipClassType.GREEN,
    mappi_allowance: 50,
    cost: 1.5,
    duration: 4,
  },
  {
    value: MembershipClassType.GOLD,
    mappi_allowance: 100,
    cost: 5,
    duration: 10,
  },
  {
    value: MembershipClassType.DOUBLE_GOLD,
    mappi_allowance: 200,
    cost: 10,
    duration: 20,
  },
  {
    value: MembershipClassType.TRIPLE_GOLD,
    mappi_allowance: 300,
    cost: 20,
    duration: 50,
  }
];