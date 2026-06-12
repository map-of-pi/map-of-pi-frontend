'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import TabShuttle, { TabItem } from '@/components/shared/TabShuttle';
import { fetchMembership, fetchMembershipList } from "@/services/membershipApi"
import { MembershipClassType, MembershipOption } from '@/constants/types';
import { dummyList } from '@/constants/mock';
import MembershipIcon from '@/components/shared/membership/MembershipIcon';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/shared/Forms/Inputs/Inputs';
import Navbar from '@/components/shared/navbar/Navbar';
import { Button } from '@/components/shared/Forms/Buttons/Buttons';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'statistics' | 'adminregister' | 'addvouchers';

type MembershipTier =
  | 'single_mappi'
  | 'white'
  | 'green'
  | 'gold'
  | 'double_gold'
  | 'triple_gold';

interface StatsData {
  registeredUsers: number;
  sellers: number;
  buyers: number;
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
  registeredUsers: 12_847,
  sellers: 3_201,
  buyers: 9_422,
  reviews: 5_110,
  itemsListed: 18_934,
  ordersCreated: 7_654,
  ordersFulfilled: 6_982,
  orderedItems: 24_315,
  membershipTotals: {
    White: 7_201,
    Green: 3_104,
    Gold: 1_522,
    'Double Gold': 688,
    'Triple Gold': 332,
  },
  totalMembers: 12_847,
  individualMappi: 4_209,
};

const MOCK_ADMINS = ['peejenn', 'swoocn', '<xxx>', '<yyy>', '<zzz>'];
const PERMANENT_ADMINS = new Set(['peejenn', 'swoocn']);

const MEMBERSHIP_TIERS: { value: MembershipTier; label: string; icon: string }[] = [
  { value: 'single_mappi',  label: 'Single mappi',        icon: '🟡' },
  { value: 'white',         label: 'White membership',    icon: '⚪' },
  { value: 'green',         label: 'Green membership',    icon: '🟢' },
  { value: 'gold',          label: 'Gold membership',     icon: '🟡' },
  { value: 'double_gold',   label: 'Double gold membership', icon: '🟠' },
  { value: 'triple_gold',   label: 'Triple gold membership', icon: '🔴' },
];

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
    <section className="relative rounded-lg border border-gray-600 mb-7 p-4">
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
    ['Buyers',           stats.buyers],
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
  const [admins, setAdmins] = useState<string[]>(MOCK_ADMINS);
  const [piUsernameInput, setPiUsernameInput] = useState('');
  const [popupMsg, setPopupMsg] = useState<string | null>(null);

  const t = useTranslations();

  const handleAdd = () => {
    const name = piUsernameInput.trim();
    if (!name) return;

    // Validation
    const allUsers = [...admins, 'testuser1', 'testuser2']; // mock user table
    if (!allUsers.includes(name)) {
      setPopupMsg('Pioneer is not a Map of Pi user');
      return;
    }
    if (admins.includes(name)) {
      setPopupMsg('Pioneer is already an admin');
      return;
    }
    setAdmins(prev => [...prev, name]);
    setPiUsernameInput('');
    onNavbarMessage('Admin table updated');
  };

  const handleRemove = () => {
    const name = piUsernameInput.trim();
    if (!name) return;

    if (!admins.includes(name)) {
      setPopupMsg('Pioneer is not an admin');
      return;
    }
    if (PERMANENT_ADMINS.has(name)) {
      setPopupMsg('Pioneer is a permanent admin so cannot be deleted');
      return;
    }
    setAdmins(prev => prev.filter(a => a !== name));
    setPiUsernameInput('');
    onNavbarMessage('Admin table updated');
  };

  return (
    <div className="w-full h-full" >
      <div className="mb-5">
        <Input
          label={"Pioneer username"}
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
          disabled={!isPermanentAdmin || !piUsernameInput.trim()}
          styles={{
            color: '#ffc153',
            height: '40px',
            padding: '10px 15px',
          }}
          onClick={handleAdd}
        />

        <Button
          label="Remove"
          disabled={!isPermanentAdmin || !piUsernameInput.trim()}
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
        className={`relative outline outline-50 outline-gray-600 rounded-lg mb-7 p-4`}
      >
        <ul className="amp-admin-list">
          {admins.map(name => (
            <li key={name} className={`amp-admin-list__item${PERMANENT_ADMINS.has(name) ? ' amp-admin-list__item--permanent' : ''}`}>
              {name}
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
              <button className="amp-btn amp-btn--outline" onClick={() => setPopupMsg(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Add Vouchers Tab ----
interface AddVouchersTabProps {
  onNavbarMessage: (msg: string) => void;
}

function AddVouchersTab({ onNavbarMessage }: AddVouchersTabProps) {
  const [membershipList, setMembershipList] = useState<MembershipOption[]>(dummyList);
  const [selectedMembership, setSelectedMembership] = useState<MembershipClassType>(MembershipClassType.GREEN);
  const [recipient, setRecipient]     = useState('');
  const [piUsernameInput, setPiUsernameInput] = useState<string>("")
  const [voucherCode, setVoucherCode] = useState('GreenForFree');
  const [tier, setTier]               = useState<MembershipTier>('green');
  const [validityDays, setValidityDays] = useState<string>('20');
  const [popup, setPopup]             = useState<{
    mode: 'confirm' | 'error';
    message: string;
    alreadyHas?: boolean;
    validUntil?: string;
  } | null>(null);

  const t = useTranslations();

  const handleSave = () => {
    const errors: string[] = [];

    if (!recipient.trim())       errors.push('Pioneer name is required.');
    if (!voucherCode.trim())     errors.push('Voucher code is required.');
    if (/\s/.test(voucherCode))  errors.push('Voucher code must not contain spaces.');

    const days = parseInt(validityDays, 10);
    if (!validityDays || isNaN(days) || days < 1 || days > 20)
      errors.push('Validity period must be an integer from 1 to 20.');

    // Mock user-exists check
    const knownPioneers = ['peejenn', 'swoocn', 'testuser1'];
    if (recipient.trim() && !knownPioneers.includes(recipient.trim()))
      errors.push(`Pioneer "${recipient.trim()}" is not in the Map of Pi user table.`);

    if (errors.length > 0) {
      setPopup({ mode: 'error', message: errors.join('\n') });
      return;
    }

    const validUntil = addDays(new Date(), days);
    const tierLabel = MEMBERSHIP_TIERS.find(t => t.value === tier)?.label ?? tier;

    // Mock "already has voucher" check
    const alreadyHas = recipient.trim() === 'testuser1' && tier === 'green';

    setPopup({
      mode: 'confirm',
      message: `You're setting up a ${tierLabel} voucher named "${voucherCode}" for pioneer ${recipient.trim()} which must be redeemed by ${formatDateTime(validUntil)}, i.e. within ${days} day${days !== 1 ? 's' : ''}.`,
      alreadyHas,
      validUntil: formatDateTime(validUntil),
    });
  };

  const handleConfirm = () => {
    setPopup(null);
    onNavbarMessage('Voucher saved');
  };

  useEffect(() => {
    const loadMembershipList = async () => { 
      try {
        const subList = await fetchMembershipList();

        setMembershipList(subList!);
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
            value={piUsernameInput}
            name="piUsername"
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPiUsernameInput(e.target.value)}
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
  { id: 'adminregister', label: 'Admin register' },
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
  const [stats]                       = useState<StatsData>(MOCK_STATS);
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
        <AddVouchersTab onNavbarMessage={showNavbarMessage} />
      )}
    </div>
  );
}