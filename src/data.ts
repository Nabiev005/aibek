/**
 * САЙТТЫН БАРДЫК МАЗМУНУ УШУЛ ФАЙЛДА.
 * Текстти, шилтемелерди, көндүмдөрдү жана долбоорлорду ушул жерден өзгөртүңүз —
 * компоненттерге тийбей эле сайт жаңыланат.
 */

export const profile = {
  firstName: 'Айбек',
  lastName: 'Набиев',
  fullName: 'Набиев Айбек',
  city: 'Бишкек, Кыргызстан',
  experienceYears: 3,
  birthDate: '2005-06-23',
  studio: 'ainabi.studio',
  // Hero бөлүмүндө typewriter эффекти менен алмашып чыгуучу кесиптер
  roles: ['Fullstack иштеп чыгуучу', 'UI/UX дизайнер', 'Графикалык дизайнер'],
  // Сүрөттөр public/images/ папкасында. Алмаштыруу үчүн жаңы файлды салып, жолун ушул жерден өзгөртүңүз.
  photos: {
    hero: '/images/aibek-portrait.webp', // Hero'догу тегерек аватар
    about: '/images/aibek-workspace.webp', // "Мен жөнүндө" бөлүмүндөгү негизги сүрөт
  },
};

export const contacts = {
  email: 'ajbeknabiev90@gmail.com',
  telegram: { label: '+996 702 952 200', url: 'https://t.me/+996702952200' },
  instagram: { label: '@aibek__dev', url: 'https://instagram.com/aibek__dev' },
  github: { label: 'Nabiev005', url: 'https://github.com/Nabiev005' },
};

export const navLinks = [
  { id: 'home', label: 'Башкы' },
  { id: 'about', label: 'Мен жөнүндө' },
  { id: 'skills', label: 'Көндүмдөр' },
  { id: 'projects', label: 'Долбоорлор' },
  { id: 'experience', label: 'Тажрыйба' },
  { id: 'contact', label: 'Байланыш' },
];

/* ---------------------------- Көндүмдөр ---------------------------- */

