// 'use client';

// import React from 'react';
// import { getCountryFlagUrl } from '@/utils/constants';
// import styles from './CityCard.module.scss';
// import GenericCard from '@/components/ui/surfaces/Card';
// import ClockIcon from '@/assets/icons/globe3D/cards/Clock.svg';
// import ContractIcon from '@/assets/icons/globe3D/cards/Contract.svg';
// import SaveIcon from '@/assets/icons/opportunities/icon-save.svg';
// import IndustryIcon from '@/components/IndustryIcon';
// import {
//   useAddToFavorites,
//   useRemoveFromFavorites,
//   useFavoriteOpportunities,
// } from '@/features/opportunities/hooks/opportunities.hooks';
// import { Tooltip } from '@mui/material';

// export default function CityCard({ pins = [], onSelect }) {
//   const { data: favoriteOps = [] } = useFavoriteOpportunities();
//   // const favoriteIds = new Set(favoriteOps.map((f) => f.id));
//   const favoriteIds = new Set((favoriteOps.favorites ?? []).map((f) => f.id));


//   const { mutate: addToFavorites } = useAddToFavorites();
//   const { mutate: removeFromFavorites } = useRemoveFromFavorites();

//   const handleSaveClick = (e, id) => {
//     e.stopPropagation();
//     if (favoriteIds.has(id)) {
//       removeFromFavorites(id);
//     } else {
//       addToFavorites(id);
//     }
//   };

//   return (
//     <section className={styles.panel}>
//       <header className={styles.header}>{pins.length} Results</header>

//       <div className={styles.cards}>
//         {pins.map((pin) => {
//           const isFavorite = favoriteIds.has(pin.id);

//           return (
//             <div
//               key={pin.id}
//               onClick={() => onSelect(pin)}
//               style={{ cursor: 'pointer' }}
//             >
//               <GenericCard
//                 title={
//                   <div className={styles.cardTop}>
//                     <span className={styles.title} title={pin.label}>
//                       {pin.label}
//                     </span>
//                     <Tooltip
//                       title={
//                         isFavorite
//                           ? 'Remove from favorites'
//                           : 'Save this opportunity'
//                       }
//                     >
//                       <span>
//                         <SaveIcon
//                           className={`${styles.saveIcon} ${
//                             isFavorite ? styles.favoritedsaveIcon : ''
//                           }`}
//                           onClick={(e) => handleSaveClick(e, pin.id)}
//                         />
//                       </span>
//                     </Tooltip>
//                   </div>
//                 }
//                 footer={
//                   <button
//                     className={styles.applyBtn}
//                     onClick={(e) => e.stopPropagation()}
//                   >
//                     Apply
//                   </button>
//                 }
//                 styles={styles}
//                 className={styles.card}
//               >
//                 <div className={styles.infoRow}>
//                   <div className={styles.infoCol}>
//                     <span className={styles.industry}>
//                       <IndustryIcon
//                         industry={pin.industry}
//                         className={styles.industriesIcons}
//                       />
//                       {pin.industry}
//                     </span>
//                   </div>
//                   <div className={styles.infoCol}>
//                     <span className={styles.flag}>
//                       <img
//                         src={getCountryFlagUrl(pin.country)}
//                         alt={`${pin.country} flag`}
//                         className={styles.flagImg}
//                       />
//                       {pin.country}
//                     </span>
//                   </div>
//                   <div className={styles.infoCol}>
//                     <span className={styles.type}>{pin.EmploymentType}</span>
//                   </div>
//                 </div>

