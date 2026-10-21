'use client';

import React, { 
  useContext, 
  useEffect, 
  useRef, 
  useState 
} from 'react';
import TabShuttle, { TabItem } from '@/components/shared/tabShuttle/TabShuttle';
import { fetchMembershipList } from "@/services/membershipApi"
import { 
  AdminType, 
  AppManagerRoleType, 
  IUser, 
  MembershipClassType, 
  MembershipOption 
} from '@/constants/types';
import { 
  dummyList, 
  MOCK_STATS, 
  StatsData, 
  SUBHEADER 
} from '@/constants/mock';
import MembershipIcon from '@/components/shared/membership/MembershipIcon';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/shared/Forms/Inputs/Inputs';
import { Button } from '@/components/shared/Forms/Buttons/Buttons';
import { AppContext } from '../../../../../context/AppContextProvider';
import { addVoucher } from '@/services/voucherApi';
import { fetchSummaryStatistics } from '@/services/appManagerApi';
import { 
  getAppManagers, 
  addAppManager, 
  deleteAppManager 
} from "@/services/appManagerApi";
import { ConfirmDialogX, Notification } from '@/components/shared/confirm';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'statistics' | 'adminregister' | 'addvouchers';
const PERMANENT_ADMINS = new Set(['peejenn', 'swoocn']);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => {
  return n.toLocaleString();
}

const addDays = (date: Date, validity_period: number): Date => {
  const expiry_date = new Date(date);
  expiry_date.setUTCDate(expiry_date.getUTCDate() + validity_period);
  expiry_date.setUTCHours(23, 59, 59, 999);
  return expiry_date;
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
  const [stats, setStats] = useState<StatsData>(MOCK_STATS);
  const t = useTranslations();

  // Load statistics on mount
  useEffect(() => {
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
              'White': result.membershipStats.totalActiveWhiteMembers,
              'Green': result.membershipStats.totalActiveGreenMembers,
              'Gold': result.membershipStats.totalActiveGoldMembers,
              'Double Gold': result.membershipStats.totalActiveDoubleGoldMembers,
              'Triple Gold': result.membershipStats.totalActiveTripleGoldMembers,
            },

            totalMembers: result.membershipStats.totalActiveMembers,
            individualMappi: result.membershipStats.totalActiveMappiBalance,
          });
        }
      } catch (error) {
        setStats(MOCK_STATS);
      }
    };

    loadStats();
  }, [currentUser, isSigningInUser]);

  const rows: [string, number][] = [
    [t('SCREEN.APP_MANAGEMENT.STATISTICS.REGISTERED_USERS'), stats.registeredUsers],
    [t('SCREEN.APP_MANAGEMENT.STATISTICS.SELLERS'),          stats.sellers],
    [t('SCREEN.APP_MANAGEMENT.STATISTICS.REVIEWS'),          stats.reviews],
    [t('SCREEN.APP_MANAGEMENT.STATISTICS.ITEMS_LISTED'),     stats.itemsListed],
    [t('SCREEN.APP_MANAGEMENT.STATISTICS.ORDERS_CREATED'),   stats.ordersCreated],
    [t('SCREEN.APP_MANAGEMENT.STATISTICS.ORDERS_FULFILLED'), stats.ordersFulfilled],
    [t('SCREEN.APP_MANAGEMENT.STATISTICS.ORDERED_ITEMS'),    stats.orderedItems],
  ];

  const membershipRows: [string, number][] = [
    ...Object.entries(stats.membershipTotals) as [string, number][],
    [t('SCREEN.APP_MANAGEMENT.STATISTICS.TOTAL_MEMBERS'),    stats.totalMembers],
    [t('SCREEN.APP_MANAGEMENT.STATISTICS.INDIVIDUAL_MAPPI'), stats.individualMappi],
  ];

  return (
    <div className="w-full h-full">

      <h2 className={SUBHEADER}>{t('SCREEN.APP_MANAGEMENT.STATISTICS.USAGE_NUMBERS')}</h2>
      <StatsTable rows={rows} />

      <h2 className={SUBHEADER}>{t('SCREEN.APP_MANAGEMENT.STATISTICS.CURRENT_MEMBERSHIP_TOTALS')}</h2>
      <StatsTable rows={membershipRows} />

    </div>
  );
}

