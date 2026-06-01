import Image from "next/image";

type AppImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  onClick?: () => void;
};

export function AppImage({
  src,
  alt,
  className = "",
  imageClassName = "",
  sizes = "96px",
  width = 96,
  height = 96,
  fill = false,
  onClick,
}: AppImageProps) {
  if (fill) {
    return (
      <span className={`relative block overflow-hidden ${className}`} onClick={onClick}>
        <Image src={src} alt={alt} fill sizes={sizes} className={imageClassName} unoptimized />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
      onClick={onClick}
    />
  );
}
