import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Modal({ title, children, isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-200 text-black rounded-lg p-4">
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
