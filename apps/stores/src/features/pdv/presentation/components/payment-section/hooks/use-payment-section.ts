import { useEffect, useState } from 'react';

import type { FileWithPreview } from '@/shared/components/common/file-picker/types';

import type { PaymentMethod } from '../../../../domain/entities';

export interface PaymentSectionValue {
  method: PaymentMethod | null;
  // Em centavos — só enviado quando method === 'cash'.
  amountPaid?: number;
  proofFile?: File;
  isValid: boolean;
}

export function usePaymentSection(
  total: number,
  onChange: (payment: PaymentSectionValue) => void
) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [amountPaid, setAmountPaid] = useState<number | null>(null);
  const [proofFiles, setProofFiles] = useState<FileWithPreview[]>([]);

  const isInsufficientCash = method === 'cash' && (amountPaid ?? 0) < total;
  const changeAmount =
    method === 'cash' && amountPaid != null && amountPaid >= total
      ? amountPaid - total
      : null;

  useEffect(() => {
    const proofFile = proofFiles[0]?.file;

    onChange({
      method,
      amountPaid: method === 'cash' ? (amountPaid ?? 0) : undefined,
      proofFile: proofFile instanceof File ? proofFile : undefined,
      isValid: !!method && !isInsufficientCash
    });
  }, [method, amountPaid, proofFiles, isInsufficientCash, onChange]);

  return {
    method,
    setMethod,
    amountPaid,
    setAmountPaid,
    proofFiles,
    setProofFiles,
    isInsufficientCash,
    changeAmount
  };
}
