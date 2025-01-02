import { BookTextIcon, ShirtIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function SelectCategory() {
  return (
    <div className="min-h-screen bg-white flex flex-col place-content-center">
      <h1 className="text-2xl font-bold text-center py-6 text-gray-800">
        O que deseja comprar?
      </h1>
      <div className="flex justify-center items-center space-x-4 px-4">
        <Link
          to="/school-supplies"
          className="text-base font-semibold text-gray-700 text-center flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 w-40 h-40 shadow-md hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <BookTextIcon
            size={48}
            className="text-blue-600 mb-2 w-full flex justify-center"
          />
          Material escolar
        </Link>

        <Link
          to="/uniforms"
          className="text-base font-semibold text-gray-700 text-center flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 w-40 h-40 shadow-md hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <ShirtIcon
            size={48}
            className="text-green-600 mb-2 w-full flex justify-center"
          />
          Uniforme
        </Link>
      </div>
    </div>
  );
}
