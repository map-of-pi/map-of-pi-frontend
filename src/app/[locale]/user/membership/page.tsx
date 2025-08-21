'use client';

import { useTranslations } from "next-intl";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../../../context/AppContextProvider";
import { IMembership, PaymentDataType, PaymentType } from "@/constants/types"
import { MembershipClassType, MembershipOption, membershipBuyOptions, MembershipBuyType, dumyList } from "@/constants/membershipClassType"
import { fetchMembership, fetchMembershipList } from "@/services/membershipApi"
import { Button } from "@/components/shared/Forms/Buttons/Buttons";
import { Input } from "@/components/shared/Forms/Inputs/Inputs";
import MembershipIcon from '@/components/shared/membership/MembershipIcon';
import { payWithPi } from "@/config/payment";
import logger from "../../../../../logger.config.mjs"
import { useRouter } from 'next/navigation';

export default function MembershipPage() {
  const { currentUser, showAlert, userMembership, setUserMembership } = useContext(AppContext);
  const [membershipData, setMembershipData] = useState<IMembership | null>(null);
  const [membershipList, setMembershipList] = useState<MembershipOption[] | null>(dumyList);
  const [selectedMembership, setSelectedMembership] = useState<MembershipClassType>(userMembership);
  const [totalAmount, setTotalAmount] = useState<number>(0.00);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<MembershipBuyType>(MembershipBuyType.BUY);

  const router = useRouter();
  const t = useTranslations();
  const HEADER = 'font-bold text-lg md:text-2xl';
  const SUBHEADER = 'font-bold mb-2';

  const loadMembership = async () => { 
    if (!currentUser?.pi_uid) return;
    try {
      const subList = await fetchMembershipList();
      setMembershipList(subList);

      const data = await fetchMembership();
      setMembershipData(data);
      setUserMembership(data? data?.membership_class: userMembership);
      setSelectedMembership(data?.membership_class || userMembership);
    } catch {
      showAlert("Could not load membership data");
    }
  };

  useEffect(() => {
    loadMembership();
  }, [currentUser]);

  const onPaymentComplete = async (data:any) => {
    showAlert('Membership placed successfully');
    await loadMembership();    
  }
  
  const onPaymentError = (error: Error) => {
    showAlert("Error paying for membership")
  }
  
  const handleBuy = async () => {
    if (!currentUser?.pi_uid) return showAlert('User not logged in for payment');
    if (selectedMethod!==MembershipBuyType.BUY) return
  
    const paymentData: PaymentDataType = {
      amount: totalAmount,
      memo: `Map of Payment for ${selectedMembership} membership`,
      metadata: { 
        payment_type: PaymentType.Membership,
        MembershipPayment: {
          membership_class: selectedMembership
        }
      },        
    };
    await payWithPi(paymentData, onPaymentComplete, onPaymentError);
  } 

  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4">
      <h1 className={HEADER}>{'Membership'}</h1>

      <div className="mb-5">
        <h2 className={SUBHEADER}>Current Member Class:</h2>
        <p className="text-gray-600 text-xs mt-1">
          {membershipData?.membership_class || userMembership}
        </p>
      </div>

      <div className="mb-5">
        <h2 className={SUBHEADER}>Current Membership End Date:</h2>
        <p className="text-gray-600 text-xs mt-1">
          {membershipData?.membership_expiry_date
            ? new Date(membershipData.membership_expiry_date).toLocaleString()
            : "No active membership"}
        </p>
      </div>

      <div className="mb-5">
        <h2 className={SUBHEADER}>Mappi allowance remaining:</h2>
        <p className="text-gray-600 text-xs mt-1">{membershipData?.mappi_balance || 0}</p>
      </div>

      <div className="mb-5">
        <h2 className={SUBHEADER}>Pick membership or mappi to buy:</h2>

        <div className="">
          {membershipList && membershipList.length>0 && membershipList.map((option, index) => (
            <div
              key={index}
              className="mb-1 flex gap-2 pr-7 items-center cursor-pointer text-nowrap"
              onClick={() => {setSelectedMembership(option.value); setTotalAmount(option.cost)} }>
              {                                       
                selectedMembership === option.value ? (
                  // <IoCheckmark />
                  <div className="p-1 bg-green-700 rounded"></div>
                  ) : (
                  // <IoClose />
                  <div className="p-1 bg-yellow-400 rounded"></div>                  
                )
              }
              {`${option.value}  ${option.value===MembershipClassType.SINGLE? "mappi" : "membership (" + option.duration + ") weeks"}`} 
              
              <MembershipIcon 
                category={option.value} 
                className="ml-1"
                styleComponent={{
                  display: "inline-block",
                  objectFit: "contain",
                  verticalAlign: "middle"
                }}
              />
               <span> {option.cost}π</span>
            </div>
          ))}
        </div>

      </div>

      <div className="mb-5">
        <h2 className={SUBHEADER}>Pick buy Method:</h2>

        <div className="">
          {membershipBuyOptions.map((option, index) => (
            <div
              key={index}
              className="mb-1 flex gap-2 pr-7 items-center cursor-pointer text-nowrap"
              onClick={() => setSelectedMethod(option.value)}>
              {                                       
                selectedMethod === option.value ? (
                  <div className="p-1 bg-green-700 rounded"></div>
                  ) : (
                  <div className="p-1 bg-yellow-400 rounded"></div>                  
                )
              }
              {option.label}
            </div>
          ))}
          {selectedMethod === MembershipBuyType.VOUCHER && (
            <div className="mb-4">
              <Input
                label={""}
                placeholder="Enter voucher code"
                type="email"
                name="email"
              />
            </div>)
          }
        </div>
      </div>

      <div className="mb-5 mt-3 flex justify-between">
      <Button
        label="Watch Ads"
        styles={{
          color: '#ffc153',
          height: '40px',
          padding: '10px 15px',
        }}
onClick={() => router.push(`/user/watch-ads`)}
      />

      <Button
        label="Buy"
        styles={{
          color: '#ffc153',
          height: '40px',
          padding: '10px 15px',
        }}
        onClick={handleBuy}
      />
    </div>
  </div>
  );
}