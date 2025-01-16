import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoaderPinwheelIcon } from "lucide-react";

type SubmitingOrderProps = {
  isSubmitting: boolean;
};

export default function SubmittingOrder({ isSubmitting }: SubmitingOrderProps) {
  return (
    <Dialog open={isSubmitting}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle>Concluindo Operação...</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <LoaderPinwheelIcon className="animate-spin text-amber-500 w-10 h-10" />
          <p className="text-amber-500">
            Por favor, aguarde enquanto enviamos seu pedido.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
