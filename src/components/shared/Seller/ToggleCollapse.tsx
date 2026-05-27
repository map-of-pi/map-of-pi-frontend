import React, { useState, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa6';

interface ToggleCollapseProps {
  children: React.ReactNode;
  header: string;
  open?: boolean;
}

function ToggleCollapse({ children, header, open = false }: ToggleCollapseProps) {
  const [toggle, setToggle] = useState<boolean>(open);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const opening = !toggle;
    setToggle(opening);

    if (opening) {
      setTimeout(() => {
        wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  return (
    <div className="mb-2" ref={wrapperRef}>
      <div
        className="flex items-center justify-center gap-4 cursor-pointer mb-2"
        onClick={handleToggle}>
        <h2 className="font-bold">{header}</h2>
        <FaChevronDown
          size={13}
          className={`text-[#000000] ${toggle && 'rotate-90'}`}
        />
      </div>
      {toggle && <div>{children}</div>}
    </div>
  );
}

export default ToggleCollapse;