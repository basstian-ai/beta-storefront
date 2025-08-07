"use client";

import * as React from "react";
import Image from "next/image";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
}

export function Avatar({ src, alt, className }: AvatarProps) {
  return (
    <div
      className={`relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full ${className ?? ""}`}
    >
        {src ? (
          <Image src={src} alt={alt ?? ""} fill className="object-cover" />
        ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
          {alt ? alt[0] : "?"}
        </div>
      )}
    </div>
  );
}

export function AvatarGroup({ urls }: { urls: string[] }) {
  return (
    <div className="flex -space-x-2">
      {urls.slice(0, 3).map((url, idx) => (
        <Avatar
          key={idx}
          src={url}
          className="border-2 border-white dark:border-gray-800"
        />
      ))}
    </div>
  );
}
