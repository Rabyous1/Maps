// import { IconButton } from '@mui/material';
// import AddIcon from '@/assets/icons/chat/add-icon.svg';
// import SendIcon from '@/assets/icons/settings/send-icon.svg';
// import GenericFormikForm from '@/components/form/GenericFormikForm';

// export default function MessageInput({ onSubmit, selectedUserId, styles }) {
//   return (
//     <div className={styles.actions}>
//       <IconButton className={styles.addIcon}>
//         <AddIcon />
//       </IconButton>
//       <GenericFormikForm
//         hideSubmitButton
//         key={selectedUserId}
//         initialValues={{ content: '' }}
//         fields={[{ name: 'content', type: 'text', placeholder: 'Your message...' }]}
//         onSubmit={onSubmit}
//         submitText={<SendIcon className={styles.sendIcon} />}
//         disabled={!selectedUserId}
//         formClassName={styles.chatForm}
//       />
//     </div>
//   );
// }
import { TextField, IconButton } from "@mui/material";
import SendIcon from "@/assets/icons/settings/send-icon.svg";
import { useState } from "react";
import GenericFormikForm from "@/components/form/GenericFormikForm";
import dynamic from "next/dynamic";
import data from "@emoji-mart/data";

const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

export default function MessageInput({ onSubmit, selectedUserId, styles }) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className={styles.actions} style={{ position: "relative" }}>

      <GenericFormikForm
        hideSubmitButton
        key={selectedUserId}
        initialValues={{ content: "" }}
        fields={[{ name: "content", type: "text", placeholder: "Your message..." }]}
        onSubmit={onSubmit}
        submitText={<SendIcon className={styles.sendIcon} />}
        disabled={!selectedUserId}
        formClassName={styles.chatForm}
        customRenderFields={({ values, setFieldValue }) => (
          <>
            <TextField
              fullWidth
              name="content"
              placeholder="Your message..."
              value={values.content}
              onChange={(e) => setFieldValue("content", e.target.value)}
              variant="outlined"
              size="small"
              className={styles.inputField}
            />

            <IconButton
              aria-label="emoji picker"
              className={styles.emojiButton}
              onClick={() => setShowPicker((s) => !s)}
            >
              <span aria-hidden>😊</span>
            </IconButton>

            {showPicker && (
              <div
                style={{
                  position: "absolute",
                  bottom: "56px",
                  left: "8px",
                  zIndex: 1000,
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  background: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <Picker
                  data={data}
                  onEmojiSelect={(emoji) => {
                    setFieldValue("content", values.content + emoji.native);
                    setShowPicker(false);
                  }}
                  theme="light"
                />
              </div>
            )}
          </>
        )}
      />
    </div>
  );
}
