import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Modal({ title, children, isOpen, onClose, disableBackdropClick = false }) {
  // Handler to prevent closing on backdrop click if disableBackdropClick is true
  const preventOutside = disableBackdropClick
    ? (e) => e.preventDefault()
    : undefined;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-gray-200 text-black rounded-lg p-4"
        onPointerDownOutside={preventOutside}
        onInteractOutside={preventOutside}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="bg-gray-200 p-0 rounded-lg">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}