//                 <div className={styles.rowDetails}>
//                   <span className={`${styles.leftItem} ${styles.type}`}>
//                     <ContractIcon className={styles.contractIcon} />
//                     {pin.contractType}
//                   </span>
//                   <span className={styles.middleItem}>
//                     <ClockIcon className={styles.clockIcon} />
//                     {pin.publisheddate
//                       ? new Date(pin.publisheddate).toLocaleDateString()
//                       : 'N/A'}
//                   </span>
//                   <span className={styles.rightItem}>
//                     Ref: {pin.reference}
//                   </span>
//                 </div>
//               </GenericCard>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// }
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getCountryFlagUrl } from '@/utils/constants';
import styles from './CityCard.module.scss';
import GenericCard from '@/components/ui/surfaces/Card';
import ClockIcon from '@/assets/icons/globe3D/cards/Clock.svg';
import ContractIcon from '@/assets/icons/globe3D/cards/Contract.svg';
import SaveIcon from '@/assets/icons/opportunities/icon-save.svg';
import IndustryIcon from '@/components/IndustryIcon';
import {
  useAddToFavorites,
  useRemoveFromFavorites,
  useFavoriteOpportunities,
} from '@/features/opportunities/hooks/opportunities.hooks';
import { Tooltip } from '@mui/material';


export default function CityCard({ pins = [], onSelect }) {
  const { data: favoriteOps = [] } = useFavoriteOpportunities();
  // const favoriteIds = new Set(favoriteOps.map((f) => f.id));
  const favoriteIds = new Set((favoriteOps.favorites ?? []).map((f) => f.id));


  const router = useRouter();

  const { mutate: addToFavorites } = useAddToFavorites();
  const { mutate: removeFromFavorites } = useRemoveFromFavorites();

  const handleSaveClick = (e, id) => {
    e.stopPropagation();
    if (favoriteIds.has(id)) {
      removeFromFavorites(id);
    } else {
      addToFavorites(id);
    }
  };

  return (
    <section className={styles.panel}>
      <header className={styles.header}>{pins.length} Results</header>

      <div className={styles.cards}>
        {pins.map((pin) => {
          const isFavorite = favoriteIds.has(pin.id);

          return (
            <div
              key={pin.id}
              onClick={() => onSelect(pin)}
              style={{ cursor: 'pointer' }}
            >
              <GenericCard
                title={
                  <div className={styles.cardTop}>
                    <span className={styles.title} title={pin.label}>
                      {pin.label}
                    </span>
                    <Tooltip
                      title={
                        isFavorite
                          ? 'Remove from favorites'
                          : 'Save this opportunity'
                      }
                    >
                      <span>
                        <SaveIcon
                          className={`${styles.saveIcon} ${
                            isFavorite ? styles.favoritedsaveIcon : ''
                          }`}
                          onClick={(e) => handleSaveClick(e, pin.id)}
                        />
                      </span>
                    </Tooltip>
                  </div>
                }
                footer={
              <span
                className={styles.moreInfoLink}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/opportunities/${pin.id}`);
                }}
              >
                See More...
              </span>


                }
                styles={styles}
                className={styles.card}
              >
                <div className={styles.infoRow}>
                  <div className={styles.infoCol}>
                    <span className={styles.industry}>
                      <IndustryIcon
                        industry={pin.industry}
                        className={styles.industriesIcons}
                      />
                      {pin.industry}
                    </span>
                  </div>
                  <div className={styles.infoCol}>
                    <span className={styles.flag}>
                      <img
                        src={getCountryFlagUrl(pin.country)}
                        alt={`${pin.country} flag`}
                        className={styles.flagImg}
                      />
                      {pin.country}
                    </span>
                  </div>
                  <div className={styles.infoCol}>
                    <span className={styles.type}>{pin.EmploymentType}</span>
                  </div>
                </div>

                <div className={styles.rowDetails}>
                  <span className={`${styles.leftItem} ${styles.type}`}>
                    <ContractIcon className={styles.contractIcon} />
                    {pin.contractType}
                  </span>
                  <span className={styles.middleItem}>
                    <ClockIcon className={styles.clockIcon} />
                    {pin.publisheddate
                      ? new Date(pin.publisheddate).toLocaleDateString()
                      : 'N/A'}
                  </span>
                  <span className={styles.rightItem}>
                    Ref: {pin.reference}
                  </span>
                </div>
              </GenericCard>
            </div>
          );
        })}
      </div>
    </section>
  );
}