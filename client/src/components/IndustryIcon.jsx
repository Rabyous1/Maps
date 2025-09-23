import React from 'react';
import IconTransportation from '@/assets/icons/opportunities/industries/icon-transport.svg';
import IconIT from '@/assets/icons/opportunities/industries/icon-it.svg';
import IconBanking from '@/assets/icons/opportunities/industries/icon-banking.svg';
import IconEnergies from '@/assets/icons/opportunities/industries/icon-energies.svg';
import IconPharma from '@/assets/icons/opportunities/industries/icon-pharma.svg';
import IconOther from '@/assets/icons/opportunities/industries/icon-other.svg';

export default function IndustryIcon({ industry, className }) {
    const normalized = industry?.toUpperCase().replace(/[\s&]+/g, '_');
  
    const icons = {
      TRANSPORTATION: <IconTransportation className={className} />,
      IT_TELECOM: <IconIT className={className} />,
     BANKING: <IconBanking className={className} />,
      ENERGIES: <IconEnergies className={className} />,
      PHARMACEUTICAL: <IconPharma className={className} />,
      OTHER: <IconOther className={className} />,
    };
  
    return icons[normalized] || null;
  }
  
