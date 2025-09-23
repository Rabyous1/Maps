
// import React, { useEffect, useState } from 'react';
// import { useVideoCall } from './VideoCallContext';
// import { Button } from '@mui/material';
// import VideoCallIcon from '@mui/icons-material/VideoCall';
// import CallIcon from '@mui/icons-material/Call';
// import Select from '@/components/ui/inputs/Select';

// export default function UserActions({ userId, styles }) {
//   const { startCall } = useVideoCall();
//   const [videoDevices, setVideoDevices] = useState([]);
//   const [selectedDeviceId, setSelectedDeviceId] = useState(null);

//   useEffect(() => {
//     async function fetchDevices() {
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const cams = devices.filter(d => d.kind === 'videoinput');
//       setVideoDevices(cams);
//       if (cams.length > 0) setSelectedDeviceId(cams[0].deviceId);
//     }
//     fetchDevices();
//   }, []);
//  const videoDeviceOptions = videoDevices.map(device => ({
//   value: device.deviceId,
//   label: device.label || `Camera ${device.deviceId}`,
// }));
//   return (
//     <div className={styles.actions}>
//       {/* <select
//         value={selectedDeviceId || ''}
//         onChange={(e) => setSelectedDeviceId(e.target.value)}
//         className="p-2 rounded border"
//       >
//         {videoDevices.map(device => (
//           <option key={device.deviceId} value={device.deviceId}>
//             {device.label || `Camera ${device.deviceId}`}
//           </option>
//         ))}
//       </select> */}
// <p className={styles.actionsTitle}>Select a camera</p>
// <div className={styles.content}>
 
// <div className={styles.videoDeviceSelect}>
// <Select
//   name="videoDevice"
//   // label="Select Camera"
//   value={selectedDeviceId}
//   onChange={(e) => setSelectedDeviceId(e.target.value)}
//   options={videoDeviceOptions}
//   placeholder="Select a camera"
//   clearable
//   onClear={() => setSelectedDeviceId('')}
//   styles={styles}
// />
// </div>
//       <div className={styles.actionButtons}>
//         <Button
//           onClick={() => startCall(userId, true, selectedDeviceId)}
//           startIcon={<VideoCallIcon />}
//           className={styles.videoCallButton}
//         >
//           {/* video icon */}
//           Video Call
//         </Button>

//         <Button
//           onClick={() => startCall(userId, false)}
//           startIcon={<CallIcon />}
//           className={styles.voiceCallButton}
//         >
//           {/* voice icon */}
//           Voice Call
//         </Button>
//       </div>
//     </div>
// </div>

//   );
// }
// import React, { useEffect, useState } from 'react';
// import { useVideoCall } from './VideoCallContext';
// import { Button } from '@mui/material';
// import VideoCallIcon from '@mui/icons-material/VideoCall';
// import CallIcon from '@mui/icons-material/Call';
// import Select from '@/components/ui/inputs/Select';

// export default function UserActions({ userId, fullName, profilePicture, styles, onStartCall }) {
//   const { startCall } = useVideoCall();
//   const [videoDevices, setVideoDevices] = useState([]);
//   const [selectedDeviceId, setSelectedDeviceId] = useState(null);

//   useEffect(() => {
//     async function fetchDevices() {
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const cams = devices.filter(d => d.kind === 'videoinput');
//       setVideoDevices(cams);
//       if (cams.length > 0) setSelectedDeviceId(cams[0].deviceId);
//     }
//     fetchDevices();
//   }, []);

//   const videoDeviceOptions = videoDevices.map(device => ({
//     value: device.deviceId,
//     label: device.label || `Camera ${device.deviceId}`,
//   }));

//   return (
//     <div className={styles.actions}>
//       <p className={styles.actionsTitle}>Select a camera</p>
//       <div className={styles.content}>
//         <div className={styles.videoDeviceSelect}>
//           <Select
//             name="videoDevice"
//             value={selectedDeviceId}
//             onChange={(e) => setSelectedDeviceId(e.target.value)}
//             options={videoDeviceOptions}
//             placeholder="Select a camera"
//             clearable
//             onClear={() => setSelectedDeviceId('')}
//             styles={styles}
//           />
//         </div>
//         <div className={styles.actionButtons}>
//           <Button
//             onClick={() => startCall(userId, true, selectedDeviceId, fullName, profilePicture)}
//             startIcon={<VideoCallIcon />}
//             className={styles.videoCallButton}
            
//           >
//             Video Call
//           </Button>

//           <Button
//             onClick={() => startCall(userId, false, null, fullName, profilePicture)}
//             startIcon={<CallIcon />}
//             className={styles.voiceCallButton}
//           >
//             Voice Call
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from 'react';
import { useVideoCall } from './VideoCallContext';
import { Button } from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CallIcon from '@mui/icons-material/Call';
import Select from '@/components/ui/inputs/Select';

export default function UserActions({ userId, fullName, profilePicture, styles, onStartCall }) {
  const { startCall } = useVideoCall();
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  useEffect(() => {
    async function fetchDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter(d => d.kind === 'videoinput');
      setVideoDevices(cams);
      if (cams.length > 0) setSelectedDeviceId(cams[0].deviceId);
    }
    fetchDevices();
  }, []);

  const videoDeviceOptions = videoDevices.map(device => ({
    value: device.deviceId,
    label: device.label || `Camera ${device.deviceId}`,
  }));

  return (
    <div className={styles.actions}>
      
      <div className={styles.content}>
        <div className={styles.videoDeviceSelect}>
          <p className={styles.actionsTitle}>Select a camera</p>
          <Select
            name="videoDevice"
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            options={videoDeviceOptions}
            placeholder="Select a camera"
            clearable
            onClear={() => setSelectedDeviceId('')}
            styles={styles}
          />
        </div>
        <div className={styles.actionButtons}>
          <Button
            onClick={() => {
              onStartCall(); // Call the scroll function
              startCall(userId, true, selectedDeviceId, fullName, profilePicture);
            }}
            startIcon={<VideoCallIcon className={styles.callIcon}/>}
            className={styles.videoCallButton}
          >
                        <span className={styles.buttonTextInterview}>Video Call</span>

          </Button>

          <Button
            onClick={() => {
              onStartCall(); // Call the scroll function
              startCall(userId, false, null, fullName, profilePicture);
            }}
            startIcon={<CallIcon className={styles.callIcon}/>}
            className={styles.voiceCallButton}
          >
            <span className={styles.buttonTextInterview}>Voice Call</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
