'use client';

import { useState, SetStateAction, useContext, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { ConfirmDialogX, Notification } from "../confirm";
import { Button } from "../Forms/Buttons/Buttons";
import { TextArea, Input, FileInput, Select } from "../Forms/Inputs/Inputs";
import { ISeller, PickedItems, SellerItem, ShopItemData, StockLevelType } from "@/constants/types";
import { addOrUpdateSellerItem, deleteSellerItem, fetchSellerItems } from "@/services/sellerApi";
import { getRemainingWeeks } from "@/utils/selleritem";
import removeUrls from "@/utils/sanitize";
import { getStockLevelOptions } from "@/utils/translate";
import { AppContext } from "../../../../context/AppContextProvider";
import logger from '../../../../logger.config.mjs';

export default function OnlineShopping({ dbSeller }: { dbSeller: ISeller }) {
  const t = useTranslations();
  const [dbSellerItems, setDbSellerItems] = useState<SellerItem[]>([]);
  const [isAddItemEnabled, setIsAddItemEnabled] = useState(false);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [isNewItem, setIsNewItem] = useState<boolean>(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  // Optimized observer to handle both focus and infinite scroll
  const handleShopItemRef = useCallback((node: HTMLElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const itemId = entries[0].target.getAttribute("data-id");
        if (itemId) setFocusedItemId(itemId);

        // Trigger pagination if it's the last item
        const isLastItem = entries[0].target.getAttribute("data-last") === "true";
        if (isLastItem && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    }, { threshold: 0.5 });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  // Fetch items with pagination support
  const getSellerItems = async (seller_id: string, currentPage: number) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // fetchSellerItems updated in service to accept (id, page, limit)
      const data = await fetchSellerItems(seller_id, currentPage, 10); 
      
      const newItems = data?.docs || data || []; // Handle both paginated and legacy response
      const totalPages = data?.totalPages || 1;

      setDbSellerItems((prev) => currentPage === 1 ? newItems : [...prev, ...newItems]);
      setHasMore(currentPage < totalPages);
      
      logger.info(`Fetched page ${currentPage} for seller ${seller_id}`);
    } catch (error) {
      logger.error('Error fetching seller items data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dbSeller?.seller_id) {
      getSellerItems(dbSeller.seller_id, page);
    }
  }, [dbSeller?.seller_id, page]);

  const handleUpdateItem = (updatedItem: SellerItem) => {
    setDbSellerItems((prev) => {
      if (updatedItem && (!updatedItem._id || !prev.some(i => i._id === updatedItem._id))) {
        return [updatedItem, ...prev]; // Add new items to start
      }
      return prev.map((item) => item._id === updatedItem._id ? updatedItem : item);
    });
    setIsNewItem(false);
  };

  const handleDeleteItem = (itemId: string) => {
    setDbSellerItems((prev) => prev.filter((item) => item._id !== itemId));
    setIsNewItem(false);
  };

  const emptyForm: SellerItem = {
    seller_id: dbSeller.seller_id as string,
    name: "",
    _id: "",
    duration: 1,
    price: {$numberDecimal: '0.01'},
    description: "",
    image: "",
    stock_level: StockLevelType.available_1,
  };

  return (
    <>        
      <div className="mb-4">
        <h2 className='text-gray-500 text-lg'>
          {t('SCREEN.SELLER_REGISTRATION.MAPPI_ALLOWANCE_LABEL')}: 999
        </h2>
        <Button
          label={t('SHARED.ADD_ITEM')}
          disabled={isAddItemEnabled}
          onClick={() => setIsNewItem(true)}
          styles={{ color: '#ffc153', height: '40px', padding: '10px 15px', marginLeft: 'auto' }}
        />
      </div>
      <div className="overflow-x-auto p-2 gap-x-5 mb-5 w-full flex">
        {isNewItem && 
          <ShopItem
            key={'new'}
            existingItem={emptyForm}
            isActive={true}
            refCallback={handleShopItemRef}
            setIsAddItemEnabled={setIsAddItemEnabled}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
            setIsNewItem={setIsNewItem}
          /> 
        }
        {dbSellerItems.map((item, index) => (
          <ShopItem
            key={item._id || index}
            existingItem={item}
            isActive={focusedItemId === item._id}
            refCallback={handleShopItemRef}
            setIsAddItemEnabled={setIsAddItemEnabled}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
            isLast={index === dbSellerItems.length - 1} // Mark for pagination
          /> 
        ))}
        {isLoading && <div className="p-4 self-center text-gray-400">Loading...</div>}
      </div>
    </>
  );
}

// --- ShopItem Component (Same structure, added isLast prop) ---
export const ShopItem: React.FC<{
  existingItem: SellerItem;
  isActive: boolean;
  refCallback: (node: HTMLElement | null) => void;
  setIsAddItemEnabled: React.Dispatch<SetStateAction<boolean>>;
  onUpdate: (item: SellerItem) => void;
  onDelete: (itemId: string) => void;
  setIsNewItem?: (val: boolean) => void;
  isLast?: boolean; 
}> = ({
  existingItem, isActive, refCallback, setIsAddItemEnabled, onUpdate, onDelete, setIsNewItem, isLast
}) => {
  const locale = useLocale();
  const t = useTranslations();
  
  const [item, setItem] = useState<SellerItem>(existingItem);
  const [formData, setFormData] = useState<ShopItemData>({
    seller_id: item.seller_id || '',
    name: item.name || '',
    description: item.description || '',
    duration: item.duration || 1,
    price: item.price?.$numberDecimal?.toString() || '0.01',
    image: item.image || '',
    stock_level: item.stock_level || getStockLevelOptions(t)[0].name,
    expired_by: item.expired_by, 
    _id: item._id || ''
  });
  
  const [previewImage, setPreviewImage] = useState<string>(formData?.image || '');
  const [showPopup, setShowPopup] = useState(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogueMessage, setDialogueMessage] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const { showAlert, isSaveLoading, setIsSaveLoading } = useContext(AppContext);
  const [sellingStatus, setSellingStatus] = useState('');
  const [formattedDate, setFormattedDate] = useState('');

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
      setIsAddItemEnabled(true);
    }
  };

  const handleChange = (e: any) => {
    const name = 'target' in e ? e.target.name : e.name;
    const value = 'target' in e ? e.target.value : e.value;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    setIsAddItemEnabled(Object.values(updatedFormData).some((v) => v !== ''));
  };
    
  const handleIncrement = () => setFormData(prev => ({ ...prev, duration: Number(prev.duration) + 1 }));
  const handleDecrement = () => formData.duration > 1 && setFormData(prev => ({ ...prev, duration: Number(prev.duration) - 1 }));

  const handleSave = async () => {
    const remainingWeeks = getRemainingWeeks(item);
    if ((item.duration - formData.duration) > remainingWeeks) {
      setDialogueMessage(t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.VALIDATION.REDUCED_DURATION_BELOW_REMAINING_WEEKS', { remaining_weeks: remainingWeeks }));
      setShowDialog(true);
      return;
    }

    setIsSaveLoading(true);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'image') formDataToSend.append(key, value?.toString() || '');
    });
    if (file) formDataToSend.append('image', file);

    try {
      const data = await addOrUpdateSellerItem(formDataToSend);
      if (data) {
        setItem(data.sellerItem);
        onUpdate(data.sellerItem);
        setDialogueMessage(t('SCREEN.SELLER_REGISTRATION.VALIDATION.SUCCESSFUL_SAVE_MAPPI_ALLOWANCE_SUFFICIENT', { mappi_count: data.consumedMappi }));
        setShowDialog(true);
        setIsAddItemEnabled(false);
        if (setIsNewItem) setIsNewItem(false);
      }
    } catch (error) {
      logger.error('Save failed:', error);
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleDelete = async (item_id: string)=> {
    if (!item_id) return showAlert(t('SCREEN.SELLER_REGISTRATION.VALIDATION.SELLER_ITEM_NOT_FOUND'));
    try {
      if (await deleteSellerItem(item_id)) {
        onDelete(item_id);
        setIsAddItemEnabled(false);
        if (setIsNewItem) setIsNewItem(false);
      }
    } catch (error) { logger.error('Delete failed:', error); }
  };
  
  useEffect(() => {
    if (item?.expired_by) {
      const expiredDate = new Date(item.expired_by);
      setSellingStatus(expiredDate > new Date() ? t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.SELLING_STATUS_OPTIONS.ACTIVE') : t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.SELLING_STATUS_OPTIONS.EXPIRED'));
      setFormattedDate(new Intl.DateTimeFormat(locale || 'en-US', { day: '2-digit', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }).format(expiredDate));
    }
  }, [item, locale, t]);

  return (
    <>
      <div
        ref={refCallback}
        data-id={item._id}
        data-last={isLast ? "true" : "false"} // Attribute for intersection observer logic
        className={`relative outline outline-50 outline-gray-600 rounded-lg mb-7 cursor-pointer min-w-[320px] 
          ${isActive ? '' : 'opacity-50 pointer-events-none'}`}
      >
        <Notification message={dialogueMessage} showDialog={showDialog} setShowDialog={setShowDialog} />
        <div className="p-3">
          <div className="flex gap-x-4">
            <div className="flex-auto w-64"><Input label={t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.ITEM_LABEL') + ':'} name="name" value={formData.name} onChange={handleChange} disabled={!isActive} /></div>
            <div className="flex-auto w-32"><div className="flex items-center gap-2"><Input label={t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.PRICE_LABEL') + ':'} name="price" type="number" value={formData.price} onChange={handleChange} disabled={!isActive} /><p className="text-gray-500 text-sm">π</p></div></div>
          </div>
          <div className="flex gap-x-4">
            <div className="flex-auto w-64"><TextArea label={t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.DESCRIPTION_LABEL') + ':'} name="description" value={formData.description} onChange={handleChange} disabled={!isActive} styles={{ height: '100px' }} /></div>
            <div className="flex-auto w-32 gap-2"><label className="block text-[17px] text-[#333333]">{t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PHOTO') + ':'}</label><FileInput imageUrl={previewImage} handleAddImage={handleAddImage} height={'h-[100px]'} hideCaption={true} /></div>
          </div>
          <Select label={t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.STOCK_LABEL') + ':'} name="stock_level" value={formData.stock_level} onChange={handleChange} options={getStockLevelOptions(t)} disabled={!isActive} />
          <div className="flex items-center gap-4 w-full mt-1">
            <div className="flex gap-2 items-center justify-between mr-4">
              <button className={`text-[#ffc153] text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center ${!isActive || formData.duration <= 1 ? `bg-[grey]` : `bg-primary`}`} onClick={handleDecrement} disabled={!isActive || formData.duration <= 1}>-</button>
              <input name="duration" type="number" value={formData.duration} onChange={handleChange} className="p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 text-center focus:border-[#1d724b] border-[2px] max-w-[65px]" disabled={!isActive} />
              <button className={`text-[#ffc153] text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center ${!isActive ? `bg-[grey]` : `bg-primary`}`} onClick={handleIncrement} disabled={!isActive}>+</button>
            </div>
            <Button label={t('SHARED.DELETE')} disabled={!isActive} styles={{ color: '#ffc153', height: '40px', width: "100%" }} onClick={() => setShowPopup(true)} />
            <Button label={t('SHARED.SAVE')} disabled={!isActive || isSaveLoading} styles={{ color: '#ffc153', height: '40px', width: "100%" }} onClick={handleSave} />
          </div>
          {item?.expired_by && <div className="mt-3"><label className="text-[14px] text-[#333333]"><span className="fw-bold text-lg">{sellingStatus}: </span>{t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.SELLING_EXPIRATION_DATE', { expired_by_date: formattedDate })}</label></div>}
        </div>
      </div>
      {showPopup && <ConfirmDialogX toggle={() => setShowPopup(false)} handleClicked={() => handleDelete(formData._id)} message={t('SHARED.CONFIRM_DELETE')} />}
    </>
  );
};
