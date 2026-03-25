"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { useTranslation } from "@/lib/language-context";
import { useState } from "react";

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function FilePreviewModal({ open, onClose, url, title }: FilePreviewModalProps) {
  const { t } = useTranslation();
  const [fullscreen, setFullscreen] = useState(false);

  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(url);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setFullscreen(false); } }}>
      <DialogContent className={`flex flex-col p-0 transition-all duration-200 ${
        fullscreen
          ? "w-[98vw] h-[96vh] max-w-none"
          : "w-[95vw] max-w-6xl h-[90vh]"
      }`}>
        <DialogHeader className="p-4 pb-0 flex flex-row items-center justify-between flex-shrink-0">
          <DialogTitle className="text-base font-semibold truncate pr-4">{title}</DialogTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFullscreen(!fullscreen)}
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                {t.filePreview.openInNewTab}
              </Button>
            </a>
          </div>
        </DialogHeader>
        <div className="flex-1 p-4 pt-2 min-h-0 overflow-auto">
          {isImage ? (
            <img
              src={url}
              alt={title}
              className="max-w-full max-h-full object-contain mx-auto rounded-lg"
            />
          ) : (
            <iframe
              src={url}
              className="w-full h-full rounded-lg border border-border bg-muted"
              title={title}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
