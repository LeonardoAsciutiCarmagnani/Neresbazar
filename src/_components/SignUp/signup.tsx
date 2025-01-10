import { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, IdCard, Info } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useForm, SubmitHandler } from "react-hook-form";
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
import { FirebaseError } from "firebase/app";

interface FormCreateUser {
  name: string;
  email: string;
  cpf: string;
  password: string;
  confirmPassword: string;
}

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toastError, toastSuccess } = ToastNotifications();
  const { setIsCreatingUser } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormCreateUser>({
    mode: "onBlur",
  });

  const handleCreateUser: SubmitHandler<FormCreateUser> = async (data) => {
    if (data.password !== data.confirmPassword) {
      toastError("As senhas não coincidem.");
      return;
    }

    let userCredential = null;
    setError(null);
    setIsCreatingUser(true);

    try {
      console.log("Criando usuário no Firebase...");
      userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      console.log("Usuário criado no Auth, user:", user);

      console.log("Atualizando perfil do usuário no Firebase...");
      await updateProfile(user, { displayName: data.name });

      console.log("Fazendo requisição ao backend...");

      const cpfUnmasked = data.cpf.replace(/[.-]/g, "");
      const response = await axios.post(`${apiBaseUrl}/create-user`, {
        user_id: user.uid,
        name: data.name,
        email: data.email,
        cpf: cpfUnmasked,
        password: data.password,
      });

      console.log("Resposta do backend:", response);
      if (response.status === 201) {
        toastSuccess(
          "Cadastro realizado com sucesso. Por favor, entre novamente."
        );
        navigate("/login");
      } else {
        throw new Error(
          `Erro ao registrar no backend. Status: ${response.status}`
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        const firebaseError = err as FirebaseError;
        switch (firebaseError.code) {
          case "auth/email-already-in-use":
            setError("Este email já está em uso.");
            toastError("Este email já está em uso.");
            break;
          case "auth/invalid-email":
            setError("O email fornecido é inválido.");
            toastError("O email fornecido é inválido.");
            break;
          case "auth/weak-password":
            setError("A senha é muito fraca.");
            toastError("A senha é muito fraca.");
            break;
          default:
            setError(err.message); // Usar 'err' aqui
            toastError(err.message); // Usar 'err' aqui
            console.error("Erro ao criar usuário:", err); // Usar 'err' aqui
        }
      } else {
        // Tratar caso em que 'err' não seja um objeto Error
        setError("Ocorreu um erro desconhecido");
        toastError("Ocorreu um erro desconhecido");
        console.error("Erro inesperado:", err);
      }
      if (userCredential?.user) {
        try {
          await deleteUser(userCredential.user);
          console.log("Usuário deletado do Firebase:", userCredential.user.uid);
        } catch (deleteError) {
          console.error(
            "Erro ao deletar usuário do Firebase:",
            userCredential.user.uid,
            deleteError
          );
        }
      }
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleCPFChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target;
    // Remove caracteres não numéricos
    value = value.replace(/\D/g, "");

    // Aplica a máscara
    if (value.length > 3) {
      value = `${value.substring(0, 3)}.${value.substring(3)}`;
    }
    if (value.length > 7) {
      value = `${value.substring(0, 7)}.${value.substring(7)}`;
    }
    if (value.length > 11) {
      value = `${value.substring(0, 11)}-${value.substring(11, 13)}`;
    }

    // Atualiza o valor no formulário
    setValue("cpf", value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar conta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-6">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex items-center space-x-2 mb-4">
            <Info className="h-5 w-5 text-[#f06139]" />
            <h3 className="text-[0.6rem] text-red-500">
              *Utilize os dados do responsável que está cadastrado no aplicativo
              DuePay.
            </h3>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit(handleCreateUser)}>
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
                  placeholder="João Silva"
                  {...register("name", {
                    required: "Nome é obrigatório",
                  })}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
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
                  placeholder="seuemail@exemplo.com"
                  {...register("email", {
                    required: "E-mail é obrigatório",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: "Endereço de e-mail inválido",
                    },
                  })}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="cpf"
                className="block text-sm font-medium text-gray-700"
              >
                CPF
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdCard className="h-5 w-5 text-[#f06139]" />
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
                  {...register("cpf", {
                    required: "O CPF é obrigatório",
                    validate: (value) => {
                      const cpf = value.replace(/[.-]/g, ""); // Remove a máscara para validação
                      if (cpf.length !== 11) return "CPF inválido";
                      // Adicione aqui uma validação mais robusta do CPF, se necessário
                      return true;
                    },
                  })}
                  onChange={handleCPFChange} // Adicionado para atualizar o valor no form
                  placeholder="123.456.789-00"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.cpf ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#f06139] focus:border-orange-500`}
                />
                {errors.cpf && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.cpf.message}
                  </p>
                )}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="**********"
                  autoComplete="new-password"
                  {...register("password", {
                    required: "A senha é obrigatória",
                  })}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
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
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="**********"
                  autoComplete="new-password"
                  {...register("confirmPassword", {
                    required: "A confirmação de senha é obrigatória",
                  })}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
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
