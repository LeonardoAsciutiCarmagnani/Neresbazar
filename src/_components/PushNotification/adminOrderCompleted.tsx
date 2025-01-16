import apiBaseUrl from "@/lib/apiConfig";
import axios from "axios";

interface adminOrderCompletedProps {
  orderCode: string;
  phoneNumber: number;
  totalValue: number;
}

export default function UseAdminOrderCompleted() {
  const handleAdminOrderCompletedPush = async (
    props: adminOrderCompletedProps
  ) => {
    const { orderCode, phoneNumber, totalValue } = props;
    try {
      const response = await axios.post(
        `${apiBaseUrl}/push/admin/order-completed`,
        {
          orderCode,
          phoneNumber,
          totalValue,
        }
      );

      if (response.status === 201) {
        console.log("Admin Order Completed Pushed");
      }
    } catch (error) {
      console.log(error);
      console.log("Erro ao enviar push Admin Order Completed");
    }
  };

  return handleAdminOrderCompletedPush;
}
