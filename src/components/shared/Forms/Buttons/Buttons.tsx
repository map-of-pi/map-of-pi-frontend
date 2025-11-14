import styles from './Buttons.module.css';

import { IoMdClose } from 'react-icons/io';
import { RiAddFill } from 'react-icons/ri';
import { MdArrowForward } from 'react-icons/md';

export const AddButton = (props: any) => {
  return (
    <button className={styles.add_btn} onClick={props.handleAddBtn}>
      <RiAddFill fontWeight={900} size={30} />
    </button>
  );
};

export const Button = (props: any) => {
  const { styles, icon, label, disabled, onClick } = props;
  return (
    <button
      className={`px-4 py-1 ${disabled ? `bg-[grey]` : `bg-primary`} text-white rounded-md flex gap-1 cursor-pointer items-center justify-center `}
      style={styles}
      disabled={disabled}
      onClick={onClick}>
      {icon && icon}
      {label && label}
    </button>
  );
};

export const OutlineBtn = (props: any) => {
  const { styles, icon, label, disabled, onClick } = props;
  return (
    <button
      className={`px-4 py-1 gap-1 cursor-pointer items-center justify-center outline outline-primary outline-[1.5px] hover:bg-primary hover:text-white text-primary rounded-md flex mx-auto`}
      style={styles}
      disabled={disabled}
      onClick={onClick}>
      {icon && icon}
      {label && label}
    </button>
  );
};

export const YellowBtn = (props: any) => {
  return (
    <div>
      <button
        onClick={props.handleClick}
        className="btn bg-secondary flex gap-1 cursor-pointer items-center font-bold text-[20px] p-2 w-full text-left rounded-[px] mb-2"
        style={props.styles}>
        {props.icon && props.icon}
        {props.text && props.text}
        <MdArrowForward className="ms-auto my-auto" />
      </button>
    </div>
  );
};

export const CloseButton = (props: any) => {
  return (
    <IoMdClose
      size={24}
      className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 cursor-pointer"
      onClick={props.onClick}
    />
  );
};
