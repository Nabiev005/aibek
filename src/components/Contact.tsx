import { useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react';
import { contacts } from '../data';
import type { Theme } from '../hooks/useTheme';
import { GithubIcon, InstagramIcon, MailIcon, TelegramIcon } from './Icons';
import { MiniScene } from './MiniScene';
import { SectionTitle } from './SectionTitle';

type Props = { theme: Theme; reduced: boolean };
type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Форманы текшерет жана каталарды кыргызча кайтарат. */
function validate(v: Fields): Errors {
  const errors: Errors = {};
  if (v.name.trim().length < 2) errors.name = 'Атыңызды жазыңыз';
  if (!EMAIL_RE.test(v.email.trim())) errors.email = 'Туура email дарек жазыңыз';
  if (v.message.trim().length < 10) errors.message = 'Билдирүү кеминде 10 белгиден турушу керек';
  return errors;
}

const socials = [
  { label: 'Email', value: contacts.email, url: `mailto:${contacts.email}`, Icon: MailIcon },
  { label: 'Telegram', value: contacts.telegram.label, url: contacts.telegram.url, Icon: TelegramIcon },
  { label: 'Instagram', value: contacts.instagram.label, url: contacts.instagram.url, Icon: InstagramIcon },
  { label: 'GitHub', value: contacts.github.label, url: contacts.github.url, Icon: GithubIcon },
];

/** Байланыш бөлүмү: форма + социалдык тармактар. */
export function Contact({ theme, reduced }: Props) {
  const [values, setValues] = useState<Fields>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  /**
   * Азырынча сервер жок болгондуктан, билдирүү колдонуучунун почта
   * программасы аркылуу (mailto) жөнөтүлөт. Кийин Formspree, EmailJS же
   * өзүңүздүн API'ңизге алмаштырсаңыз болот — ушул функцияны гана өзгөртүңүз.
   */
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    const subject = encodeURIComponent(`Портфолиодон билдирүү — ${values.name}`);
    const body = encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`);
    window.location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`;

    setSent(true);
    setValues({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="section contact">
      <MiniScene shape="octahedron" theme={theme} reduced={reduced} className="contact__scene" />
      <div className="container">
        <SectionTitle index="05" title="Байланыш" subtitle="Долбооруңуз барбы? Жазыңыз — чогуу ишке ашыралы!" />

        <div className="contact__grid">
          <div className="contact__info">
            <p className="contact__lead" data-reveal>
              Жаңы долбоорлорго, кызматташууга жана жөн эле сүйлөшүүгө дайыма ачыкмын.
            </p>
            <ul className="contact__socials">
              {socials.map(({ label, value, url, Icon }, i) => (
                <li key={label} data-reveal style={{ '--d': `${i * 80}ms` } as CSSProperties}>
                  <a href={url} target={url.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="social">
                    <span className="social__icon">
                      <Icon />
                    </span>
                    <span className="social__text">
                      <small>{label}</small>
                      <span>{value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <form className="form" onSubmit={onSubmit} noValidate data-reveal="right">
            <div className={`field ${errors.name ? 'field--error' : ''}`}>
              <input id="name" name="name" type="text" placeholder=" " value={values.name} onChange={onChange} autoComplete="name" />
              <label htmlFor="name">Атыңыз</label>
              {errors.name && <span className="field__error">{errors.name}</span>}
            </div>

            <div className={`field ${errors.email ? 'field--error' : ''}`}>
              <input id="email" name="email" type="email" placeholder=" " value={values.email} onChange={onChange} autoComplete="email" />
              <label htmlFor="email">Email</label>
              {errors.email && <span className="field__error">{errors.email}</span>}
            </div>

            <div className={`field ${errors.message ? 'field--error' : ''}`}>
              <textarea id="message" name="message" rows={5} placeholder=" " value={values.message} onChange={onChange} />
              <label htmlFor="message">Билдирүү</label>
              {errors.message && <span className="field__error">{errors.message}</span>}
            </div>

            <button type="submit" className="btn btn--primary btn--block" data-magnetic>
              <span>Жөнөтүү</span>
              <TelegramIcon width={18} height={18} />
            </button>

            {sent && (
              <p className="form__success" role="status">
                Рахмат! Почта программаңыз ачылды — билдирүүнү жөнөтүү гана калды.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
