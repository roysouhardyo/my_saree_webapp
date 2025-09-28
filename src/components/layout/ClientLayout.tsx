'use client';

import { SessionProvider } from "next-auth/react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationContainer from "@/components/ui/NotificationContainer";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CartSidebar />
          <NotificationContainer />
        </div>
      </NotificationProvider>
    </SessionProvider>
  );
}