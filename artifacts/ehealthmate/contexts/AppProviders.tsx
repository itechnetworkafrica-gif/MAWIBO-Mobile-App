import React from "react";
import { AppProvider } from "@/contexts/AppContext";
import { AppointmentsProvider } from "@/contexts/AppointmentsContext";
import { MoodProvider } from "@/contexts/MoodContext";
import { JournalProvider } from "@/contexts/JournalContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { DrawerProvider } from "@/contexts/DrawerContext";
import { AIInsightsProvider } from "@/contexts/AIInsightsContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { DoctorsProvider } from "@/contexts/DoctorsContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <NotificationsProvider>
          <DoctorsProvider>
            <MoodProvider>
              <AppointmentsProvider>
                <JournalProvider>
                  <AIInsightsProvider>
                    <ChatProvider>
                      <CommunityProvider>
                        <DrawerProvider>{children}</DrawerProvider>
                      </CommunityProvider>
                    </ChatProvider>
                  </AIInsightsProvider>
                </JournalProvider>
              </AppointmentsProvider>
            </MoodProvider>
          </DoctorsProvider>
        </NotificationsProvider>
      </AppProvider>
    </AuthProvider>
  );
}
