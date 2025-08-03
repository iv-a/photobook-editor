import { getUrl } from "@/features/photos";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";

type ImageViewerProps = {
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImageViewer = ({ id, open, onOpenChange }: ImageViewerProps) => {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    let alive = true;
    if (open && id) getUrl(id, false).then(u => alive && setUrl(u));
    return () => { alive = false; };
  }, [open, id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] p-0">
        {url && <img src={url} alt="" className="max-h-[90vh] w-auto object-contain mx-auto" />}
      </DialogContent>
    </Dialog>
  );
}
