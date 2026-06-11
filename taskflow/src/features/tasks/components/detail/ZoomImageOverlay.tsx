import { X } from "lucide-react";
import { AppImage } from "@/shared/components/ui/AppImage";

type ZoomImageOverlayProps = {
  imageUrl: string;
  onClose: () => void;
};

export function ZoomImageOverlay({ imageUrl, onClose }: ZoomImageOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-10000 bg-black/90 flex items-center justify-center p-10 animate-in fade-in"
      onClick={onClose}
    >
      <AppImage src={imageUrl} alt="Zoom" width={1200} height={800} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
      <button className="absolute top-10 right-10 p-3 text-white hover:bg-white/10 rounded-full transition-all">
        <X className="w-8 h-8" />
      </button>
    </div>
  );
}
