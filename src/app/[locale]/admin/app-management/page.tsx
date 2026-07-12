'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import TabShuttle, { TabItem } from '@/components/shared/TabShuttle';
import { fetchMembershipList } from "@/services/membershipApi"
import { AdminType, MembershipClassType, MembershipOption } from '@/constants/types';
import { dummyList, MOCK_STATS, StatsData, SUBHEADER } from '@/constants/mock';
import MembershipIcon from '@/components/shared/membership/MembershipIcon';
import { useTranslations } from 'next-intl';
import { Input, Select } from '@/components/shared/Forms/Inputs/Inputs';
import Navbar from '@/components/shared/navbar/Navbar';
import { Button } from '@/components/shared/Forms/Buttons/Buttons';
import { AppContext } from '../../../../../context/AppContextProvider';
import { addVoucher } from '@/services/voucherApi';
import { fetchSummaryStatistics } from '@/services/statisticsApi';
import { getAdmins, createAdmin, deleteAdmin } from "@/services/adminApi";
import logger from '../../../../../logger.config.mjs';
import { ConfirmDialogX } from '@/components/shared/confirm';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'statistics' | 'adminregister' | 'addvouchers';
const PERMANENT_ADMINS = new Set(['peejenn', 'swoocn']);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => {
  return n.toLocaleString();
}

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString(undefined, {
    month: '2-digit', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

// ---- Reusable stats table ----
const StatsTable = ({ rows }: { rows: [string, number][] }) => {
  
  return (
    <section className="relative rounded-lg border border-primary mb-7 p-4">
      <table className="w-full">
        <tbody>
          {rows.map(([label, val]) => (
            <tr
              key={label}
            >
              <td className="py-2 pr-6 text-sm whitespace-nowrap">
                {label}
              </td>
              <td className="py-2 text-sm font-semibold text-right tabular-nums">
                {fmt(val)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// ---- Statistics Tab ----
const StatisticsTab = () => {
  const { currentUser, isSigningInUser } = useContext(AppContext);
  const [stats, setStats]             = useState<StatsData>(MOCK_STATS);

  // Load statistics on mount
  useEffect(() => () => {   
    if (!currentUser || isSigningInUser) return;

    const loadStats = async () => {
      try {
        const result = await fetchSummaryStatistics();
        
        if (result.success && result.usageStats && result.membershipStats) {
          setStats({
            registeredUsers: result.usageStats.totalUsers,
            sellers: result.usageStats.totalSellers,
            reviews: result.usageStats.totalReviews,

            itemsListed: result.usageStats.totalSellerItems,
            ordersCreated: result.usageStats.totalOrders,
            ordersFulfilled: result.usageStats.fulfilledOrders,
            orderedItems: result.usageStats.totalOrderItems,
            
            membershipTotals: {
              White: result.membershipStats.totalActiveWhiteMembers,
              Green: result.membershipStats.totalActiveGreenMembers,
              Gold: result.membershipStats.totalActiveGoldMembers,
              'Double Gold': result.membershipStats.totalActiveDoubleGoldMembers,
              'Triple Gold': result.membershipStats.totalActiveTripleGoldMembers,
            },

            totalMembers: result.membershipStats.totalActiveMembers,
            individualMappi: result.membershipStats.totalActiveMappiBalance,
          });

          // logger.info('Summary statistics fetched successfully', { result });
        }

      } catch (error) {
        logger.error('Error fetching summary statistics:', error);
        setStats(MOCK_STATS);
      }
    };

    loadStats();
  }, [currentUser]);

  const rows: [string, number][] = [
    ['Registered users', stats.registeredUsers],
    ['Sellers',          stats.sellers],
    ['Reviews',          stats.reviews],
    ['Items listed',     stats.itemsListed],
    ['Orders created',   stats.ordersCreated],
    ['Orders fulfilled', stats.ordersFulfilled],
    ['Ordered items',    stats.orderedItems],
  ];

  const membershipRows: [string, number][] = [
    ...Object.entries(stats.membershipTotals) as [string, number][],
    ['Total members',     stats.totalMembers],
    ['Individual mappi',  stats.individualMappi],
  ];

  return (
    <div className="w-full h-full">

      <h2 className={SUBHEADER}>Usage numbers</h2>
      <StatsTable rows={rows} />

      <h2 className={SUBHEADER}>Current membership totals</h2>
      <StatsTable rows={membershipRows} />

    </div>
  );
}

const AdminRegisterTab = () => {
  const { showAlert, setIsSaveLoading, currentUser, isSigningInUser } = useContext(AppContext);

  const [admins, setAdmins] = useState<AdminType[]>([]);
  const [piUsernameInput, setPiUsernameInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<"superadmin" | "admin">("admin");

  const t = useTranslations();

  useEffect(() => {
    if (!currentUser || isSigningInUser) return;
    loadAdmins();
  }, [currentUser]);

  const loadAdmins = async () => {
    setIsSaveLoading(true);

    try {
      const result = await getAdmins({
        page: 1,
        limit: 100,
      });

      if (result.success) {
        setAdmins(result.data);

        logger.info("Admins fetched successfully.", result);
      }
    } catch (error: any) {
      logger.error("Failed to fetch admins.", error);
      showAlert(
        error?.response?.data?.message ??
          "Unable to fetch admins."
      );
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleAdd = async () => {
    const username = piUsernameInput.trim();

    if (!username || !currentUser) return;

    try {
      const result = await createAdmin({
        username,
        role: selectedRole,
      });

      if (result.success) {
        setAdmins((prev) => {
          const exists = prev.some(
            (admin) => admin.username === result.data.username
          );

          return exists ? prev : [...prev, result.data];
        });

        setPiUsernameInput("");

        showAlert("Admin added successfully.");

        logger.info("Admin created.", result.data);
      }
    } catch (error: any) {
      logger.error(error);

      showAlert(
        error?.response?.data?.message ??
          "Unable to add admin."
      );
    }
  };

  const handleRemove = async () => {
    const username = piUsernameInput.trim();

    if (!username || !currentUser) return;

    const admin = admins.find(
      (a) => a.username === username
    );

    if (!admin) {
      showAlert("Pioneer is not an admin.");
      return;
    }

    try {
      const result = await deleteAdmin(admin._id);

      if (result.success) {
        setAdmins((prev) =>
          prev.filter((a) => a._id !== admin._id)
        );

        setPiUsernameInput("");

        showAlert("Admin removed successfully.");
      }
    } catch (error: any) {
      logger.error(error);

      showAlert(
        error?.response?.data?.message ??
          "Unable to remove admin."
      );
    }
  };

  return (
    <div className="w-full h-full" >
      <div className='w-full flex align-items gap-2 mb-5'>
        <div className="">
          <h1 className='font-bold mb-2'>Pioneer username:</h1>
          <Input
            placeholder="Admin Pi username to be added/removed"
            type="text"
            value={piUsernameInput}
            name="piUsername"
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPiUsernameInput(e.target.value)}
          />
        </div>

        <div className="ms-auto">
          <h1 className='font-bold mb-2'>Role:</h1>
          <Select
            value={selectedRole}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRole(e.target.value as "superadmin" | "admin")}
            options={[{name: "superadmin", value: "superadmin"}, {name: "admin", value: "admin"}]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-7">
        <Button
          label="Add"
          disabled={!piUsernameInput.trim()}
          styles={{
            color: '#ffc153',
            height: '40px',
            padding: '10px 15px',
          }}
          onClick={handleAdd}
        />

        <Button
          label="Remove"
          disabled={!piUsernameInput.trim()}
          styles={{
            color: '#ffc153',
            height: '40px',
            padding: '10px 15px',
          }}
          onClick={handleRemove}
        />
      </div>

      <h1 className='font-bold mb-2'>List of admins:</h1>
      <div 
        className={`relative border border-primary rounded-lg mb-7 p-4`}
      >
        <ul className="amp-admin-list">
          {admins.map(admin => (
            <li key={admin._id} className={`amp-admin-list__item${PERMANENT_ADMINS.has(admin.username) ? ' amp-admin-list__item--permanent' : ''}`}>
              {admin.username}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const AddVouchersTab = () => {
  const { showAlert, setIsSaveLoading, currentUser, isSaveLoading } = useContext(AppContext);
  const t = useTranslations();

  const [membershipList, setMembershipList] = useState<MembershipOption[]>(dummyList);
  const [selectedMembership, setSelectedMembership] = useState<MembershipClassType>(MembershipClassType.GREEN);
  const [recipient, setRecipient]     = useState('');
  
  const [voucherCode, setVoucherCode] = useState('1xGreenForFree');
  const [validityDays, setValidityDays] = useState<string>('20');
  const [popup, setPopup]             = useState<boolean>(false);
  const [notifiMessage, setNotifiMessage]             = useState<string>('');

  const handleSave = () => {
    const errors: string[] = [];

    if (!recipient.trim())       errors.push('Pioneer name is required.');
    if (!voucherCode.trim())     errors.push('Voucher code is required.');
    if (/\s/.test(voucherCode))  errors.push('Voucher code must not contain spaces.');
    if (!currentUser)            errors.push('unauthorized user');

    const days = parseInt(validityDays, 10);
    if (!validityDays || isNaN(days) || days < 1 || days > 20)
      errors.push('Validity period must be an integer from 1 to 20.');

    if (errors.length > 0) {
      setNotifiMessage( errors.join('\n') );
      setPopup(true);
      return;
    }

    const validUntil = addDays(new Date(), days);
    const tierLabel = membershipList.find(t => t.value === selectedMembership)?.value ?? selectedMembership;

    setNotifiMessage(`You're setting up a ${tierLabel} voucher named 
        "${voucherCode}" for pioneer ${recipient.trim()} which must be redeemed by 
      ${formatDateTime(validUntil)}, i.e. within ${days} day${days !== 1 ? 's' : ''}.`);
    setPopup(true);    
  };

  const handleConfirm = async () => {
    setIsSaveLoading(true);
    try {
      const days = parseInt(validityDays, 10);
      const validUntil = addDays(new Date(), days);
      const result = await addVoucher({
        pi_username: recipient,
        voucher_code: voucherCode,
        membership_class: selectedMembership,
        expiry_date: validUntil
      });
      if (!result.success) {
        showAlert(result.error || 'unable to assign voucher');
      } else {
        showAlert('Assign voucher successfully');
      }
    } catch (error) {
      showAlert('error adding voucher');
    } finally {
      setIsSaveLoading(false);
      setPopup(false);
    }
  };

  useEffect(() => {
    const loadMembershipList = async () => { 
      try {
        const subList = await fetchMembershipList();

        setMembershipList(subList!);
        setSelectedMembership(MembershipClassType.GREEN)
      } catch (error) {
        // showAlert(t('SCREEN.MEMBERSHIP.VALIDATION.FAILED_LOAD_MEMBERSHIP_MESSAGE'));
        console.error("Error loading membership", {error})
      }
    };

    loadMembershipList();
  }, []);

  return (
    <div className="w-full h-full">
      <div className='w-full h-full'>
        <div className="mb-5">
          <Input
            label={"Pioneer username"}
            placeholder={t('SCREEN.MEMBERSHIP.ENTER_VOUCHER_CODE_PLACEHOLDER')}
            type="text"
            value={recipient}
            name="piUsername"
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setRecipient(e.target.value)}
          />
        </div>

        <div className="mb-5">
          <Input
            label={"Vouher code"}
            placeholder={t('SCREEN.MEMBERSHIP.ENTER_VOUCHER_CODE_PLACEHOLDER')}
            type="text"
            value={voucherCode}
            name="voucherCode"
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setVoucherCode(e.target.value)}
          />
        </div>
        
        {membershipList && membershipList.length> 0 && membershipList.map((option, index) => (
          <div
            key={index}
            className="mb-1 flex gap-2 pr-7 items-center cursor-pointer text-nowrap"
            onClick={() => {setSelectedMembership(option.value)} }>
            {                                       
              selectedMembership === option.value ? (
                // <IoCheckmark />
                <div className="p-1 bg-green-700 rounded"></div>
                ) : (
                // <IoClose />
                <div className="p-1 bg-yellow-400 rounded"></div>                  
              )
            }
            {`${option.value} Mappi`} 
            
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

        <div className="mt-5">
          <Input
            label={"Validity Period"}
            placeholder={'Number of days'}
            type="text"
            value={validityDays}
            name="voucherCode"
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setValidityDays(e.target.value)}
          />
        </div>

        <div className="mb-5 mt-3 flex justify-between">
          <Button
            label={'Assign'}
            disabled={isSaveLoading}
            styles={{
              color: '#ffc153',
              height: '40px',
              padding: '10px 15px',
              marginLeft: 'auto'
            }}
            onClick={handleSave}
          />
        </div> 
      </div>

      {/* Confirm popup */}
      {popup && (
        <ConfirmDialogX 
          toggle={() => setPopup(false)}  
          handleClicked={handleConfirm}
          message={notifiMessage}
        />
      )}
    </div>
  );
}

// ─── App Management Page ──────────────────────────────────────────────────────

const TABS: TabItem[] = [
  { id: 'statistics',    label: 'Statistics' },
  { id: 'adminregister', label: 'Admin registration' },
  { id: 'addvouchers',   label: 'Add vouchers' },
];

export default function AppManagementPage() {
  const { currentUser } = useContext(AppContext);
  const [selectedTab, setSelectedTab] = useState<TabId>('statistics');
  const navTimerRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
  }, []);

  if (!currentUser) {
    return (
      <div className="amp-page">
        <p className="amp-access-denied">You are not authenticated, please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full h-min-screen md:w-[500px] md:mx-auto p-4">
      <Navbar />
      <h1 className='font-bold text-lg md:text-2xl text-center mb-4'>
        App Management
      </h1>

      {/* Tab shuttle */}
      <TabShuttle
        tabs={TABS}
        selectedTabId={selectedTab}
        onTabChange={id => setSelectedTab(id as TabId)}
      />

      {/* Tab panels */}
      {selectedTab === 'statistics' && (
        <StatisticsTab />
      )}

      {selectedTab === 'adminregister' && (
        <AdminRegisterTab />
      )}

      {selectedTab === 'addvouchers' && (
        <AddVouchersTab />
      )}
    </div>
  );
}