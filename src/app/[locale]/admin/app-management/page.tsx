'use client';

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import TabShuttle, { TabItem } from '@/components/shared/TabShuttle';
import { fetchMembershipList } from "@/services/membershipApi"
import { AdminType, MembershipClassType, MembershipOption } from '@/constants/types';
import { dummyList } from '@/constants/mock';
import MembershipIcon from '@/components/shared/membership/MembershipIcon';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/shared/Forms/Inputs/Inputs';
import Navbar from '@/components/shared/navbar/Navbar';
import { Button } from '@/components/shared/Forms/Buttons/Buttons';
import { AppContext } from '../../../../../context/AppContextProvider';
import { addVoucher } from '@/services/voucherApi';
import { fetchSummaryStatistics } from '@/services/statisticsApi';
import { getAdmins, createAdmin, deleteAdmin } from "@/services/adminApi";
import logger from '../../../../../logger.config.mjs';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'statistics' | 'adminregister' | 'addvouchers';

interface StatsData {
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

interface NavbarMessageState {
  text: string;
  active: boolean;
}

// ─── Mock data / API stubs ────────────────────────────────────────────────────

const MOCK_STATS: StatsData = {
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

const MOCK_ADMINS = ['peejenn', 'swoocn', '<xxx>', '<yyy>', '<zzz>'];
const PERMANENT_ADMINS = new Set(['peejenn', 'swoocn']);

const HEADER = 'font-bold text-lg md:text-2xl';
const SUBHEADER = 'font-bold mb-2';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString();
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    month: '2-digit', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// ---- Reusable stats table ----
function StatsTable({ rows }: { rows: [string, number][] }) {
  
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
function StatisticsTab({ stats }: { stats: StatsData }) {
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

// ---- Admin Register Tab ----
interface AdminRegisterTabProps {
  isPermanentAdmin: boolean;
  onNavbarMessage: (msg: string) => void;
}

function AdminRegisterTab({ isPermanentAdmin, onNavbarMessage }: AdminRegisterTabProps) {
  const [admins, setAdmins] = useState<AdminType[]>([]);
  const [loading, setLoading] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [piUsernameInput, setPiUsernameInput] = useState("");

  const t = useTranslations();

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);

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
      setPopupMsg(
        error?.response?.data?.message ??
          "Unable to fetch admins."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const username = piUsernameInput.trim();

    if (!username) return;

    try {
      const result = await createAdmin({
        username,
        role: "admin",
      });

      if (result.success) {
        setAdmins((prev) => {
          const exists = prev.some(
            (admin) => admin.username === result.data.username
          );

          return exists ? prev : [...prev, result.data];
        });

        setPiUsernameInput("");

        onNavbarMessage("Admin added successfully.");

        logger.info("Admin created.", result.data);
      }
    } catch (error: any) {
      logger.error(error);

      setPopupMsg(
        error?.response?.data?.message ??
          "Unable to add admin."
      );
    }
  };

  const handleRemove = async () => {
    const username = piUsernameInput.trim();

    if (!username) return;

    const admin = admins.find(
      (a) => a.username === username
    );

    if (!admin) {
      setPopupMsg("Pioneer is not an admin.");
      return;
    }

    try {
      const result = await deleteAdmin(admin._id);

      if (result.success) {
        setAdmins((prev) =>
          prev.filter((a) => a._id !== admin._id)
        );

        setPiUsernameInput("");

        onNavbarMessage("Admin removed successfully.");
      }
    } catch (error: any) {
      logger.error(error);

      setPopupMsg(
        error?.response?.data?.message ??
          "Unable to remove admin."
      );
    }
  };

  return (
    <div className="w-full h-full" >
      <div className="mb-5">
        <h1 className='font-bold mb-2'>Pioneer username: :</h1>
        <Input
          placeholder="Admin Pi username to be added/removed"
          type="text"
          value={piUsernameInput}
          name="piUsername"
          onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPiUsernameInput(e.target.value)}
        />
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

      {/* Error popup */}
      {popupMsg && (
        <div className="amp-overlay" role="dialog" aria-modal="true">
          <div className="amp-popup">
            <p className="amp-popup__body">{popupMsg}</p>
            <div className="amp-popup__actions">
              <button className="amp-btn amp-btn--outline" onClick={() => setPopupMsg("")}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddVouchersTab() {
  const [membershipList, setMembershipList] = useState<MembershipOption[]>(dummyList);
  const [selectedMembership, setSelectedMembership] = useState<MembershipClassType>(MembershipClassType.GREEN);
  const [recipient, setRecipient]     = useState('');
  const [voucherCode, setVoucherCode] = useState('1xGreenForFree');
  const [validityDays, setValidityDays] = useState<string>('20');
  const [popup, setPopup]             = useState<{
    mode: 'confirm' | 'error';
    message: string;
    alreadyHas?: boolean;
    validUntil?: string;
  } | null>(null);

  const { showAlert, setIsSaveLoading, currentUser, isSaveLoading } = useContext(AppContext);
  const t = useTranslations();

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
      setPopup({ mode: 'error', message: errors.join('\n') });
      return;
    }

    const validUntil = addDays(new Date(), days);
    const tierLabel = membershipList.find(t => t.value === selectedMembership)?.value ?? selectedMembership;


    setPopup({
      mode: 'confirm',
      message: `You're setting up a ${tierLabel} voucher named "${voucherCode}" for pioneer ${recipient.trim()} which must be redeemed by ${formatDateTime(validUntil)}, i.e. within ${days} day${days !== 1 ? 's' : ''}.`,
      validUntil: formatDateTime(validUntil),
    });
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
      }
    setPopup(null);
    showAlert('Voucher saved');
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
      {popup?.mode === 'confirm' && (
        <div className="amp-overlay" role="dialog" aria-modal="true">
          <div className="amp-popup">
            <p className="amp-popup__body">{popup.message}</p>
            {popup.alreadyHas && (
              <p className="amp-popup__warning">
                ⚠️ This pioneer already has this voucher, and it&apos;s unused.
              </p>
            )}
            <div className="amp-popup__actions">
              <button className="amp-btn amp-btn--outline" onClick={() => setPopup(null)}>
                Cancel
              </button>
              <button className="amp-btn amp-btn--primary" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error popup */}
      {popup?.mode === 'error' && (
        <div className="amp-overlay" role="dialog" aria-modal="true">
          <div className="amp-popup">
            <p className="amp-popup__body amp-popup__body--error">{popup.message}</p>
            <div className="amp-popup__actions">
              <button className="amp-btn amp-btn--outline" onClick={() => setPopup(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
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

/**
 * Set `isAdmin` and `isPermanentAdmin` based on your auth context.
 * The page should only be reachable when `isAdmin === true`.
 */
interface AppManagementPageProps {
  isAdmin?: boolean;
  isPermanentAdmin?: boolean;
}

export default function AppManagementPage({
  isAdmin = true,
  isPermanentAdmin = false,
}: AppManagementPageProps) {
  const [selectedTab, setSelectedTab] = useState<TabId>('statistics');
  const [stats, setStats]             = useState<StatsData>(MOCK_STATS);
  const [navMsg, setNavMsg]           = useState<NavbarMessageState>({ text: 'Map of Pi Admin', active: false });
  const navTimerRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNavbarMessage = useCallback((msg: string) => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    setNavMsg({ text: msg, active: true });
    navTimerRef.current = setTimeout(() => {
      setNavMsg({ text: 'Map of Pi Admin', active: false });
    }, 5000);
  }, []);

  useEffect(() => () => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
  }, []);

  // Load statistics on mount
  useEffect(() => () => {   
    if (!isAdmin) return;

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
  }, []);

  if (!isAdmin) {
    return (
      <div className="amp-page">
        <p className="amp-access-denied">You do not have access to this page.</p>
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
        <StatisticsTab stats={stats} />
      )}

      {selectedTab === 'adminregister' && (
        <AdminRegisterTab
          isPermanentAdmin={isPermanentAdmin}
          onNavbarMessage={showNavbarMessage}
        />
      )}

      {selectedTab === 'addvouchers' && (
        <AddVouchersTab />
      )}
    </div>
  );
}