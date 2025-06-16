'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import ChatInterface from './ChatInterface';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TERA_ICON } from "@/lib/constants";
  /**
   * FloatingChatButton is a component that displays a floating button with a TERA
   * icon. When clicked, it opens a sheet with a chat interface.
   *
   * @returns A JSX element representing the floating chat button
   */
export default function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
      <SheetTrigger asChild>
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full p-3 bg-blue hover:bg-blue/95 border-4 border-blue-700 border-dashed  hover:border-blue-600 transition-all shadow-[0_0_15px_3px_rgba(59,130,246,0.7)] hover:shadow-[0_0_20px_5px_rgba(59,130,246,0.9)]">
              <Avatar className="h-16 w-16 bg-white-500">
                <AvatarImage src={TERA_ICON} alt="Tera Icon" />
                <AvatarFallback>T</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-base font-bold" style={{ fontSize: '20px', color:'brown' }}> Hi, I'm TeRA! 👋</span>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent className="w-[90vw] max-w-[800px] m-5 p-5" onChange={(open) => {
        if (!open) {
          setIsMinimized(false);
        }
      }}>
        <ChatInterface 
          isMinimized={isMinimized}
          onMinimizeChange={(minimized) => {
            setIsMinimized(minimized);
            if (minimized) {
              setIsChatOpen(false);
            } else {
              setIsChatOpen(true);
              
            }
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
