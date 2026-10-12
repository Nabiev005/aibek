/** Бишкектин убактысы (Asia/Bishkek), колдонуучу кайсы өлкөдө болсо да. */
const TIME_ZONE = 'Asia/Bishkek';

/** "14:32" форматындагы убакыт. */
export function bishkekTime(date = new Date()) {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }).format(date);
}

/** Саатка жараша абал: күндүз иштейт, түнкүсүн уктайт 🙂 */
export function bishkekStatus(date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: TIME_ZONE }).format(date));
  return hour >= 9 && hour < 23 ? 'иштеп жатам 💻' : 'уктап жатам 🌙';
}
