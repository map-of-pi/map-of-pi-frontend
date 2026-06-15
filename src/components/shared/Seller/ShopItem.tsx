'use client';

import {
  useState,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { ConfirmDialogX, Notification } from '../confirm';
import { Button } from '../Forms/Buttons/Buttons';
import { TextArea, Input, FileInput, Select } from '../Forms/Inputs/Inputs';
import {
  ISeller,
  PickedItems,
  SellerItem,
  ShopItemData,
  StockLevelType,
} from '@/constants/types';
import {
  addOrUpdateSellerItem,
  deleteSellerItem,
  fetchSellerItems,
} from '@/services/sellerApi';
import { getRemainingWeeks } from '@/utils/selleritem';
import removeUrls from '@/utils/sanitize';
import { getStockLevelOptions } from '@/utils/translate';
import { AppContext } from '../../../../context/AppContextProvider';
import logger from '../../../../logger.config.mjs';

// ---------------------------------------------------------------------------
// OnlineShopping (parent)
// ---------------------------------------------------------------------------

export default function OnlineShopping({ dbSeller }: { dbSeller: ISeller }) {
  const t = useTranslations();
  const { userMembership, refreshUserMembership } = useContext(AppContext);

  const [dbSellerItems, setDbSellerItems] = useState<SellerItem[]>([]);
  // True while the new-item card is visible
  const [isAddingNew, setIsAddingNew] = useState(false);
  // Which card is scrolled into view
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  // IntersectionObserver – tracks which card is centred in the scroll view
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemId = entry.target.getAttribute('data-id');
            if (itemId) setFocusedItemId(itemId);
          }
        });
      },
      { threshold: 0.5 }
    );
    return () => observer.current?.disconnect();
  }, []);

  const handleShopItemRef = useCallback((node: HTMLElement | null) => {
    if (node && observer.current) observer.current.observe(node);
  }, []);

  // Fetch seller items once on mount
  useEffect(() => {
    if (!dbSeller) return;
    const load = async () => {
      try {
        const items = await fetchSellerItems(dbSeller.seller_id);
        setDbSellerItems(items || []);
      } catch (error) {
        logger.error('Error fetching seller items data:', error);
        setDbSellerItems([]);
      }
    };
    load();
  }, [dbSeller]);

  // Called by ShopItem after a successful save
  const handleUpdateItem = useCallback(
    (updatedItem: SellerItem) => {
      setDbSellerItems((prev) => {
        const exists = prev.some((i) => i._id === updatedItem._id);
        return exists
          ? prev.map((i) => (i._id === updatedItem._id ? updatedItem : i))
          : [...prev, updatedItem];
      });
      setIsAddingNew(false);
      // Re-fetch membership so mappi_balance reflects the deduction
      refreshUserMembership?.();
    },
    [refreshUserMembership]
  );

  // Called by ShopItem after a successful delete
  const handleDeleteItem = useCallback(
    (itemId: string) => {
      setDbSellerItems((prev) => prev.filter((i) => i._id !== itemId));
      setIsAddingNew(false);
      refreshUserMembership?.();
    },
    [refreshUserMembership]
  );

  const emptyForm: SellerItem = {
    seller_id: dbSeller.seller_id as string,
    name: '',
    _id: '',
    duration: 1,
    price: { $numberDecimal: '0.01' },
    description: '',
    image: '',
    stock_level: StockLevelType.available_1,
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-gray-500 text-lg">
          {t('SCREEN.SELLER_REGISTRATION.MAPPI_ALLOWANCE_LABEL')}:{' '}
          {userMembership?.mappi_balance ?? '—'}
        </h2>
        <Button
          label={t('SHARED.ADD_ITEM')}
          // Disable while a new-item card is already open
          disabled={isAddingNew}
          onClick={() => setIsAddingNew(true)}
          styles={{
            color: '#ffc153',
            height: '40px',
            padding: '10px 15px',
          }}
        />
      </div>

      <div className="overflow-x-auto p-2 gap-x-5 mb-5 w-full flex">
        {isAddingNew && (
          <ShopItem
            key="new"
            existingItem={emptyForm}
            isActive={true}
            refCallback={handleShopItemRef}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
            onCancelNew={() => setIsAddingNew(false)}
          />
        )}
        {dbSellerItems.map((item) => (
          <ShopItem
            key={item._id}
            existingItem={item}
            isActive={focusedItemId === item._id || dbSellerItems.length === 1}
            refCallback={handleShopItemRef}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the projected Mappi balance change for the given duration edit.
 *
 * Mirrors backend resolveDurationChange semantics:
 *  - New item:            positive cost = ceil(duration)
 *  - Existing, extended:  positive cost = added weeks
 *  - Existing, reduced:   negative value = refunded weeks (capped by remaining weeks)
 *  - No change:           0
 */
export function previewMappiCost(
  existingItem: SellerItem,
  newDuration: number
): number {
  const isNew = !existingItem._id;
  const isExpired =
    !!existingItem.expired_by && new Date(existingItem.expired_by) < new Date();

  // New items AND expired items are relists: full duration is charged, no refund.
  if (isNew || isExpired) {
    return Math.max(1, Math.ceil(newDuration));
  }

  const prevDuration = existingItem.duration ?? 0;
  const delta = newDuration - prevDuration;

  if (delta === 0) return 0;
  if (delta > 0) return Math.ceil(delta); // cost

  // Reduction → refund preview (backend clamps to remaining weeks)
  return delta;
}

// ---------------------------------------------------------------------------
// ShopItem
// ---------------------------------------------------------------------------

export const ShopItem: React.FC<{
  existingItem: SellerItem;
  isActive: boolean;
  refCallback: (node: HTMLElement | null) => void;
  onUpdate: (item: SellerItem) => void;
  onDelete: (itemId: string) => void;
  onCancelNew?: () => void;
}> = ({ existingItem, isActive, refCallback, onUpdate, onDelete, onCancelNew }) => {
  const locale = useLocale();
  const t = useTranslations();
  const { showAlert, isSaveLoading, setIsSaveLoading } = useContext(AppContext);

  // Derive initial form state from existingItem
  const initialFormData = useCallback(
    (src: SellerItem): ShopItemData => ({
      seller_id: src.seller_id || '',
      name: src.name || '',
      description: src.description || '',
      duration: src.duration || 1,
      price: src.price?.$numberDecimal?.toString() ?? '0.01',
      image: src.image || '',
      stock_level: src.stock_level || getStockLevelOptions(t)[0].name,
      expired_by: src.expired_by,
      _id: src._id || '',
    }),
    [t]
  );

  const [formData, setFormData] = useState<ShopItemData>(() =>
    initialFormData(existingItem)
  );
  const [previewImage, setPreviewImage] = useState<string>(
    existingItem.image || ''
  );
  const [showPopup, setShowPopup] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogueMessage, setDialogueMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  // True when any field has been changed from the saved state
  const [isDirty, setIsDirty] = useState(false);

  // ---- Derived display values (no stale-item risk) -----------------------

  const sellingStatus = useMemo(() => {
    if (!existingItem.expired_by) return '';
    const isActive = new Date(existingItem.expired_by) > new Date();
    return isActive
      ? t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.SELLING_STATUS_OPTIONS.ACTIVE')
      : t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.SELLING_STATUS_OPTIONS.EXPIRED');
  }, [existingItem.expired_by, t]);

  const formattedDate = useMemo(() => {
    if (!existingItem.expired_by) return '';
    return new Intl.DateTimeFormat(locale || 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date(existingItem.expired_by));
  }, [existingItem.expired_by, locale]);

  // Mappi cost preview — reacts immediately to duration changes
  const mappiCostPreview = useMemo(
    () => previewMappiCost(existingItem, formData.duration),
    [existingItem, formData.duration]
  );

  // Re-sync form when existingItem identity changes (e.g. after parent re-fetches)
  useEffect(() => {
    setFormData(initialFormData(existingItem));
    setPreviewImage(existingItem.image || '');
    setIsDirty(false);
    setFile(null);
  }, [existingItem, initialFormData]);

  // ---- Handlers ----------------------------------------------------------

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreviewImage(URL.createObjectURL(selectedFile));
    setIsDirty(true);
    logger.info('Image selected for upload:', { selectedFile });
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | { name: string; value: string }
  ) => {
    const name = 'target' in e ? e.target.name : e.name;
    const value = 'target' in e ? e.target.value : e.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleIncrement = () => {
    setFormData((prev) => ({
      ...prev,
      duration: (parseInt(prev.duration.toString()) || 1) + 1,
    }));
    setIsDirty(true);
  };

  const handleDecrement = () => {
    setFormData((prev) => {
      const current = parseInt(prev.duration.toString()) || 1;
      return current > 1 ? { ...prev, duration: current - 1 } : prev;
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    // Validate: can't reduce duration below remaining weeks
    const remainingWeeks = getRemainingWeeks(existingItem);
    const reducedDuration = existingItem.duration - formData.duration;

    if (reducedDuration > remainingWeeks) {
      setDialogueMessage(
        t(
          'SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.VALIDATION.REDUCED_DURATION_BELOW_REMAINING_WEEKS',
          { remaining_weeks: remainingWeeks }
        )
      );
      setShowDialog(true);
      return;
    }
    
    if (formData.duration < 1) {
      setDialogueMessage(
        t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.VALIDATION.DURATION_MINIMUM')
      );
      setShowDialog(true);
      return;
    }

    setIsSaveLoading(true);

    const payload = new FormData();
    payload.append('name', removeUrls(formData.name || '').trim());
    payload.append('_id', formData._id || '');
    payload.append('description', removeUrls(formData.description || '').trim());
    payload.append('duration', formData.duration?.toString() || '1');
    payload.append('seller_id', formData.seller_id || '');
    payload.append('stock_level', formData.stock_level || '1 available');
    payload.append(
      'price',
      parseFloat(formData.price).toFixed(3) || '0.010'
    );
    if (file) payload.append('image', file);

    try {
      logger.info('Saving seller item:', Object.fromEntries(payload.entries()));
      const data = await addOrUpdateSellerItem(payload);

      if (data) {
        onUpdate(data.sellerItem);
        setIsDirty(false);
        setDialogueMessage(
          t(
            'SCREEN.SELLER_REGISTRATION.VALIDATION.SUCCESSFUL_SAVE_MAPPI_ALLOWANCE_SUFFICIENT',
            { mappi_count: data.consumedMappi }
          )
        );
        setShowDialog(true);
        showAlert(
          t('SCREEN.SELLER_REGISTRATION.VALIDATION.SUCCESSFUL_SELLER_ITEM_SAVED')
        );
        onCancelNew?.();
      }
    } catch (error) {
      logger.error('Error saving seller item:', error);
      showAlert(
        t('SCREEN.SELLER_REGISTRATION.VALIDATION.FAILED_SELLER_ITEM_SAVE')
      );
      setDialogueMessage(
        t(
          'SCREEN.SELLER_REGISTRATION.VALIDATION.FAILED_SAVE_MAPPI_ALLOWANCE_INSUFFICIENT'
        )
      );
      setShowDialog(true);
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleDelete = async (item_id: string) => {
    if (!item_id) {
      showAlert(
        t('SCREEN.SELLER_REGISTRATION.VALIDATION.SELLER_ITEM_NOT_FOUND')
      );
      return;
    }
    try {
      const resp = await deleteSellerItem(item_id);
      if (resp) {
        onDelete(item_id);
        showAlert(
          t('SCREEN.SELLER_REGISTRATION.VALIDATION.SUCCESSFUL_SELLER_ITEM_DELETED')
        );
        onCancelNew?.();
      }
    } catch (error) {
      logger.error('Error deleting seller item:', error);
      showAlert(
        t('SCREEN.SELLER_REGISTRATION.VALIDATION.FAILED_SELLER_ITEM_DELETE')
      );
    }
  };

  const isNewItem = !existingItem._id;

  return (
    <>
      <div
        ref={refCallback}
        data-id={existingItem._id || 'new'}
        className={`relative outline outline-50 outline-gray-600 rounded-lg mb-7 cursor-pointer ${
          isActive ? '' : 'opacity-50 pointer-events-none'
        }`}
      >
        <Notification
          message={dialogueMessage}
          showDialog={showDialog}
          setShowDialog={setShowDialog}
        />

        <div className="p-3">
          {/* Name + Price */}
          <div className="flex gap-x-4">
            <div className="flex-auto w-64">
              <Input
                label={
                  t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.ITEM_LABEL') + ':'
                }
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={!isActive}
              />
            </div>
            <div className="flex-auto w-32">
              <div className="flex items-center gap-2">
                <Input
                  label={
                    t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.PRICE_LABEL') + ':'
                  }
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={!isActive}
                />
                <p className="text-gray-500 text-sm">Pi</p>
              </div>
            </div>
          </div>

          {/* Description + Image */}
          <div className="flex gap-x-4">
            <div className="flex-auto w-64">
              <TextArea
                label={
                  t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.DESCRIPTION_LABEL') +
                  ':'
                }
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isActive}
                styles={{ height: '100px' }}
              />
            </div>
            <div className="flex-auto w-32 gap-2">
              <label className="block text-[17px] text-[#333333]">
                {t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PHOTO') +
                  ':'}
              </label>
              <FileInput
                imageUrl={previewImage}
                handleAddImage={handleAddImage}
                height="h-[100px]"
                hideCaption={true}
              />
            </div>
          </div>

          {/* Stock level */}
          <Select
            label={
              t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.STOCK_LABEL') + ':'
            }
            name="stock_level"
            value={formData.stock_level}
            onChange={handleChange}
            options={getStockLevelOptions(t)}
            disabled={!isActive}
          />

          {/* Duration stepper */}
          <label className="text-[18px] text-[#333333]">
            {t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.SELLING_DURATION_LABEL')}:
          </label>
          <div className="flex items-center gap-4 w-full mt-1">
            <div className="flex gap-2 items-center justify-between mr-4">
              <button
                className={`text-[#ffc153] text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center ${
                  !isActive || formData.duration <= 1 ? 'bg-[grey]' : 'bg-primary'
                }`}
                onClick={handleDecrement}
                disabled={!isActive || formData.duration <= 1}
              >
                -
              </button>
              <input
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                className="p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 text-center focus:border-[#1d724b] border-[2px] max-w-[65px]"
                disabled={!isActive}
              />
              <button
                className={`text-[#ffc153] text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center ${
                  !isActive ? 'bg-[grey]' : 'bg-primary'
                }`}
                onClick={handleIncrement}
                disabled={!isActive}
              >
                +
              </button>
            </div>

            <Button
              label={t('SHARED.DELETE')}
              disabled={!isActive || isNewItem}
              styles={{ color: '#ffc153', height: '40px', padding: '5px 8px', width: '100%' }}
              onClick={() => setShowPopup(true)}
            />
            <Button
              label={t('SHARED.SAVE')}
              disabled={!isActive || isSaveLoading || !isDirty}
              styles={{ color: '#ffc153', height: '40px', padding: '10px 15px', width: '100%' }}
              onClick={handleSave}
            />
          </div>

          {/* Mappi cost / refund preview */}
          {isActive && isDirty && mappiCostPreview !== 0 && (
            <p className="mt-2 text-sm text-amber-600">
              {mappiCostPreview > 0
                ? t(
                    'SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.MAPPI_COST_PREVIEW',
                    { mappi_count: mappiCostPreview }
                  )
                : t(
                    'SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.MAPPI_REFUND_PREVIEW',
                    { mappi_count: Math.abs(mappiCostPreview) }
                  )}
            </p>
          )}

          {/* Expiry status */}
          {existingItem.expired_by && (
            <div className="mt-3">
              <label className="text-[14px] text-[#333333]">
                <span className="fw-bold text-lg">{sellingStatus}: </span>
                {t(
                  'SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.SELLING_EXPIRATION_DATE',
                  { expired_by_date: formattedDate }
                )}
              </label>
            </div>
          )}
        </div>
      </div>

      {showPopup && (
        <ConfirmDialogX
          toggle={() => setShowPopup(false)}
          handleClicked={() => handleDelete(formData._id)}
          message={t('SHARED.CONFIRM_DELETE')}
        />
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// ListItem  (buyer-side read-only card)
// ---------------------------------------------------------------------------

export const ListItem: React.FC<{
  item: SellerItem;
  pickedItems: PickedItems[];
  setPickedItems: React.Dispatch<SetStateAction<PickedItems[]>>;
  totalAmount: number;
  setTotalAmount: React.Dispatch<SetStateAction<number>>;
  refCallback: (node: HTMLElement | null) => void;
}> = ({ item, refCallback, setPickedItems, pickedItems = [], totalAmount, setTotalAmount }) => {
  const t = useTranslations();
  const [quantity, setQuantity] = useState<number>(1);

  // Reset quantity when the item shown changes
  useEffect(() => {
    setQuantity(1);
  }, [item._id]);

  const isPicked = useMemo(
    () => pickedItems.some((p) => p.itemId === item._id),
    [pickedItems, item._id]
  );

  const itemPrice = useMemo(
    () => parseFloat(item.price?.$numberDecimal ?? item.price?.toString() ?? '0'),
    [item.price]
  );

  const handlePicked = (itemId: string) => {
    setPickedItems((prev) => {
      const existing = prev.find((p) => p.itemId === itemId);

      if (existing) {
        // Remove: subtract what was actually added at pick time
        setTotalAmount((t) => parseFloat((t - itemPrice * existing.quantity).toFixed(8)));
        return prev.filter((p) => p.itemId !== itemId);
      }

      // Add: use the current local quantity
      setTotalAmount((t) => parseFloat((t + itemPrice * quantity).toFixed(8)));
      return [...prev, { itemId, quantity }];
    });
  };

  const maxQuantity = useMemo(() => {
    switch (item.stock_level) {
      case StockLevelType.available_1: return 1;
      case StockLevelType.available_2: return 2;
      case StockLevelType.available_3: return 3;
      default: return 9999;
    }
  }, [item.stock_level]);

  const handleIncrement = () =>
    setQuantity((prev) => Math.min(maxQuantity, prev + 1));

  const handleDecrement = () =>
    setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <div
      ref={refCallback}
      data-id={item._id}
      className={`relative outline outline-50 outline-gray-600 rounded-lg mb-4 ${
        isPicked ? 'bg-yellow-100' : ''
      }`}
    >
      <div className="p-3">
        {/* Name + Price */}
        <div className="flex gap-x-4">
          <div className="flex-auto w-64">
            <Input
              label={
                t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.ITEM_LABEL') +
                ':'
              }
              name="name"
              type="text"
              value={item.name}
              disabled={true}
            />
          </div>
          <div className="flex-auto w-32">
            <div className="flex items-center gap-2">
              <Input
                label={
                  t(
                    'SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PRICE_LABEL'
                  ) + ':'
                }
                name="price"
                type="number"
                value={item.price?.$numberDecimal ?? item.price?.toString()}
                disabled={true}
              />
              <p className="text-gray-500 text-sm">π</p>
            </div>
          </div>
        </div>

        {/* Description + Image */}
        <div className="flex gap-x-4">
          <div className="flex-auto w-64">
            <TextArea
              label={
                t(
                  'SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.DESCRIPTION_LABEL'
                ) + ':'
              }
              name="description"
              value={item.description}
              disabled={true}
              styles={{ maxHeight: '100px' }}
            />
          </div>
          <div className="flex-auto w-32 gap-2">
            <label className="block text-[17px] text-[#333333]">
              {t(
                'SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PHOTO'
              ) + ':'}
            </label>
            <Image
              src={item.image || ''}
              height={50}
              width={50}
              alt={item.name || 'item image'}
              className="h-[100px] w-auto"
            />
          </div>
        </div>

        {/* Quantity stepper */}
        <label className="text-[18px] text-[#333333]">
          {t(
            'SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.BUYING_QUANTITY_LABEL'
          )}
          :
        </label>
        <div className="flex items-center gap-4 w-full mt-1">
          <div className="flex gap-2 items-center justify-between mr-4">
            <button
              className={`text-[#ffc153] text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center ${
                quantity <= 1 || isPicked ? 'bg-[grey]' : 'bg-primary'
              }`}
              onClick={handleDecrement}
              disabled={isPicked || quantity <= 1}
            >
              -
            </button>
            <input
              name="quantity"
              type="number"
              value={quantity}
              readOnly
              className="p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 text-center focus:border-[#1d724b] border-[2px] max-w-[65px]"
              disabled={isPicked}
            />
            <button
              className={`text-[#ffc153] text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center ${
                isPicked || quantity >= maxQuantity ? 'bg-[grey]' : 'bg-primary'
              }`}
              onClick={handleIncrement}
              disabled={isPicked || quantity >= maxQuantity}
            >
              +
            </button>
          </div>

          <Button
            label={
              isPicked
                ? t(
                    'SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.UNPICK_LABEL'
                  )
                : t(
                    'SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PICK_LABEL'
                  )
            }
            styles={{ color: '#ffc153', width: '100%' }}
            onClick={() => handlePicked(item._id)}
          />
        </div>
      </div>
    </div>
  );
};
