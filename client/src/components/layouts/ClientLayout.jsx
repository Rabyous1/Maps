'use client';
import React, {  useState} from 'react';
import Sidebar from './sidebar/Sidebar';
import Header  from './Header';

export default function ClientLayout({ children, styles, user }) {
  const [isOpen, setIsOpen]         = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCandidat   = user?.roles?.includes('Candidat');
  const isRecruiter  = user?.roles?.includes('Recruteur');

  return (
    <div className={`${styles.container} ${!isOpen ? styles.collapsed : ''}`}>
      <Sidebar
        open={isOpen}
        setOpen={setIsOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className={styles.main}>
        <Header
          fullName={user?.fullName}
          avatarUrl={user?.profilePicture}
          isCandidat={isCandidat}
          isRecruiter={isRecruiter}
          setMobileOpen={setMobileOpen}
          mobileOpen={mobileOpen}
        />

        {children}
      </main>
    </div>
  );
}

