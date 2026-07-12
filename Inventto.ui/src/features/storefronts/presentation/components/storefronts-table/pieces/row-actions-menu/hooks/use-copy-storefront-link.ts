import { toast } from 'sonner';

export function useCopyStorefrontLink() {
  async function copyLink(publicUrl: string) {
    await navigator.clipboard.writeText(`https://${publicUrl}`);
    toast.success('Link copiado.', { duration: 4000 });
  }

  return { copyLink };
}
