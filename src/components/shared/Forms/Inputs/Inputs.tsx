import Image from 'next/image';
import { useTranslations } from 'next-intl';

import React from 'react';
import PhoneInput from 'react-phone-number-input'

export const Input = (props: any) => {
  const { label, icon, ...input } = props;

  return (
    <>
      <div className="relative">
        {props.label && (
          <label className="block text-[17px] text-[#333333]">{props.label}</label>
        )}
        <input
          {...input}
          className={`mt-1 p-[10px] block w-full rounded-xl border-[#BDBDBD] bg-transparent outline-0 focus:border-[#1d724b] border-[2px] mb-4`}
        />
        {icon && (
          <div className="absolute right-1 bottom-[4px]">
            <Image src="/images/icons/map-of-pi-icon.png" alt="icon" />
          </div>
        )}
      </div>
    </>
  );
};

export const TelephoneInput = (props: any) => {
  const { label, smartCaret, ...input } = props;
  return (
    <div className="">
      {props.label && (
        <label className="block text-[17px] text-[#333333]">{props.label}</label>
      )}
      <PhoneInput 
        {...input}
        smartCaret={smartCaret}
        className={`flex mt-1 p-[10px] w-full rounded-xl border-[#BDBDBD] bg-transparent outline-0 focus:border-[#1d724b] border-[2px] mb-4`}
      />
    </div>
  );
};

export const TextArea = (props: any) => {
  const { label, describe, ...input } = props;
  return (
    <div className="">
      {label && (
        <label className="block text-[17px] text-[#333333]">{label}</label>
      )}
      {describe && (
        <label className="block text-sm text-gray-400">{describe}</label>
      )}
      <textarea
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e)}
        {...input}
        style={props.styles}
        className="mt-1 p-2 block w-full rounded-xl  border-[#BDBDBD] bg-transparent outline-0 focus:border-[#1d724b] border-[2px] mb-4"></textarea>
    </div>
  );
};

export const FileInput = (props: any) => {
  const t = useTranslations();
  const isEditMode = props.isEditMode ?? false; // default false
  const isImageUploaded = props.imageUrl && props.imageUrl.trim() !== ""; // Check if an image has been uploaded
  
  // Dynamic label logic
  const imageLabel = isEditMode
    ? t('SHARED.PHOTO.MISC_LABELS.EDIT_REVIEW_FEEDBACK_IMAGE_LABEL') // "Update Image" in edit mode
    : isImageUploaded
    ? props.label
    : t('SHARED.PHOTO.UPLOAD_PHOTO_LABEL'); // "Upload Image" in read mode

  return (
    <div className="">
      <label className="block text-[17px] text-[#333333] font-bold">
        {imageLabel}
      </label>
      {props.describe && (
        <label className="block pb-3 text-sm text-gray-400">{props.describe}</label>
      )}
      <div className="flex flex-col items-center justify-center overflow-hidden p-3 rounded-md relative">
        <div className={`w-full ${props.height? props.height: 'h-[200px]'} relative mb-4`}>
          <Image
            src={isImageUploaded ? props.imageUrl : '/images/shared/upload.png'}
            alt="Upload image"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'contain', maxHeight: '200px', maxWidth: '100%' }}
          />
        </div>
        {!props.hideCaption && !isImageUploaded && (
          <div className="text-center text-[#828282]">
            <div>
              {t('SHARED.PHOTO.IMAGE_DROP_UPLOAD_MESSAGE')}
            </div>
            <span className="text-[11px] mt-1">
              {t('SHARED.PHOTO.SUPPORTS_FILE_MESSAGE')}
            </span>
          </div>
        )}
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className={`absolute scale-[5] opacity-0 cursor-pointer`}
          onChange={(e) => props.handleAddImage(e)}
        />
      </div>
    </div>
  );
};

export const Select = (props: any) => {
  return (
    <div className="">
      {props.label && (
        <label className="block text-[17px] text-[#333333] ">{props.label}</label>
      )}
      <select 
        name={props.name} 
        value={props.value}
        onChange={props.onChange} 
        className="mt-1 p-[10px] block w-full rounded-xl border-[#BDBDBD] text-[#333333] outline-0 bg-transparent border-[2px] focus:border-[#1d724b] mb-3"
      >
        {props.options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};
