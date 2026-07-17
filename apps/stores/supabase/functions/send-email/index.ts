import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type'
};

interface SendEmailBody {
  template: 'order_expiring' | 'member_added';
  to: string;
  data?: Record<string, string | number>;
}

function renderTemplate(
  template: SendEmailBody['template'],
  data: Record<string, string | number> = {}
): { subject: string; html: string } {
  switch (template) {
    case 'order_expiring':
      return {
        subject: 'Pedido aguardando resposta',
        html: `<p>Há um pedido pendente prestes a expirar${
          data.orderRef ? ` (${data.orderRef})` : ''
        }. Acesse o painel para assumir ou confirmar.</p>`
      };
    case 'member_added':
      return {
        subject: 'Você foi adicionado a uma organização no Inventto',
        html: `<p>Você foi adicionado à organização ${
          data.orgName ?? ''
        }. Acesse o Inventto para começar.</p>`
      };
    default:
      throw new Error(`Template desconhecido: ${template}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY || !FROM_EMAIL) {
      throw new Error('Serviço de e-mail não configurado.');
    }

    const { template, to, data }: SendEmailBody = await req.json();

    if (!template || !to) {
      return new Response(
        JSON.stringify({ error: 'template e to são obrigatórios.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { subject, html } = renderTemplate(template, data);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Resend retornou ${res.status}`);
    }

    const result = await res.json();

    return new Response(JSON.stringify({ id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
