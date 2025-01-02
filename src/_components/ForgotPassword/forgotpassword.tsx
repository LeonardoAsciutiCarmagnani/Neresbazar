import { useState, FormEvent } from "react";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Alert, AlertDescription } from "../../components/ui/alert";

const PasswordRecovery = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor, digite seu e-mail");
      return;
    }
    setSuccess(true);
    setError("");
    // Lógica de envio de email
  };

  return (
    <Dialog>
      <DialogTrigger className="text-sm font-medium text-[#f06139] hover:text-orange-600">
        Esqueceu a senha?
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Recuperação de Senha
          </DialogTitle>
          <DialogDescription>
            Digite o e-mail cadastrado para receber as instruções de recuperação
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertDescription>
              Enviamos as instruções de recuperação para seu e-mail
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 block w-full rounded-md border border-gray-300 py-2 text-gray-900 shadow-sm focus:ring-2 focus:border-[#f06139]"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f06139] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f06139]"
            >
              Enviar instruções
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PasswordRecovery;
