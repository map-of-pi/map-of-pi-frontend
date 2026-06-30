import React, { useEffect, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa6';

interface ToggleCollapseProps {
  children: React.ReactNode;
  header: string;
  open?: boolean;
}

function ToggleCollapse({ children, header, open = false }: ToggleCollapseProps) {
  const [toggle, setToggle] = useState<boolean>(open);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Tracks user-triggered opens so default-open sections and closes do not scroll.
  const scrollAfterOpenRef = useRef(false);

  const getScrollableParent = (element: HTMLElement | null) => {
    let parent = element?.parentElement;

    while (parent) {
      const { overflowY } = window.getComputedStyle(parent);
      const canScroll = /(auto|scroll)/.test(overflowY);

      // Some ToggleCollapse instances live inside the sidebar, which scrolls separately from the page.
      if (canScroll && parent.scrollHeight > parent.clientHeight) {
        return parent;
      }

      parent = parent.parentElement;
    }

    return null;
  };

  useEffect(() => {
    if (!toggle || !scrollAfterOpenRef.current) {
      return;
    }

    scrollAfterOpenRef.current = false;

    // Wait one frame so the opened content exists before measuring visibility.
    const animationFrame = window.requestAnimationFrame(() => {
      const content = contentRef.current;
      const wrapper = wrapperRef.current;

      if (!content || !wrapper) {
        return;
      }

      const scrollContainer = getScrollableParent(wrapper);
      const contentRect = content.getBoundingClientRect();
      const viewportBottom = scrollContainer
        ? scrollContainer.getBoundingClientRect().bottom
        : window.innerHeight;
      // Reveal only the first bit of content instead of jumping the header to the top.
      const firstLineBottom = contentRect.top + Math.min(contentRect.height, 40);
      const scrollMargin = 12;
      const scrollAmount = firstLineBottom - viewportBottom + scrollMargin;

      if (scrollAmount <= 0) {
        return;
      }

      if (scrollContainer) {
        scrollContainer.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        return;
      }

      window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [toggle]);

  const handleToggle = () => {
    setToggle((currentToggle) => {
      const opening = !currentToggle;
      scrollAfterOpenRef.current = opening;
      return opening;
    });
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
      {toggle && <div ref={contentRef}>{children}</div>}
    </div>
  );
}

export default ToggleCollapse;
