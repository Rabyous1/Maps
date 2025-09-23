// 'use client';

// import React from 'react';
// import {
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
// } from 'recharts';

// const ACTIVE_COLOR = '#FF4C4C';   
// const INACTIVE_COLOR = '#F0F0F0';
// const MAX_MONTHS = 300;

// export default function ExperienceByStatusChart({ averageExperienceByStatus = [], averageExperienceOverall = 0 , styles}) {
//   if (!Array.isArray(averageExperienceByStatus)) return null;

//   return (
//     <div>
//         <h3 className={styles.overallText}>Overall Avg. Experience: {Math.round(averageExperienceOverall)} months</h3>

//       <div className={styles.experienceChart}>
//         {averageExperienceByStatus.map(({ status, averageMonths }) => {
//           const safeAvg = averageMonths || 0;
//           const chartData = [
//             { name: 'Experience', value: Math.min(safeAvg, MAX_MONTHS) },
//             { name: 'Remaining', value: Math.max(MAX_MONTHS - safeAvg, 0) },
//           ];

//           return (
//             <div key={status} style={{ width: 200, textAlign: 'center' }}>
//               <h4 className={styles.statusTextExperienceChart}>{status}</h4>
//               <ResponsiveContainer width="100%" height={200}>
//                 <PieChart>
//                   <Pie
//                     data={chartData}
//                     dataKey="value"
//                     nameKey="name"
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={60}
//                     innerRadius={30}
//                     paddingAngle={2}
//                   >
//                     <Cell fill={ACTIVE_COLOR} />
//                     <Cell fill={INACTIVE_COLOR} />
//                   </Pie>
//                   <Tooltip
//                     formatter={(value, name) =>
//                       name === 'Experience'
//                         ? [`${safeAvg.toFixed(1)} months`, 'Avg. Experience']
//                         : null
//                     }
//                   />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const STATUS_COLORS = {
  pending: '#FFD700',    // yellow
  rejected: '#FF4C4C',   // red
  accepted: '#28A745',   // green (bootstrap green)
};

const INACTIVE_COLOR = '#F0F0F0';
const MAX_MONTHS = 300;

export default function ExperienceByStatusChart({ averageExperienceByStatus = [], averageExperienceOverall = 0 , styles}) {
  if (!Array.isArray(averageExperienceByStatus)) return null;

  return (
    <div>
      <h3 className={styles.overallText}>
        Overall Avg. Experience: {Math.round(averageExperienceOverall)} months
      </h3>

      <div className={styles.experienceChart}>
        {averageExperienceByStatus.map(({ status, averageMonths }) => {
          const safeAvg = averageMonths || 0;
          const activeColor = STATUS_COLORS[status.toLowerCase()] || '#8884d8'; 
          const chartData = [
            { name: 'Experience', value: Math.min(safeAvg, MAX_MONTHS) },
            { name: 'Remaining', value: Math.max(MAX_MONTHS - safeAvg, 0) },
          ];

          return (
            <div key={status} style={{ width: 200, textAlign: 'center' }}>
              <h4 className={styles.statusTextExperienceChart}>{status}</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={30}
                    paddingAngle={2}
                  >
                    <Cell fill={activeColor} />
                    <Cell fill={INACTIVE_COLOR} />
                  </Pie>
                  <Tooltip
                    formatter={(value, name) =>
                      name === 'Experience'
                        ? [`${safeAvg.toFixed(1)} months`, 'Avg. Experience']
                        : null
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}
