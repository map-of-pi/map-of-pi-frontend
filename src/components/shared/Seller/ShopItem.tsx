'use client';

import { useState, SetStateAction, useContext, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { LocaleRouteNormalizer } from "next/dist/server/future/normalizers/locale-route-normalizer";
import Image from "next/image";
import { ConfirmDialogX, Notification } from "../confirm";
import { Button } from "../Forms/Buttons/Buttons";
import { TextArea, Input, FileInput, Select } from "../Forms/Inputs/Inputs";
import { ISeller, PickedItems, SellerItem, ShopItemData, StockLevelType } from "@/constants/types";
import { addOrUpdateSellerItem, deleteSellerItem, fetchSellerItems } from "@/services/sellerApi";
import { resolveDate } from "@/utils/date";
import { getRemainingWeeks } from "@/utils/getSellerItemDuration";
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

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemId = entry.target.getAttribute("data-id");
            if (itemId) setFocusedItemId(itemId);
          }
        });
      },
      { threshold: 0.5 }
    );
    return () => observer.current?.disconnect();
  }, []);

  const handleShopItemRef = (node: HTMLElement | null) => {
    if (node && observer.current) observer.current.observe(node);
  };

  // Fetch seller items once
  useEffect(() => {
    const getSellerItems = async (seller_id: string) => {
      try {
        const items = await fetchSellerItems(seller_id);
        setDbSellerItems(items || []);
      } catch (error) {
        logger.error('Error fetching seller items data:', error);
        setDbSellerItems([]);
      }
    };
    if (dbSeller) getSellerItems(dbSeller.seller_id);
  }, [dbSeller]);

  // Update only the affected item
  const handleUpdateItem = (updatedItem: SellerItem) => {
    setDbSellerItems((prev) => {
      // If new item, add to list
      if (updatedItem && (!updatedItem._id || !prev.some(i => i._id === updatedItem._id))) {
        return [...prev, updatedItem];
      }
      // Otherwise, update in place
      return prev.map((item) => item._id === updatedItem._id ? updatedItem : item);
    });
    setIsNewItem(false);
  };

  // Remove only the affected item
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
          styles={{
            color: '#ffc153',
            height: '40px',
            padding: '10px 15px',
            marginLeft: 'auto',
          }}
        />
      </div>
      <div className="overflow-x-auto p-2 gap-x-5 mb-5 w-full flex">
        {isNewItem && 
          <ShopItem
            key={'new'}
            existinItem={emptyForm}
            isActive={true}
            refCallback={handleShopItemRef} // Attach observer
            setIsAddItemEnabled={setIsAddItemEnabled}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
            setIsNewItem={setIsNewItem}
          /> 
        }
        {dbSellerItems.map((item) => (
          <ShopItem
            key={item._id}
            existinItem={item}
            isActive={focusedItemId === item._id}
            refCallback={handleShopItemRef} // Attach observer
            setIsAddItemEnabled={setIsAddItemEnabled}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
          /> 
        ))            
        }
      </div>
    </>
  );
}

