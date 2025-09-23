'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import TranslationsProvider from '@/components/translation/TranslationProvider';


export default function AuthLayout({ children, params }) {
 
  return (
    <div>
      <ToastContainer />
      <TranslationsProvider namespaces={['auth']} locale={params.locale}>
        
            <>{children}</>
          
      </TranslationsProvider>
    </div>
  );
}
