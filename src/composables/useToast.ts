import { onScopeDispose, ref } from 'vue';

export function useToast() {
  const toast = ref('');
  let timer: ReturnType<typeof setTimeout> | undefined;

  function notify(message: string) {
    toast.value = message;
    clearTimeout(timer);
    timer = setTimeout(() => {
      toast.value = '';
    }, 2800);
  }

  onScopeDispose(() => clearTimeout(timer));
  return { toast, notify };
}
