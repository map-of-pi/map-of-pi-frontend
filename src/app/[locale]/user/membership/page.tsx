'use client';

import { useTranslations } from "next-intl";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/shared/Forms/Buttons/Buttons";
import { Input, Select } from "@/components/shared/Forms/Inputs/Inputs";
import MembershipIcon from '@/components/shared/membership/MembershipIcon';
import { payWithPi } from "@/config/payment";
import { dummyList } from "@/constants/mock"
import { 
  MembershipClassType, 
  MembershipOption, 
  membershipBuyOptions, 
  MembershipBuyType,
  PaymentDataType, 
  PaymentType, 
  IVoucher
} from "@/constants/types"
import { fetchMembership, fetchMembershipList } from "@/services/membershipApi"
import { translatePurchaseOptions } from "@/utils/translate";

import { AppContext } from "../../../../../context/AppContextProvider";
import logger from "../../../../../logger.config.mjs";
import { fetchUserVouchers, redeemVoucher } from "@/services/voucherApi";

export default function MembershipPage() {
  const { currentUser, showAlert, userMembership, setUserMembership, setIsSaveLoading, isSaveLoading } = useContext(AppContext);
  const [membershipList, setMembershipList] = useState<MembershipOption[]>(dummyList);
  const [selectedMembership, setSelectedMembership] = useState<MembershipClassType>(MembershipClassType.GREEN);
  const [totalAmount, setTotalAmount] = useState<number>(0.00);
  const [selectedMethod, setSelectedMethod] = useState<MembershipBuyType>(MembershipBuyType.BUY);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
  const [voucherMembership, setVoucherMembership] = useState<MembershipOption | null>(null);
  const [voucherList, setAVoucherList] = useState<IVoucher[]>([]);

  const t = useTranslations();
  const HEADER = 'font-bold text-lg md:text-2xl';
  const SUBHEADER = 'font-bold mb-2';

  const loadMembership = async () => { 
    if (!currentUser?.pi_uid) return;
    try {
      logger.info(`Loading membership data for: ${currentUser.pi_uid}`);
      const data = await fetchMembership();

      setUserMembership(data ? data : userMembership);
      setSelectedMembership(data?.membership_class || userMembership?.membership_class || MembershipClassType.CASUAL);
    } catch (error) {
      showAlert(t('SCREEN.MEMBERSHIP.VALIDATION.FAILED_LOAD_MEMBERSHIP_MESSAGE'));
      logger.error("Error loading membership", {error})
    }
  };

  const isSingleMappi = (newClass: MembershipClassType) => { 
    return newClass === MembershipClassType.SINGLE
  };

  const onPaymentComplete = async (data:any) => {
    showAlert(t('SCREEN.MEMBERSHIP.VALIDATION.SUCCESSFUL_MEMBERSHIP_ACTIVATION_MESSAGE'));
    loadMembership()
    setIsSaveLoading(false);  
  }
  
  const onPaymentError = (error: Error) => {
    showAlert(t('SCREEN.MEMBERSHIP.VALIDATION.FAILED_MEMBERSHIP_PAYMENT_MESSAGE'));
    setIsSaveLoading(false);
  }

  const handleVoucherPick = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const voucherId = e.target.value;
  if (!voucherId) return;
  const found = voucherList.find((v) => v._id === voucherId) ?? null;
  setSelectedVoucher(found);
  setVoucherMembership(membershipList.find((m) => m.value ===found?.membership_class) ?? null)
};

  const handleVoucherRedemption = async () => {
    if (!currentUser || !selectedVoucher?._id) return;

    setIsSaveLoading(true);
    try {
      const result = await redeemVoucher(selectedVoucher._id);
      if (!result.success) {
        showAlert(result.error || t('SCREEN.MEMBERSHIP.VALIDATION.FAILED_VOUCHER_REDEMPTION_MESSAGE'));
      } else {
        showAlert(t('SCREEN.MEMBERSHIP.VALIDATION.SUCCESSFUL_VOUCHER_REDEMPTION_MESSAGE'));
        setUserMembership(result.membership || userMembership);
      }
    } catch (error) {
      showAlert(t('SCREEN.MEMBERSHIP.VALIDATION.FAILED_VOUCHER_REDEMPTION_MESSAGE'));
      logger.error("Error redeeming voucher", {error})
    } finally {
      setIsSaveLoading(false);
      setSelectedVoucher(null);
      setVoucherMembership(null)
    }
  }
  
  const handleBuy = async () => {
    if (!currentUser?.pi_uid) {
      return showAlert(t('SCREEN.MEMBERSHIP.VALIDATION.USER_NOT_LOGGED_IN_PAYMENT_MESSAGE'));
    }
    
    if (selectedMethod !== MembershipBuyType.BUY) return
    setIsSaveLoading(true)
  
    const paymentData: PaymentDataType = {
      amount: totalAmount,
      memo: `Map of Pi payment for ${selectedMembership} ${isSingleMappi(selectedMembership) ? 'Mappi' : 'Membership' }`,
      metadata: { 
        payment_type: PaymentType.Membership,
        MembershipPayment: {
          membership_class: selectedMembership
        }
      },        
    };
    await payWithPi(paymentData, onPaymentComplete, onPaymentError);
  } 

  useEffect(() => {
    const loadMembershipList = async () => { 
      try {
        const subList = await fetchMembershipList();
        setMembershipList(subList!);
        setSelectedMembership(userMembership?.membership_class || MembershipClassType.CASUAL);
      } catch (error) {
        showAlert(t('SCREEN.MEMBERSHIP.VALIDATION.FAILED_LOAD_MEMBERSHIP_MESSAGE'));
        logger.error("Error loading membership", {error})
      }
    };

    loadMembershipList();
  }, []);

  useEffect(() => {
    const getVouchers = async () => { 
      try {
        const res = await fetchUserVouchers();
        if (!res.success && res.error) {
          showAlert(res?.error)
        }

        setAVoucherList(res.vouchers || []);
        if (res.vouchers && res.vouchers.length>0) {
          const firstVucher = res.vouchers[0];
          setSelectedVoucher(firstVucher)
          setVoucherMembership(membershipList.find((m) => m.value ===firstVucher?.membership_class) ?? null)
        }
      } catch (error) {
        showAlert('Error fetching user voucher');
        logger.error("Error loading membership", {error})
      }
    };

    getVouchers();
  }, []);

  return (
    <div className="w-full h-screen md:w-[500px] md:mx-auto p-4">
      <div className="w-full flex flex-col items-center mb-5">
        <h3 className="text-gray-400 text-sm flex items-center">
          {currentUser ? currentUser.user_name : ''} 
          {userMembership&& <MembershipIcon 
            category={userMembership.membership_class} 
            className="ml-1"
            styleComponent={{
              display: "inline-block",
              objectFit: "contain",
              verticalAlign: "middle"
            }}
          />}
        </h3>
        <h1 className={HEADER}>
          {t('SCREEN.MEMBERSHIP.MEMBERSHIP_HEADER')}
        </h1>
      </div>

      <div className="mb-5">
        <h2 className={SUBHEADER}>
          {t('SCREEN.MEMBERSHIP.CURRENT_MEMBERSHIP_CLASS_LABEL') + ': '}
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          {userMembership?.membership_class}
        </p>
      </div>

      <div className="mb-5">
        <h2 className={SUBHEADER}>
          {t('SCREEN.MEMBERSHIP.CURRENT_MEMBERSHIP_END_DATE_LABEL') + ': '}
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          {userMembership?.membership_expiry_date
            ? new Date(userMembership.membership_expiry_date).toLocaleString()
            : t('SCREEN.MEMBERSHIP.CURRENT_MEMBERSHIP_END_DATE_NO_ACTIVE_MEMBERSHIP')}
        </p>
      </div>

      <div className="mb-5">
        <h2 className={SUBHEADER}>
          {t('SCREEN.MEMBERSHIP.MAPPI_ALLOWANCE_REMAINING_LABEL') + ': '}
        </h2>
        <p className="text-gray-600 text-sm mt-1">{userMembership?.mappi_balance || 0} mappi</p>
      </div>

      <h2 className={SUBHEADER}>
        {t('SCREEN.MEMBERSHIP.PICK_BUY_METHOD_LABEL') + ': '}
      </h2>

      <div className="">
        <div className="mb-5">
          {membershipBuyOptions.map((option, index) => 
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
          )}
        </div>

        <h2 className={SUBHEADER}>
          {selectedMethod === MembershipBuyType.VOUCHER ?
            'Pick from Available vouchers' + ': ' :
            t('SCREEN.MEMBERSHIP.PICK_MEMBERSHIP_MAPPI_TO_BUY_LABEL') + ': '
          }
        </h2>

        {selectedMethod === MembershipBuyType.VOUCHER ? 
          <div>
              {voucherList.length > 0 ? 
                <Select
                  name="voucherSelector"
                  value={selectedVoucher?._id}
                  onChange={handleVoucherPick}  // now receives e: ChangeEvent<HTMLSelectElement>
                  options={voucherList.map((v) => ({
                    name: v.voucher_code,
                    value: v._id
                  }))}
                /> 
                  : 
                <Input
                  label={'Pick from Available vouchers'}
                  value="You don't have any membership"
                  style={{
                    backgroundColor: '#d0d0d0',
                    cursor: 'not-allowed',
                  }}
                  disabled
                />
              }            

              {selectedVoucher && voucherMembership && <>
                <div
                  className="mb-1 flex gap-2 pr-7 items-center cursor-pointer text-nowrap"
                >                                     
                  {/* <IoCheckmark /> */}
                  <div className="p-1 bg-green-700 rounded"></div>
                      
                  {`${voucherMembership?.value}  ${isSingleMappi(voucherMembership?.value)
                    ? "Mappi" 
                    : t('SCREEN.MEMBERSHIP.PICK_MEMBERSHIP_DURATION_IN_WEEKS_LABEL', { duration: voucherMembership.duration ?? '' })
                  }`} 
                  
                  <MembershipIcon 
                    category={voucherMembership?.value!} 
                    className="ml-1"
                    styleComponent={{
                      display: "inline-block",
                      objectFit: "contain",
                      verticalAlign: "middle"
                    }}
                  />
                  <span> {voucherMembership.cost}Pi</span>
                </div>
                
                <div className="mb-5 mt-3 flex justify-between">
                  <Button
                    label='Redeem'
                    disabled={isSaveLoading || !selectedVoucher}
                    styles={{
                      color: '#ffc153',
                      height: '40px',
                      padding: '10px 15px',
                      marginLeft: 'auto'
                    }}
                    onClick={handleVoucherRedemption}
                  />
                </div> 
              </>}
          </div> 
          :
          <div>
            <div>
              {membershipList && membershipList.length> 0 && membershipList.map((option, index) => (
                <div
                  key={index}
                  className="mb-1 flex gap-2 pr-7 items-center cursor-pointer text-nowrap"
                  onClick={() => {setSelectedMembership(option.value); setTotalAmount(option.cost)} }
                >
                  {                                       
                    selectedMembership === option.value ? (
                      // <IoCheckmark />
                      <div className="p-1 bg-green-700 rounded"></div>
                      ) : (
                      // <IoClose />
                      <div className="p-1 bg-yellow-400 rounded"></div>                  
                    )
                  }
                  {`${option.value}  ${isSingleMappi(option.value)
                    ? "Mappi" 
                    : t('SCREEN.MEMBERSHIP.PICK_MEMBERSHIP_DURATION_IN_WEEKS_LABEL', { duration: option.duration ?? '' })
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
                  <span> {option.cost}Pi</span>
                </div>
              ))}
            </div>
            <div className="mb-5 mt-3 flex justify-between">
              <Button
                label={`${t('SHARED.BUY')} (${totalAmount}Pi)`}
                disabled={isSaveLoading || totalAmount <= 0}
                styles={{
                  color: '#ffc153',
                  height: '40px',
                  padding: '10px 15px',
                  marginLeft: 'auto'
                }}
                onClick={handleBuy}
              />
            </div>
          </div>
        }
      </div>     
    </div>
  );
}