const AdminRegisterTab = () => {
  const { showAlert, setIsSaveLoading, currentUser, isSigningInUser } = useContext(AppContext);

  const [admins, setAdmins] = useState<AdminType[]>([]);
  const [isPermanentAdmin, setIsPermanentAdmin] = useState<boolean>(false)
  const [piUsernameInput, setPiUsernameInput] = useState("");
  const [showDialog, setShowDialog]  =  useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string> ("");

  const t = useTranslations();

  useEffect(() => {
    if (!currentUser || isSigningInUser) return;

    loadManagers(currentUser);
  }, [currentUser, isSigningInUser]);

  const loadManagers = async (user: IUser) => {
    setIsSaveLoading(true);

    try {
      const result = await getAppManagers({
        page: 1,
        limit: 100,
      });

      if (result.success) {
        const admins: AdminType[] = result.data ?? [];

        setAdmins(admins);

        const admin = admins.find(
          (item) =>
            item.pi_uid === user.pi_uid &&
            item.username === user.pi_username
        );

        setIsPermanentAdmin(admin?.role === AppManagerRoleType.permanentAdmin)
      }
    } catch (error: any) {

      setDialogMessage(
        error?.message ?? t('SCREEN.APP_MANAGEMENT.ADMIN_REGISTER.FETCH_ADMINS_ERROR')
      );
      setShowDialog(true);
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleAdd = async () => {
    const username = piUsernameInput.trim();
    if (!username || !currentUser) return;
    
    setIsSaveLoading(true)

    try {
      const result = await addAppManager({ username });

      if (result.success) {
        setAdmins((prev) => {
          const exists = prev.some(
            (admin) => admin.username === result.data.username
          );
          return exists ? prev : [...prev, result.data];
        });
        setPiUsernameInput("");
        showAlert(t('SCREEN.APP_MANAGEMENT.ADMIN_REGISTER.ADMIN_ADDED'));
      }
    } catch (error: any) {
      setDialogMessage(
        error.message ??
          t('SCREEN.APP_MANAGEMENT.ADMIN_REGISTER.ADD_ADMIN_ERROR')
      );
      setShowDialog(true)
    } finally {
      setIsSaveLoading(false)
    }
  };

  const handleRemove = async () => {
    const username = piUsernameInput.trim();

    if (!username || !currentUser) return;

    const admin = admins.find(
      (a) => a.username === username
    );

    if (!admin) {
      showAlert(t('SCREEN.APP_MANAGEMENT.ADMIN_REGISTER.PIONEER_NOT_ADMIN'));
      return;
    }

    setIsSaveLoading(true)
    try {
      const result = await deleteAppManager(admin._id);

      if (result.success) {
        setAdmins((prev) =>
          prev.filter((a) => a._id !== admin._id)
        );

        setPiUsernameInput("");
        showAlert(result.message || t('SCREEN.APP_MANAGEMENT.ADMIN_REGISTER.ADMIN_REMOVED'));
      }
    } catch (error: any) {
      setDialogMessage(
        error.message ?? t('SCREEN.APP_MANAGEMENT.ADMIN_REGISTER.REMOVE_ADMIN_ERROR')
      );
      setShowDialog(true)
    } finally {
      setIsSaveLoading(false)
    }
  };

  return (
    <div className="w-full h-full">
      <div className="w-full gap-2 mb-5">
        <h1 className="font-bold mb-2">{t('SCREEN.APP_MANAGEMENT.ADMIN_REGISTER.PIONEER_USERNAME_LABEL')}</h1>

        <Input
          placeholder={t('SCREEN.APP_MANAGEMENT.ADMIN_REGISTER.PIONEER_USERNAME_PLACEHOLDER')}
          type="text"
          value={piUsernameInput}
          name="piUsername"
          disabled={!isPermanentAdmin}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPiUsernameInput(e.target.value)
          }
        />
      </div>

      <div className="flex items-center justify-between mb-7">
        <Button
          label={t('SCREEN.APP_MANAGEMENT.ADMIN_REGISTER.ADD')}
          disabled={!isPermanentAdmin || !piUsernameInput.trim()}
          styles={{
            color: "#ffc153",
            height: "40px",
            padding: "10px 15px",
          }}
          onClick={handleAdd}
        />

        <Button
          label={t('SCREEN.APP_MANAGEMENT.ADMIN_REGISTER.REMOVE')}
          disabled={!isPermanentAdmin || !piUsernameInput.trim()}
          styles={{
            color: "#ffc153",
            height: "40px",
            padding: "10px 15px",
          }}
          onClick={handleRemove}
        />
      </div>

      <h1 className="font-bold mb-2">{t('SCREEN.APP_MANAGEMENT.ADMIN_REGISTER.LIST_OF_ADMINS')}</h1>

      <div className="relative border border-primary rounded-lg mb-7 p-4">
        <ul className="amp-admin-list">
          {admins.map((admin) => (
            <li
              key={admin._id}
              className={`amp-admin-list__item${
                PERMANENT_ADMINS.has(admin.username)
                  ? " amp-admin-list__item--permanent"
                  : ""
              }`}
            >
              {admin.username}
            </li>
          ))}
        </ul>
      </div>

      <Notification
        message={dialogMessage}
        showDialog={showDialog}
        setShowDialog={setShowDialog}
      />
    </div>
  );
}

const AddVouchersTab = () => {
  const { showAlert, setIsSaveLoading, currentUser, isSaveLoading } = useContext(AppContext);
  const t = useTranslations();

  const [membershipList, setMembershipList] = useState<MembershipOption[]>(dummyList);
  const [selectedMembership, setSelectedMembership] = useState<MembershipClassType>(MembershipClassType.GREEN);
  const [recipient, setRecipient] = useState('');
  
  const [voucherCode, setVoucherCode] = useState('GreenForFree');
  const [validityDays, setValidityDays] = useState<string>('20');
  const [popup, setPopup] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');

  const handleSave = () => {
    const errors: string[] = [];

    if (!recipient.trim())       errors.push(t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.PIONEER_REQUIRED'));
    if (!voucherCode.trim())     errors.push(t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.VOUCHER_CODE_REQUIRED'));
    if (/\s/.test(voucherCode))  errors.push(t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.VOUCHER_CODE_NO_SPACES'));
    if (!currentUser)            errors.push(t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.UNAUTHORIZED_USER'));

    const days = parseInt(validityDays, 10);
    if (!validityDays || isNaN(days) || days < 1 || days > 20)
      errors.push(t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.VALIDITY_PERIOD_INVALID'));

    if (errors.length > 0) {
      setNotificationMessage( errors.join('\n') );
      setPopup(true);
      return;
    }

    const validUntil = addDays(new Date(), days);
    const tierLabel = membershipList.find(t => t.value === selectedMembership)?.value ?? selectedMembership;

    setNotificationMessage(t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.CONFIRM_MESSAGE', {
      tier: tierLabel,
      voucherCode,
      pioneer: recipient.trim(),
      validUntil: formatDateTime(validUntil),
      days,
      daysLabel: t(`SCREEN.APP_MANAGEMENT.ADD_VOUCHER.${days === 1 ? 'DAY' : 'DAYS'}`),
    }));
    setPopup(true);    
  };

  const handleConfirm = async () => {
    setIsSaveLoading(true);
    try {
      const days = parseInt(validityDays, 10);
      const result = await addVoucher({
        pi_username: recipient,
        voucher_code: voucherCode,
        membership_class: selectedMembership,
        validity_period: days
      });

      if (!result.success) {
        showAlert(result.error || t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.ASSIGN_VOUCHER_ERROR'));
      } else {
        showAlert(t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.VOUCHER_SAVED'));
      }
      
    } catch (error) {
      showAlert(t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.ADD_VOUCHER_ERROR'));
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
        console.error(t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.LOAD_MEMBERSHIP_ERROR'), {error})
      }
    };

    loadMembershipList();
  }, []);

  return (
    <div className="w-full h-full">
      <div className='w-full h-full'>
        <div className="mb-5">
          <Input
            label={t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.PIONEER_USERNAME_LABEL')}
            placeholder={t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.VOUCHER_RECIPIENT_PLACEHOLDER')}
            type="text"
            value={recipient}
            name="piUsername"
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setRecipient(e.target.value)}
          />
        </div>

        <div className="mb-5">
          <Input
            label={t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.VOUCHER_CODE_LABEL')}
            placeholder={t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.VOUCHER_CODE_LABEL')}
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
            label={t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.VALIDITY_PERIOD_LABEL')}
            placeholder={t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.VALIDITY_PERIOD_PLACEHOLDER')}
            type="text"
            value={validityDays}
            name="voucherCode"
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setValidityDays(e.target.value)}
          />
        </div>

        <div className="mb-5 mt-3 flex justify-between">
          <Button
            label={t('SCREEN.APP_MANAGEMENT.ADD_VOUCHER.SAVE')}
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
          message={notificationMessage}
        />
      )}
    </div>
  );
}

// ─── App Management Page ──────────────────────────────────────────────────────

export default function AppManagementPage() {
  const { currentUser } = useContext(AppContext);
  const [selectedTab, setSelectedTab] = useState<TabId>('statistics');
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useTranslations();

  const tabs: TabItem[] = [
    { id: 'statistics',    label: t('SCREEN.APP_MANAGEMENT.TABS.STATISTICS') },
    { id: 'adminregister', label: t('SCREEN.APP_MANAGEMENT.TABS.ADMIN_REGISTER') },
    { id: 'addvouchers',   label: t('SCREEN.APP_MANAGEMENT.TABS.ADD_VOUCHERS') },
  ];

  useEffect(() => () => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
  }, []);

  if (!currentUser) {
    return (
      <div className="amp-page">
        <p className="amp-access-denied">{t('SCREEN.APP_MANAGEMENT.AUTH_REQUIRED')}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full h-min-screen md:w-[500px] md:mx-auto p-4">
      <h1 className='font-bold text-lg md:text-2xl text-center mb-4'>
        {t('SCREEN.APP_MANAGEMENT.HEADER')}
      </h1>

      {/* Tab shuttle */}
      <TabShuttle
        tabs={tabs}
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
