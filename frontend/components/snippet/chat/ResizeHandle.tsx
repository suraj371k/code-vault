"use client";

import React from "react";
import { GripVertical } from "lucide-react";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export const ResizeHandle = ({ onMouseDown }: ResizeHandleProps) => {
  return (
    <div
      onMouseDown={onMouseDown}
      title="Drag to resize panel"
      className="
        absolute left-0 top-0 bottom-0 w-5
        flex items-center justify-center
        cursor-col-resize z-50
        group/resize
        transition-colors duration-150
        hover:bg-teal-500/5
        active:bg-teal-500/10
      "
    >
      {/* Visible grip line */}
      <div className="
        w-px h-16 rounded-full
        bg-zinc-800
        group-hover/resize:bg-teal-600/40
        group-active/resize:bg-teal-500/60
        transition-all duration-150
        group-hover/resize:h-20
      " />
      {/* Grip icon on hover */}
      <GripVertical className="
        absolute w-3 h-3
        text-zinc-700
        group-hover/resize:text-teal-500/50
        transition-colors duration-150
      " />
    </div>
  );
};
