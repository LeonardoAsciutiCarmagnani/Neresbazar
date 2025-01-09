import { useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  IdCardIcon,
  InfoIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../Contexts/authStore";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import axios from "axios";
import apiBaseUrl from "../../lib/apiConfig";
import { useNavigate } from "react-router-dom";
import ToastNotifications from "../Toasts/toasts";
import MaskedInput from "react-text-mask";

interface FormCreateUser {
  name: string;
  email: string;
  cpf: string;
  password: string;
  confirmPassword: string;
}

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toastError, toastSuccess } = ToastNotifications();
  const { redirectToAuth } = useAuthStore();
  const { register, handleSubmit } = useForm<FormCreateUser>();

  useEffect(() => {
    console.log(redirectToAuth);
  }, [redirectToAuth]);

  const handleCreateUser = async (data: FormCreateUser) => {
    const { setIsCreatingUser } = useAuthStore.getState();
    let userCredential = null;

    try {
      setIsCreatingUser(true);

      // Criar o usuário no Firebase
      userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      console.log("Usuário criado no Auth, user:", user);

      // Atualizar o nome do usuário no Firebase
      await updateProfile(user, { displayName: data.name });

      const response = await axios.post(`${apiBaseUrl}/create-user`, {
        user_id: user.uid,
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        password: data.password,
      });

      if (response.status === 200) {
        toastSuccess(
          "Cadastro realizado com sucesso. Por favor entre novamente."
        );
        setError("");
        navigate("/login");
      } else {
        setError("Ocorreu um erro ao comunicar com o servidor");
        throw new Error("Erro ao registrar no backend.");
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error);

      if (userCredential?.user) {
        await deleteUser(userCredential.user);
      }
      toastError(
        "Ocorreu um erro ao criar a conta. Por favor, tente novamente."
      );
    } finally {
      setIsCreatingUser(false);
    }
  };

  const onSubmit = (data: FormCreateUser) => {
    if (data.password !== data.confirmPassword) {
      toastError("As senhas não coincidem.");
      return;
    }
    console.log("data", data);
    handleCreateUser(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar conta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-6">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 ">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex items-center space-x-2 mb-4">
            <InfoIcon className="h-5 w-5 text-[#f06139]" />
            <h3 className="text-[0.6rem] text-red-500">
              *Utilize os dados do responsável que está cadastrado no aplicativo
              DuePay.
            </h3>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nome completo
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#f06139]" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  {...register("name", { required: "O nome é obrigatório" })}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="João Silva"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#f06139]" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  {...register("email", {
                    required: "O e-mail é obrigatório",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "E-mail inválido",
                    },
                  })}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#f06139] focus:border-orange-500"
                  placeholder="seuemail@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                CPF
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdCardIcon className="h-5 w-5 text-[#f06139]" />
                </div>
                <MaskedInput
                  mask={[
                    /\d/,
                    /\d/,
                    /\d/,
                    ".",
                    /\d/,
                    /\d/,
                    /\d/,
                    ".",
                    /\d/,
                    /\d/,
                    /\d/,
                    "-",
                    /\d/,
                    /\d/,
                  ]}
                  id="cpf"
                  type="text"
                  required
                  {...register("cpf", {
                    required: "O CPF é obrigatório",
                    pattern: {
                      value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                      message: "CPF inválido",
                    },
                  })}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#f06139] focus:border-orange-500"
                  placeholder="123.456.789-00"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#f06139]" />
                </div>
                <input
                  id="password"
                  required
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "A senha é obrigatória",
                  })}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="**********"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[#f06139]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#f06139]" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#f06139]" />
                </div>
                <input
                  id="confirmPassword"
                  required
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "A confirmação de senha é obrigatória",
                  })}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="**********"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f06139] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Registrar
              </button>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Já possui uma conta?
                <a
                  href="/login"
                  className="ml-2 font-medium text-[#f06139] hover:text-orange-500"
                >
                  Entrar
                </a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
