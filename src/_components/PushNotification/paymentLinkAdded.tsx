import apiBaseUrl from "@/lib/apiConfig";
import axios from "axios";

interface paymentLinkAddedProps {
  orderCode: string;
  customerName: string;
  phoneNumber: number;
  paymentLink: string;
}

export default function usePaymentLinkAdded() {
  const handlePaymentLinkAddedPush = async (props: paymentLinkAddedProps) => {
    const { orderCode, customerName, phoneNumber, paymentLink } = props;
    try {
      const response = await axios.post(
        `${apiBaseUrl}/push/admin/order-completed`,
        {
          orderCode,
          customerName,
          phoneNumber,
          paymentLink,
        }
      );

      if (response.status === 201) {
        console.log("Payment Link Added Pushed");
      }
    } catch (error) {
      console.log(error);
      console.log("Erro ao enviar push Payment Link Added");
    }
  };

  return handlePaymentLinkAddedPush;
}
