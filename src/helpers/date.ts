import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = date => {
  if (!date) return;

  return format(new Date(date), 'dd MMM yyyy', { locale: ptBR });
};

export const formatTeste = date => {
  if (!date) return;

  return format(new Date(date), "dd MMM yyyy, 'às' hh:mm", { locale: ptBR });
};
