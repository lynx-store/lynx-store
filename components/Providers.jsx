'use client';

import { StoreProvider } from '../context/StoreContext';
import ChatWidget from './ChatWidget';

export default function Providers({ children }) {
  return (
    <StoreProvider>
      {children}
      <ChatWidget />
    </StoreProvider>
  );
}
