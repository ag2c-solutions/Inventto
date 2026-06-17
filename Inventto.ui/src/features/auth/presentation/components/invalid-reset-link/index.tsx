import { Link } from 'react-router';
import { TriangleAlert } from 'lucide-react';

export function InvalidResetLink() {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center max-w-[480px] mx-auto pt-8">
        <div className="w-full flex justify-between items-start mb-6">
          <div className="text-[15px] font-medium text-[#b0aca6] text-left">
            Acesso por
            <br />
            token
          </div>
        </div>

        <div className="w-full rounded-2xl border border-border bg-[#f6f5f1] py-12 px-8 flex flex-col items-center gap-6">
          <div
            className="flex items-center justify-center size-[72px] rounded-full border border-[#f3f0ec] bg-white"
            aria-hidden="true"
          >
            <TriangleAlert className="size-8 text-[#b0aca6] stroke-[1.5]" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Link expirado ou inválido
            </h2>
            <p className="text-[17px] text-[#b0aca6] leading-relaxed">
              Este link de redefinição não é mais válido. Solicite uma nova
              redefinição para continuar.
            </p>
          </div>
        </div>

        <div className="mt-6 w-full">
          <Link
            to="/auth/forgot-password"
            className="flex items-center justify-center w-full h-12 text-base font-semibold rounded-xl border border-slate-300 bg-white text-foreground hover:bg-slate-50 transition-colors"
          >
            Recuperar senha de novo
          </Link>
        </div>
      </div>
    </div>
  );
}
