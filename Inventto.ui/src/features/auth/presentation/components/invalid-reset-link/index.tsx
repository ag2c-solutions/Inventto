import { Link } from 'react-router';
import { TriangleAlert } from 'lucide-react';

import { Logo } from '@/app/brand/logo';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

/**
 * Estado de erro do AUTH-07 (RN012/RN013): token de recovery ausente,
 * expirado ou já usado. Substitui a tela inteira — o formulário nem aparece.
 */
export function InvalidResetLink() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="w-11/12 text-center flex flex-col items-center justify-center">
        <Logo />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-5 pt-4 text-center">
          <div
            className="flex items-center justify-center size-16 rounded-full bg-destructive/10"
            aria-hidden="true"
          >
            <TriangleAlert className="size-7 text-destructive" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Link expirado ou inválido
            </h2>
            <p className="text-sm text-muted-foreground">
              Este link de redefinição não é mais válido. Solicite uma nova
              redefinição para continuar.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/auth/forgot-password">Recuperar senha de novo</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
