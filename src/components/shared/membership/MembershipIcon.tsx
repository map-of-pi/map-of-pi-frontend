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
    <div className={`w-7 h-5 relative float-right ${className || ''}`} style={styleComponent}>
      <Image src={icon} alt={category} fill style={{ objectFit: 'contain' }}/>
    </div>
  )
}

export default MembershipIcon