// --- ShopItem: Optimized to call parent handlers ---
export const ShopItem: React.FC<{
  existinItem: SellerItem;
  isActive: boolean;
  refCallback: (node: HTMLElement | null) => void;
  setIsAddItemEnabled: React.Dispatch<SetStateAction<boolean>>;
  onUpdate: (item: SellerItem) => void;
  onDelete: (itemId: string) => void;
  setIsNewItem?: (val: boolean) => void;
}> = ({
  existinItem,
  isActive,
  refCallback,
  setIsAddItemEnabled,
  onUpdate,
  onDelete,
  setIsNewItem,
}) => {
  const locale = useLocale();
  const t = useTranslations();
  
  const [item, setItem] = useState<SellerItem>(existinItem);
  const [formData, setFormData] = useState<ShopItemData>({
    seller_id: item.seller_id || '',
    name: item.name || '',
    description: item.description || '',
    duration: item.duration || 1,
    price: item.price?.$numberDecimal?.toString(),
    image: item.image || '',
    stock_level: item.stock_level || getStockLevelOptions(t)[0].name,
    expired_by: item.expired_by, 
    _id: item._id || ''
  });
  
  const [previewImage, setPreviewImage] = useState<string>(
    formData?.image || '',
  );
  const [showPopup, setShowPopup] = useState(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogueMessage, setDialogueMessage] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const { showAlert, isSaveLoading, setIsSaveLoading } = useContext(AppContext);
  const [sellingStatus, setSellingStatus] = useState('');
  const [formattedDate, setFormattedDate] = useState('');

  // Handle image upload
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]; // only take the first file
    if (selectedFile) {
      setFile(selectedFile);

      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewImage(objectUrl);
      logger.info('Image selected for upload:', { selectedFile });

      setIsAddItemEnabled(true);
    }
  };

  const handleChange = (
    e:
      | React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
      | { name: string; value: string },
  ) => {
    // handle such scenarios where the event might not have the typical e.target structure i.e., PhoneInput.
    const name = 'target' in e ? e.target.name : e.name;
    const value = 'target' in e ? e.target.value : e.value;
    // Create a new object with the updated form data
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);
  
    // enable or disable add item button based on form inputs
    const isFormFilled = Object.values(updatedFormData).some((v) => v !== '');
    setIsAddItemEnabled(isFormFilled);
  };
    
  const handleIncrement = () => {
    const updatedQuantity = parseInt(formData.duration.toString()) + 1;
    setFormData({ ...formData, duration: updatedQuantity });
    setIsAddItemEnabled(true); // Enable add item button
  };
    
  const handleDecrement = () => {
    if ((formData.duration || 0) > 1) {
      const updatedQuantity = parseInt(formData.duration.toString()) - 1;
      setFormData({ ...formData, duration: updatedQuantity });
      setIsAddItemEnabled(true); // Enable add item button
    }
  };

  const handleSave = async () => {
    // Return early if reduced duration is greater than remaining weeks
    const remainingWeeks = getRemainingWeeks(item);
    const reducedDuration = item.duration - formData.duration;

    if (reducedDuration > remainingWeeks) {
      setDialogueMessage(t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.VALIDATION.REDUCED_DURATION_BELOW_SPENT_WEEKS', {
        remaining_weeks: remainingWeeks
      }));
      setShowDialog(true);
      // showAlert(t('SCREEN.SELLER_REGISTRATION.VALIDATION.DURATION_EXCEEDS_LIMIT'));
      return;
    }

    setIsSaveLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('name', removeUrls(formData.name || '').trim());
    formDataToSend.append('_id', formData._id || '');
    formDataToSend.append('description', removeUrls(formData.description || '').trim());
    formDataToSend.append('duration', formData.duration?.toString() || '1');
    formDataToSend.append('seller_id', formData.seller_id || '');
    formDataToSend.append('stock_level', formData.stock_level || '1 available');
    formDataToSend.append('price', parseFloat(formData.price).toFixed(3).toString() || '0.01');

    // Add file if provided
    if (file) {
      formDataToSend.append('image', file);
    }

    try {
      logger.info('Form data being sent:', Object.fromEntries(formDataToSend.entries()));

      // Send data to backend
      const data = await addOrUpdateSellerItem(formDataToSend);

      if (data) {
        setItem(data.sellerItem);
        onUpdate(data.sellerItem);
        setDialogueMessage(t('SCREEN.SELLER_REGISTRATION.VALIDATION.SUCCESSFUL_SAVE_MAPPI_ALLOWANCE_SUFFICIENT', {
            mappi_count: data.consumedMappi
        }));
        setShowDialog(true);
        setIsAddItemEnabled(false);
        showAlert(t('SCREEN.SELLER_REGISTRATION.VALIDATION.SUCCESSFUL_SELLER_ITEM_SAVED'));
        if (setIsNewItem) setIsNewItem(false);
      }
    } catch (error) {
      logger.error('Error saving seller item:', error);
      showAlert(t('SCREEN.SELLER_REGISTRATION.VALIDATION.FAILED_SELLER_ITEM_SAVE'));
      setDialogueMessage("Failed to save item. Check mappi balance and try again");
        setShowDialog(true);
    } finally {
      setIsSaveLoading(false);
    }
  };

  
  const handleDelete = async (item_id: string)=> {
    if (!item_id || item_id ==='') {
      return showAlert(t('SCREEN.SELLER_REGISTRATION.VALIDATION.SELLER_ITEM_NOT_FOUND'));     
    }
      
    try {
      const resp = await deleteSellerItem(item_id);
      if (resp) {
        onDelete(item_id); // Only remove this item in parent state
        setIsAddItemEnabled(false);
        showAlert(t('SCREEN.SELLER_REGISTRATION.VALIDATION.SUCCESSFUL_SELLER_ITEM_DELETED'));
        if (setIsNewItem) setIsNewItem(false);
      }
    } catch (error) {
      logger.error('Error deleting seller item:', error);
      showAlert(t('SCREEN.SELLER_REGISTRATION.VALIDATION.FAILED_SELLER_ITEM_DELETE'));                
    }
  }
  
  useEffect(() => {
    setItem(existinItem);
    setFormData({
      seller_id: existinItem.seller_id || '',
      name: existinItem.name || '',
      description: existinItem.description || '',
      duration: existinItem.duration || 1,
      price: existinItem.price?.$numberDecimal?.toString(),
      image: existinItem.image || '',
      stock_level: existinItem.stock_level || getStockLevelOptions(t)[0].name,
      expired_by: existinItem.expired_by,
      _id: existinItem._id || ''
    });
    if (item?.expired_by) {
      const expiredDate = new Date(item.expired_by);
      const isActive = expiredDate > new Date();
      setSellingStatus(
        isActive 
          ? t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.SELLING_STATUS_OPTIONS.ACTIVE') 
          : t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.SELLING_STATUS_OPTIONS.EXPIRED')
      );

      setFormattedDate(
        new Intl.DateTimeFormat(locale || 'en-US', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }).format(expiredDate)
      );
    }
  }, [existinItem, t]);

  return (
    <>
      <div
        ref={refCallback}
        data-id={item._id} // Add a unique identifier for each item
        className={`relative outline outline-50 outline-gray-600 rounded-lg mb-7 cursor-pointer 
          ${isActive ? '' : 'opacity-50 pointer-events-none'}`}
      >
        <Notification message={dialogueMessage} showDialog={showDialog} setShowDialog={setShowDialog} />
        <div className="p-3">
          <div className="flex gap-x-4">
            <div className="flex-auto w-64">
              <Input
                label={t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.ITEM_LABEL') + ':'}
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={!isActive} // Disable if not active
              />
            </div>
        
            <div className="flex-auto w-32">
              <div className="flex items-center gap-2">
                <Input
                  label={t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.PRICE_LABEL') + ':'}
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={!isActive} // Disable if not active
                />
                <p className="text-gray-500 text-sm">π</p>
              </div>
            </div>
          </div>
          <div className="flex gap-x-4">
            <div className="flex-auto w-64">
              <TextArea
                label={t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.DESCRIPTION_LABEL') + ':'}
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isActive} // Disable if not active
                styles={{ height: '100px' }}
              />
            </div>
            <div className="flex-auto w-32 gap-2">
              <label className="block text-[17px] text-[#333333]">
                {t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PHOTO') + ':'}
              </label>
              <FileInput
                imageUrl={previewImage}
                handleAddImage={handleAddImage}
                height={'h-[100px]'}
                hideCaption={true}
              />
            </div>
          </div>
          <Select
            label={t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.STOCK_LABEL') + ':'}
            name="stock_level"
            value={formData.stock_level}
            onChange={handleChange}
            options={getStockLevelOptions(t)}
            disabled={!isActive}
          />
          <label className="text-[18px] text-[#333333]">
            {t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.SELLING_DURATION_LABEL')}:
          </label>
          <div className="flex items-center gap-4 w-full mt-1">
            <div className="flex gap-2 items-center justify-between mr-4">
              <button
                className={`text-[#ffc153] text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center ${
                  !isActive || formData.duration <= 1 ? `bg-[grey]` : `bg-primary`
                }`}
                onClick={handleDecrement} // Decrement handler
                disabled={!isActive || formData.duration <= 1}
              >
                -
              </button>

              <input
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                className={`p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 text-center focus:border-[#1d724b] border-[2px] max-w-[65px]`}
                disabled={!isActive} // Disable if not active
              />

              <button
                className={`text-[#ffc153] text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center ${
                  !isActive ? `bg-[grey]` : `bg-primary`
                }`}
                onClick={handleIncrement} // Increment handler
                disabled={!isActive}
              >
                +
              </button>
            </div>
            <Button
              label={t('SHARED.DELETE')}
              disabled={!isActive} // Disable if not active
              styles={{
                color: '#ffc153',
                height: '40px',
                padding: '5px 8px',
                width: "100%"
              }}
              onClick={() => setShowPopup(true)}
            />
            <Button
              label={t('SHARED.SAVE')}
              disabled={!isActive || isSaveLoading} // Disable if not active
              styles={{
                color: '#ffc153',
                height: '40px',
                padding: '10px 15px',
                width: "100%"
              }}
              onClick={handleSave}
            />
          </div>
          <div className="mt-3">
            {item?.expired_by && (
              <label className="text-[14px] text-[#333333]">
                <span className="fw-bold text-lg">{sellingStatus}: </span>
                {t('SCREEN.SELLER_REGISTRATION.SELLER_ITEMS_FEATURE.SELLING_EXPIRATION_DATE', {
                  expired_by_date: formattedDate,
                })}
              </label>
            )}
          </div>
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

export const ListItem: React.FC<{
  item: SellerItem;
  pickedItems: PickedItems[],
  setPickedItems:React.Dispatch<SetStateAction<PickedItems[]>>
  totalAmount: number,
  setTotalAmount:React.Dispatch<SetStateAction<number>>
  refCallback: (node: HTMLElement | null) => void;
}> = ({ item, refCallback, setPickedItems, pickedItems=[], totalAmount, setTotalAmount }) => {
  const t = useTranslations();

  const [quantity, setQuantity] = useState<number>(1)

  // Reset quantity when item changes
  useEffect(() => {
    setQuantity(1);
  }, [item]);

  const handlePicked = (itemId: string, price: number): void => {
    setPickedItems((prev) => {
      const existingItem = prev.find((item) => item.itemId === itemId);
      let newTotalAmount = totalAmount;
  
      if (existingItem) {
        // If item exists, remove it
        newTotalAmount -= price * existingItem.quantity;
        setTotalAmount(newTotalAmount);
        return prev.filter((item) => item.itemId !== itemId);
      } else {
        // If item doesn't exist, add it
        const newItem = { itemId, quantity };
        newTotalAmount += price * quantity;
        setTotalAmount(newTotalAmount);
        return [...prev, newItem];
      }
    });
  };

  const quantityLimit = (stockLevel: StockLevelType) => {
    switch (stockLevel) {
      case StockLevelType.available_1:
        return 1;
      case StockLevelType.available_2:
        return 2;
      case StockLevelType.available_3:
        return 3;
      default:
        return 9999; // Default value if no stock level matches
    }
  };
  
  const handleIncrement = () => {
    setQuantity((prev) => Math.min(quantityLimit(item.stock_level), prev + 1));
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const isPicked = pickedItems.find((picked) => picked.itemId === item._id);

  return (
    <div
      ref={refCallback}
      data-id={item._id}
      className={`relative outline outline-50 outline-gray-600 rounded-lg mb-4 ${
        isPicked ? 'bg-yellow-100' : ''
      }`}
    >
      <div className="p-3">
        <div className="flex gap-x-4">
          <div className="flex-auto w-64">
            <Input
              label={t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.ITEM_LABEL') + ':'}
              name="name"
              type="text"
              value={item.name}
              disabled={true}
            />
          </div>

          <div className="flex-auto w-32">
            <div className="flex items-center gap-2">
              <Input
                label={t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PRICE_LABEL') + ':'}
                name="price"
                type="number"
                value={item.price?.$numberDecimal || item.price.toString()}
                disabled={true}
              />
              <p className="text-gray-500 text-sm">π</p>
            </div>
          </div>
        </div>

        <div className="flex gap-x-4">
          <div className="flex-auto w-64">
            <TextArea
              label={t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.DESCRIPTION_LABEL') + ':'}
              name="description"
              value={item.description}
              disabled={true}
              styles={{ maxHeight: '100px' }}
            />
          </div>
          <div className="flex-auto w-32 gap-2">
            <label className="block text-[17px] text-[#333333]">
              {t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PHOTO') + ':'}
            </label>
            <Image
              src={item.image || ''}
              height={50}
              width={50}
              alt="image"
              className={'h-[100px] w-auto'}
            />
          </div>
        </div>

        <label className="text-[18px] text-[#333333]">
          {t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.BUYING_QUANTITY_LABEL')}:
        </label>
        <div className="flex items-center gap-4 w-full mt-1">
          <div className="flex gap-2 items-center justify-between mr-4">
            <button
              className={`text-[#ffc153] text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center ${
                quantity <= 1 || isPicked ? `bg-[grey]` : `bg-primary`
              }`}
              onClick={handleDecrement}
              disabled={isPicked? true : false }
            >
              -
            </button>
            <input
              name="duration"
              type="number"
              value={quantity}
              className="p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 text-center focus:border-[#1d724b] border-[2px] max-w-[65px]"
              disabled={isPicked? true : false}
            />
            <button
              className={`text-[#ffc153] text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center ${
                isPicked ? `bg-[grey]` : `bg-primary`
              }`}
              onClick={handleIncrement}
              disabled={isPicked? true : false} 
            >
              +
            </button>
          </div>

          <Button
            label={isPicked ? 
              t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.UNPICK_LABEL') : 
              t('SCREEN.BUY_FROM_SELLER.ONLINE_SHOPPING.SELLER_ITEMS_FEATURE.PICK_LABEL')}
            styles={{
              color: '#ffc153',
              width: '100%',
            }}
            onClick={() => handlePicked(item._id, parseFloat(item.price.$numberDecimal))}
          />
        </div>
      </div>
    </div>
  );
};
