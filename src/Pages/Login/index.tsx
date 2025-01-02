import { Input } from "../../components/ui/input";
// import logoNeres from "@/assets/logo.png";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import { useAuthStore } from "../../Contexts/authStore";
import ToastNotifications from "../../_components/Toasts/toasts";
import useUserStore from "../../Contexts/UserStore";
import { useEffect } from "react";

interface AuthUserProps {
  userLogin: string;
  userPassword: string;
}

export default function Auth() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthUserProps>();
  const { setUser } = useAuthStore();
  const { toastSuccess, toastError } = ToastNotifications();
  const { typeUser, fetchTypeUser } = useUserStore();

  const handleUserLogin = async (data: AuthUserProps) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.userLogin,
        data.userPassword
      );
      const user = userCredential.user;
      const userCredentials = {
        uid: user.uid,
        email: user.email,
        accessToken: await user.getIdToken(),
      };
      setUser(userCredentials);
      localStorage.setItem("loggedUser", JSON.stringify(userCredentials));
      fetchTypeUser();
      navigate("/Home");
      toastSuccess("Login realizado com sucesso!");
    } catch (error) {
      console.error("Erro de autenticação:", error);
      toastError("Login ou senha incorretos.");
    }
  };

  useEffect(() => {
    console.log("typeUser -> ", typeUser);
  }, [typeUser]);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200">
      <img
        // src={logoKyoto}
        alt="Logo Neres Bazar"
        className="w-20 h-20 mb-8 rounded-full"
      />
      <form
        onSubmit={handleSubmit(handleUserLogin)}
        className="w-80 bg-white p-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:shadow-2xl space-y-6"
      >
        <div>
          <label
            htmlFor="login"
            className="block text-sm font-semibold text-gray-600 mb-1"
          >
            Login:
          </label>
          <Input
            id="login"
            type="email"
            placeholder="Digite seu login"
            {...register("userLogin", { required: "Login é obrigatório" })}
            className={`mt-1 block w-full px-4 py-2 rounded-lg border ${
              errors.userLogin ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition duration-200`}
          />
          {errors.userLogin && (
            <p className="mt-2 text-sm text-red-600">
              {errors.userLogin.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-600 mb-1"
          >
            Senha:
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            {...register("userPassword", { required: "Senha é obrigatória" })}
            className={`mt-1 block w-full px-4 py-2 rounded-lg border ${
              errors.userPassword ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition duration-200`}
          />
          {errors.userPassword && (
            <p className="mt-2 text-sm text-red-600">
              {errors.userPassword.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold tracking-wide transition duration-200"
        >
          Acessar
        </Button>
      </form>
    </div>
  );
}
