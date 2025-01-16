import apiBaseUrl from "@/lib/apiConfig";
import axios from "axios";

interface orderCompletedProps {
  orderCode: string;
  customerName: string;
  phoneNumber: number;
}

export default function UseOrderCompleted() {
  const handleOrderCompletedPush = async (props: orderCompletedProps) => {
    const { orderCode, customerName, phoneNumber } = props;
    try {
      const response = await axios.post(`${apiBaseUrl}/push/order-completed`, {
        orderCode,
        customerName,
        phoneNumber,
      });

      if (response.status === 201) {
        console.log("Order Completed Pushed");
      }
    } catch (error) {
      console.log(error);
      console.log("Erro ao enviar push Order Completed");
    }
  };

  return handleOrderCompletedPush;
}
