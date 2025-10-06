import Image from 'next/image'
import React from 'react'
import WhiteIcon from "../../../../public/images/membership/Member_icon_white.svg"
import GreenIcon from "../../../../public/images/membership/Member_icon_green.svg"
import GoldIcon from "../../../../public/images/membership/Member_icon_gold.svg"
import DoubleGoldIcon from "../../../../public/images/membership/Member_icon_double_gold.svg"
import TripleGoldIcon from "../../../../public/images/membership/Member_icon_triple_gold.svg"
import { MembershipClassType } from '@/constants/types'

function MembershipIcon({ category, className, styleComponent }: { 
  category: MembershipClassType, 
  className?: string, 
  styleComponent?: any }) {
  const HandleMembership = (category: MembershipClassType) => {
    switch (category) {
      case MembershipClassType.TRIPLE_GOLD:
        return TripleGoldIcon
      case MembershipClassType.DOUBLE_GOLD:
        return DoubleGoldIcon
      case MembershipClassType.GOLD:
        return GoldIcon
      case MembershipClassType.GREEN:
        return GreenIcon
      case MembershipClassType.WHITE:
        return WhiteIcon
      default:
        return null
    }
  }
  
  const icon = HandleMembership(category);

  if (!icon) return null; // Don't render anything for casual members

   return (
    <div
      className={`relative ${className || ''}`}
      style={{
        display: 'inline-block',
        width:
          category === MembershipClassType.TRIPLE_GOLD
            ? '30px'
            : category === MembershipClassType.DOUBLE_GOLD
            ? '25px'
            : '20px',
        height:
          category === MembershipClassType.TRIPLE_GOLD
            ? '30px'
            : category === MembershipClassType.DOUBLE_GOLD
            ? '25px'
            : '20px',
        verticalAlign: 'middle',
        ...styleComponent,
      }}
    >
      <Image
        src={icon}
        alt={category}
        fill
        style={{
          objectFit: 'contain',
          width: '100%',
          height: '100%',
        }}
        sizes="auto"
      />
    </div>
  );
}

export default MembershipIcon