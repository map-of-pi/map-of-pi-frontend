'use client';

import { useTranslations } from "next-intl";
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/shared/Forms/Buttons/Buttons";
import { Input } from "@/components/shared/Forms/Inputs/Inputs";
import MembershipIcon from '@/components/shared/membership/MembershipIcon';
import { payWithPi } from "@/config/payment";
import { dummyList } from "@/constants/mock"
import { 
  IMembership,
  MembershipClassType, 
  MembershipOption, 
  membershipBuyOptions, 
  MembershipBuyType,
  PaymentDataType, 
  PaymentType 
} from "@/constants/types"
import { fetchMembership, fetchMembershipList } from "@/services/membershipApi"
import { translatePurchaseOptions } from "@/utils/translate";

import { AppContext } from "../../../../../context/AppContextProvider";
import logger from "../../../../../logger.config.mjs";

export default function MembershipPage() {
  const { currentUser, showAlert, userMembership, setUserMembership } = useContext(AppContext);
  const [membershipData, setMembershipData] = useState<IMembership | null>(null);
  const [membershipList, setMembershipList] = useState<MembershipOption[] | null>(dummyList);
  const [selectedMembership, setSelectedMembership] = useState<MembershipClassType>(userMembership);
  const [totalAmount, setTotalAmount] = useState<number>(0.00);
  const [selectedMethod, setSelectedMethod] = useState<MembershipBuyType>(MembershipBuyType.BUY);

  const router = useRouter();
  const t = useTranslations();
  const HEADER = 'font-bold text-lg md:text-2xl';
  const SUBHEADER = 'font-bold mb-2';

  const loadMembership = async () => { 
    if (!currentUser?.pi_uid) return;
    try {
      logger.info(`Loading membership data for: ${currentUser.pi_uid}`);
      const subList = await fetchMembershipList();
      setMembershipList(subList);

      const data = await fetchMembership();
      setMembershipData(data);
      setUserMembership(data? data?.membership_class: userMembership);
      setSelectedMembership(data?.membership_class || userMembership);
    } catch (error) {
      showAlert(t('SCREEN.MEMBERSHIP.VALIDATION.FAILED_LOAD_MEMBERSHIP_MESSAGE'));
      logger.error("Error loading membership", {error})
    }
  };

  useEffect(() => {
    loadMembership();
  }, [currentUser]);

  const onPaymentComplete = async (data:any) => {
    showAlert(t('SCREEN.MEMBERSHIP.VALIDATION.SUCCESSFUL_MEMBERSHIP_ACTIVATION_MESSAGE'));
    await loadMembership();    
  }
  
  const onPaymentError = (error: Error) => {
    showAlert(t('SCREEN.MEMBERSHIP.VALIDATION.FAILED_MEMBERSHIP_PAYMENT_MESSAGE'));
  }
  
  const handleBuy = async () => {
    if (!currentUser?.pi_uid) {
      return showAlert(t('SCREEN.MEMBERSHIP.VALIDATION.USER_NOT_LOGGED_IN_PAYMENT_MESSAGE'));
    }
    
    if (selectedMethod !== MembershipBuyType.BUY) return
  
    const paymentData: PaymentDataType = {
      amount: totalAmount,
      memo: `Map of Pi payment for ${selectedMembership} membership`,
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
      <h1 className={HEADER}>
        {t('SCREEN.MEMBERSHIP.MEMBERSHIP_HEADER')}
      </h1>

      <div className="mb-5">
        <h2 className={SUBHEADER}>
          {t('SCREEN.MEMBERSHIP.CURRENT_MEMBERSHIP_CLASS_LABEL') + ': '}
        </h2>
        <p className="text-gray-600 text-xs mt-1">
          {membershipData?.membership_class || userMembership}
        </p>
      </div>

      <div className="mb-5">
        <h2 className={SUBHEADER}>
          {t('SCREEN.MEMBERSHIP.CURRENT_MEMBERSHIP_END_DATE_LABEL') + ': '}
        </h2>
        <p className="text-gray-600 text-xs mt-1">
          {membershipData?.membership_expiry_date
            ? new Date(membershipData.membership_expiry_date).toLocaleString()
            : t('SCREEN.MEMBERSHIP.CURRENT_MEMBERSHIP_END_DATE_NO_ACTIVE_MEMBERSHIP')}
        </p>
      </div>

      <div className="mb-5">
        <h2 className={SUBHEADER}>
          {t('SCREEN.MEMBERSHIP.MAPPI_ALLOWANCE_REMAINING_LABEL') + ': '}
        </h2>
        <p className="text-gray-600 text-xs mt-1">{membershipData?.mappi_balance || 0}</p>
      </div>

      <div className="mb-5">
        <h2 className={SUBHEADER}>
          {t('SCREEN.MEMBERSHIP.PICK_MEMBERSHIP_MAPPI_TO_BUY_LABEL') + ': '}
        </h2>

        <div className="">
          {membershipList && membershipList.length> 0 && membershipList.map((option, index) => (
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
              {`${option.value}  ${option.value === MembershipClassType.SINGLE 
                ? "Mappi" 
                : t('SCREEN.MEMBERSHIP.PICK_MEMBERSHIP_DURATION_IN_WEEKS_LABEL', { duration: option.duration })
              }`} 
              
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
        <h2 className={SUBHEADER}>
          {t('SCREEN.MEMBERSHIP.PICK_BUY_METHOD_LABEL') + ': '}
        </h2>

        <div className="">
          {membershipBuyOptions.map((option, index) => (
            <div
              key={index}
              className="mb-1 flex gap-2 pr-7 items-center cursor-pointer text-nowrap"
              onClick={() => setSelectedMethod(option.value)}
            >
              {selectedMethod === option.value ? (
                <div className="p-1 bg-green-700 rounded"></div>
              ) : (
                <div className="p-1 bg-yellow-400 rounded"></div>                  
              )}
              {translatePurchaseOptions(option.value, t)}
            </div>
          ))}
          {selectedMethod === MembershipBuyType.VOUCHER && (
            <div className="mb-4">
              <Input
                label={""}
                placeholder={t('SCREEN.MEMBERSHIP.ENTER_VOUCHER_CODE_PLACEHOLDER')}
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
          label={selectedMethod === MembershipBuyType.ADS ? "Watch" : "Buy"}
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