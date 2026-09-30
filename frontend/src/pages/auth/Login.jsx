import { Landmark, LockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import ToastProvider from "../../components/ui/ToastProvider";
import { notifyError } from "../../components/ui/toastNotifications";
import { useAuth } from "../../context/AuthContext";

function getErrorMessage(error) {
  if (!error.response) {
    return "No fue posible conectar con el servidor.";
  }

  if (error.response.status >= 500) {
    return "El servidor presentó un error. Inténtalo nuevamente.";
  }

  return error.response.data?.errors?.[0] ?? error.response.data?.message ?? "Las credenciales no son válidas.";
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(data) {
    try {
      setIsSubmitting(true);
      await login(data.username.trim(), data.password);
      navigate("/", { replace: true });
    } catch (error) {
      notifyError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#F4F6F8] px-4 py-8">
      <Card className="w-full max-w-md border-t-4 border-t-[#163A63]">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-[#163A63] text-white shadow-sm">
            <Landmark size={30} strokeWidth={2.2} />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[#1B2A41]">Bienvenido a CoopSystem</h1>
          <p className="mt-2 text-sm font-medium text-[#536273]">Sistema de Gestión Cooperativa</p>
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Nombre de usuario</span>
            <Input {...register("username", { required: "El nombre de usuario es obligatorio" })} aria-invalid={errors.username ? "true" : "false"} autoComplete="username" leadingAdornment={<UserRound size={17} />} placeholder="usuario" />
            {errors.username && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.username.message}</p>}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Contraseña</span>
            <Input {...register("password", { required: "La contraseña es obligatoria" })} aria-invalid={errors.password ? "true" : "false"} autoComplete="current-password" leadingAdornment={<LockKeyhole size={17} />} placeholder="Contraseña" type="password" />
            {errors.password && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.password.message}</p>}
          </label>
          <Button className="w-full" disabled={isSubmitting} type="submit">{isSubmitting ? "Ingresando..." : "Iniciar sesión"}</Button>
        </form>
      </Card>
      <ToastProvider />
    </main>
  );
}
