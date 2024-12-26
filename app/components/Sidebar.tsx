import { cn } from "@/app/lib/utils";
import React from "react";

export default function Sidebar({ isOpen, onClose, children }: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 背景遮罩 */}
      <div
        className={cn(
          "fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* 侧边栏 */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 bg-[#1A1B1E] z-50 transition-all duration-500 ease-out",
          "shadow-lg shadow-black/20 hover-lift",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col animate-fade">
          {/* 闪光效果 */}
          <div className="absolute inset-0 shimmer pointer-events-none" />
          
          {/* 内容区域 */}
          <div className="relative z-10 animate-slide">
            {children}
          </div>
        </div>
      </div>
    </>
  );
} 