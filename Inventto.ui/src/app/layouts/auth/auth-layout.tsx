import { Outlet } from 'react-router';
import { CircleCheck } from 'lucide-react';

import { Logo } from '@/app/brand/logo';

export function AuthLayout() {
  return (
    <>
      <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-primary p-2 px-10 text-primary-foreground lg:flex dark:border-r">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 1px, transparent 10px)'
              }}
            />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />
          </div>

          <div className="relative z-20">
            <Logo className="[&>figcaption]:text-primary-foreground" showText />
          </div>

          <div className="relative z-20 flex-1 flex flex-col justify-center max-w-md mt-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-primary-foreground">
              Sua loja inteira em um só lugar.
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Estoque auditável, catálogos com preço e uma vitrine online que
              recebe pedidos direto no seu painel. Sem planilha, sem perder
              venda no WhatsApp.
            </p>
          </div>

          <div className="relative z-20 mt-auto">
            <ul className="space-y-4 text-base font-medium">
              <li className="flex items-center gap-3">
                <CircleCheck className="h-5 w-5 text-primary-foreground/80" />
                Controle de estoque que não mente
              </li>
              <li className="flex items-center gap-3">
                <CircleCheck className="h-5 w-5 text-primary-foreground/80" />
                Vitrine pronta para vender pelo link
              </li>
              <li className="flex items-center gap-3">
                <CircleCheck className="h-5 w-5 text-primary-foreground/80" />
                Equipe com permissões por papel
              </li>
            </ul>
          </div>
        </div>
        <div className="relative flex h-full flex-col bg-background p-4 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[372px] flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
