import { supabase } from '@/infra/supabase';

import type {
  SendEmailPayload,
  SendEmailResponseDTO,
  SendEmailResult
} from '../types';

const FUNCTION_NAME = 'send-email';

export class EmailService {
  public static async send(
    payload: SendEmailPayload
  ): Promise<SendEmailResult> {
    try {
      const { data, error } =
        await supabase.functions.invoke<SendEmailResponseDTO>(FUNCTION_NAME, {
          body: payload
        });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.id) {
        throw new Error('Resposta inválida do serviço de e-mail.');
      }

      return { id: data.id };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Falha no envio de e-mail: ${error.message}`);
      }

      throw new Error('Erro desconhecido no envio de e-mail');
    }
  }
}
