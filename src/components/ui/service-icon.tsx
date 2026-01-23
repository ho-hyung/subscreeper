import Image from "next/image";
import { SERVICE_ICONS } from "@/lib/constants";

interface ServiceIconProps {
  serviceName: string;
  categoryColor: string;
  size?: number;
  className?: string;
}

export function ServiceIcon({
  serviceName,
  categoryColor,
  size = 48,
  className = "",
}: ServiceIconProps) {
  const iconUrl = SERVICE_ICONS[serviceName];

  if (iconUrl) {
    return (
      <div
        className={`rounded-xl overflow-hidden bg-white dark:bg-zinc-800 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={iconUrl}
          alt={serviceName}
          width={size - 8}
          height={size - 8}
          className="object-contain"
        />
      </div>
    );
  }

  // Fallback: 서비스명 첫 2글자 + 카테고리 색상
  return (
    <div
      className={`rounded-xl flex items-center justify-center text-white font-medium ${className}`}
      style={{ width: size, height: size, backgroundColor: categoryColor }}
    >
      {serviceName.slice(0, 2)}
    </div>
  );
}
