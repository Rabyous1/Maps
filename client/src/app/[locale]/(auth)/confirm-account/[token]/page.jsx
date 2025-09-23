"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";


export default function ConfirmAccountPage() {
  const params = useParams();
  const token = params?.token ?? null;

  const [message, setMessage] = useState("Confirming your account...");
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    if (calledRef.current) return; // prevent duplicate fetches
    calledRef.current = true;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    (async () => {
      try {
        setMessage(`Confirming account with token: ${token} ...`);

        const res = await fetch(`${apiBase}/auth/confirm-account/${token}`, {
          method: "GET",
        });

        let data = null;
        try {
          data = await res.json();
        } catch (err) {
          data = null;
        }

        const bodyText = data ? JSON.stringify(data) : "No JSON body";
        const displayMsg = `Token: ${token}\nStatus: ${res.status}\nBackend body: ${bodyText}`;

        if (res.status === 200) {
          setMessage("✅ Your account has been confirmed successfully!\n");
        } else if ([400, 404, 410].includes(res.status)) {
          setMessage("❌ Invalid or expired link.\n" );
        } else {
          setMessage("❌ Something went wrong.\n");
        }
      } catch (err) {
        setMessage("❌ Something went wrong.\n");
      }
    })();
  }, [token]);

  return (
  <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100vw",
      height: "100vh",
      backgroundImage: "url('/passwordBg.png')", 
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <div style={{
        padding: 24,
        borderRadius: 8,
        background: "rgba(255, 255, 255, 0.9)", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        whiteSpace: "pre-wrap",
        maxWidth: "90%",
        textAlign: "center",
      }}>
        <h1 style={{ margin: 0, fontSize: 16 }}>{message}</h1>
      </div>
    </div>
  );
}