/**
 * Normaliza qualquer número de telefone para o formato padrão de Moçambique com prefixo +258.
 * Exemplos aceites e convertidos para "+258 84 123 4567":
 *  - "841234567" -> "+258 84 123 4567"
 *  - "258841234567" -> "+258 84 123 4567"
 *  - "+258841234567" -> "+258 84 123 4567"
 *  - "84 123 4567" -> "+258 84 123 4567"
 *  - "+258 84 123 4567" -> "+258 84 123 4567"
 */
export function normalizeMozPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const raw = String(phone).trim();
  if (!raw) return null;

  // Remover tudo exceto dígitos e o sinal '+' inicial se houver
  const digits = raw.replace(/\D/g, "");

  if (!digits) return null;

  let localDigits = digits;

  // Se começar por 258 e tiver mais de 9 dígitos (ex: 25884XXXXXXX)
  if (localDigits.startsWith("258") && localDigits.length >= 11) {
    localDigits = localDigits.substring(3);
  }

  // Se tiver os 9 dígitos padrão de Moçambique (ex: 82/83/84/85/86/87XXXXXXX)
  if (localDigits.length === 9) {
    const ddd = localDigits.slice(0, 2);
    const part1 = localDigits.slice(2, 5);
    const part2 = localDigits.slice(5);
    return `+258 ${ddd} ${part1} ${part2}`;
  }

  // Fallback: se for outro formato ou internacional, garantir prefixo +
  if (!raw.startsWith("+")) {
    if (raw.startsWith("258")) {
      return `+${raw}`;
    }
    return `+258 ${raw}`;
  }

  return raw;
}