// Иконкалар devicon CDN аркылуу жүктөлөт
const icon = (name: string, variant = 'original') =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${name}/${name}-${variant}.svg`;

export type Skill = { name: string; level: number; icon: string };
export type SkillGroup = { title: string; skills: Skill[] };

// level — 0..100 аралыгындагы пайыз. Өзүңүзгө ылайык өзгөртүңүз.
export const skillGroups: SkillGroup[] = [
  {
    title: 'Frontend',
    skills: [
      { name: 'HTML', level: 95, icon: icon('html5') },
      { name: 'CSS', level: 90, icon: icon('css3') },
      { name: 'JavaScript', level: 88, icon: icon('javascript') },
      { name: 'TypeScript', level: 80, icon: icon('typescript') },
      { name: 'React', level: 85, icon: icon('react') },
    ],
  },
  {
    title: 'Backend жана мобилдик',
    skills: [
      { name: 'Python', level: 75, icon: icon('python') },
      { name: 'Kotlin', level: 65, icon: icon('kotlin') },
      { name: 'Dart', level: 70, icon: icon('dart') },
    ],
  },
  {
    title: 'Дизайн жана 3D',
    skills: [
      { name: 'Figma', level: 92, icon: icon('figma') },
      { name: 'Blender', level: 70, icon: icon('blender') },
    ],
  },
];

/* ---------------------------- Долбоорлор ---------------------------- */

export type Project = {
  title: string;
  description: string;
  tech: string[];
  image: string;
  link: string;
  github?: string;
};

// Долбоорлор: сүрөттөрү public/images/project-*.webp (сайттардын скриншоттору).
export const projects: Project[] = [
  {
    title: 'ainabi.studio',
    description:
      'IT студиянын расмий lms сайты: кызматтар, портфолио жана кардарлар менен байланыш формасы.',
    tech: ['React', 'TypeScript', 'backend', 'data(postSQL)', 'Three.js'],
    image: '/images/project-ainabi.webp', // https://www.ainabi.site/ сайтынын скриншоту
    link: 'https://www.ainabi.site/',
  },
  {
    title: 'Зайил Ормнов мектеп сайты',
    description:
      'Мектептин расмий сайты: жаңылыктар, окуу программасы, окуучулар жана мугалимдер үчүн маалымат жана башка ресурстар.',
    tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    image: '/images/project-ormonov.webp', // https://ormonov.online/ сайтынын скриншоту
    link: 'https://ormonov.online/',
    github: 'https://github.com/Nabiev005/mektep-ormonov',
  },
  {
    title: 'Ainabi Business',
    description:
      'Кыргызстандагы дүкөндөр үчүн бизнес эсеп системасы: товарлар, сатуу, склад, кардарлар, карыздар жана команданын иши — баары бир жерде.',
    tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    image: '/images/project-business.webp', // https://business.ainabi.site/ сайтынын скриншоту
    link: 'https://business.ainabi.site/',
  },
  {
    title: 'Тапкыч Ордо',
    description:
      '«Акыл ордо» форматындагы интеллектуалдык оюн платформасы. Суроолор проектордо, жооптор — студенттердин телефонунан. Окуу жайлар, топтор жана ийримдер үчүн.',
    tech: ['React', 'TypeScript', 'Node.js', 'WebSocket'],
    image: '/images/project-tapkych.webp', // https://www.tapkych.com/ сайтынын скриншоту
    link: 'https://www.tapkych.com/',
  },
  {
    title: 'EduFlow TRK — Таш-Көмүр аймактык колледжи',
    description:
      'Колледждин электрондук документ жүгүртүү системасы: арыздар, директордун онлайн макулдашуусу, фирмалык бланктагы автоматтык PDF, ролдор боюнча кирүү, кабарлар жана билдирмелер — кагазсыз.',
    tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    image: '/images/project-eduflow.webp', // https://iwin.edu.kg/ сайтынын скриншоту
    link: 'https://iwin.edu.kg/',
  },
];

/* ---------------------- Тажрыйба / убакыт тилкеси ---------------------- */

export type TimelineItem = {
  period: string;
  title: string;
  place: string;
  description: string;
  type: 'work' | 'education';
};

// Тартиби: эң жаңысы жогоруда (жылдары боюнча кемүү тартибинде).
export const timeline: TimelineItem[] = [
  {
    period: '2026 — азыр',
    title: 'Негиздөөчү жана жетекчи',
    place: 'ainabi.studio · Технопарк, Бишкек',
    description:
      'IT студияны негиздеп, командага жетекчилик кылам: веб жана мобилдик долбоорлорду пландоо, дизайн жана иштеп чыгуу.',
    type: 'work',
  },
  {
    period: '2026',
    title: 'Студент',
    place: ' Flustack иштеп чыгуу, Евразия эл аралык университети, Программалоо жана IT адистиги',
    description: 'Евразия эл аралык университетинде Графикалык дизайн окуп, практикалык долбоорлорду жасадым.',
    type: 'education',
  },
  {
    period: '2024 — 2025',
    title: 'Frontend иштеп чыгуучу жана дизайнер',
    place: 'Фриланс',
    description:
      'Кардарлар үчүн сайттарды, интерфейстерди жана бренд идентикаларды түздүм — идеядан баштап ишке киргизүүгө чейин.',
    type: 'work',
  },
  {
    period: '2023 — 2024',
    title: 'Өз алдынча билим алуу',
    place: 'Окуу жайы, Бишкек Okurmen IT академиясы, Frontend иштеп чыгуу',
    description:
      'Веб-иштеп чыгуу, UI/UX жана графикалык дизайн боюнча курстар; биринчи долбоорлор жана тажрыйба.',
    type: 'education',
  },
];
