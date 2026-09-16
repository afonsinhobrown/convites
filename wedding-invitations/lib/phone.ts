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

/**
 * Converte qualquer formato de telefone moçambicano para o formato MSISDN numérico puro exigido pela NetShop:
 * "25884XXXXXXX" ou "25885XXXXXXX" (12 dígitos, sem espaços nem símbolos)
 *
 * Suporta todas as entradas:
 * - "841234567" -> "258841234567"
 * - "+258841234567" -> "258841234567"
 * - "+258 84 123 4567" -> "258841234567"
 * - "258 85 123 4567" -> "258851234567"
 * - "00258841234567" -> "258841234567"
 */
export function toMozMsisdn(phone: string | null | undefined): string | null {
  if (!phone) return null;
  // 1. Remove todos os caracteres não numéricos (+, -, espaços, parênteses)
  let digits = String(phone).replace(/\D/g, "");
  if (!digits) return null;

  // 2. Remove prefixos internacionais redundantes como 00258...
  if (digits.startsWith("00258")) {
    digits = digits.slice(2);
  }

  // 3. Se tiver 9 dígitos e começar pelo prefixo do operador (84, 85, 82, 83, 86, 87)
  if (digits.length === 9) {
    return `258${digits}`;
  }

  // 4. Se já tiver 12 dígitos e começar por 258
  if (digits.length === 12 && digits.startsWith("258")) {
    return digits;
  }

  // 5. Se tiver mais de 12 dígitos mas começar por 258
  if (digits.length > 12 && digits.startsWith("258")) {
    return digits.slice(0, 12);
  }

  return digits;
}
