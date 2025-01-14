import { useToast } from "../../hooks/use-toast";

const ToastNotifications = () => {
  const { toast } = useToast();

  const toastSuccess = (description: string) => {
    toast({
      title: "Sucesso!",
      description: description,
      variant: "success",
      duration: 3500,
    });
  };

  const toastError = (description: string) => {
    toast({
      title: "Erro",
      description: description,
      variant: "error",
      duration: 3500,
    });
  };

  const toastInfo = (description: string) => {
    toast({
      title: "Atenção!",
      description: description,
      variant: "info",
      duration: 4900,
    });
  };

  return {
    toastSuccess,
    toastError,
    toastInfo,
  };
};

export default ToastNotifications;
