import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SLOGANS = [
  'Orchestrate the future',
  'Orquestra el futuro',
  'Orchestrez le futur',
  'Die Zukunft orchestrieren',
  'Orkesteroi tulevaisuus',
  'Orkestra masa depan',
  'Orkestreer de toekomst',
  'Agents that deliver',
  'Agentes que entregan',
  'Des agents qui livrent',
  'Agenten, die liefern',
  'AI without limits',
  'IA sans limites',
  'IA sin limites',
  'KI ohne Grenzen',
  'Automate everything',
  'Automatiza todo',
  'Automatisez tout',
  'Alles automatisieren',
  'Automatiseer alles',
  'Build. Deploy. Scale.',
  'Crear. Desplegar. Escalar.',
  'Multi-agent symphony',
  'Symphonie multi-agents',
  'Sinfonia multi-agente',
  'Your AI workforce',
  'Votre main-d\'oeuvre IA',
  'Tu fuerza laboral IA',
  'Smarter together',
  'Juntos, mas inteligentes',
  'Plus intelligents ensemble',
  'Gemeinsam schlauer',
  // Russian & Eastern Slavic
  'Оркестрируй будущее',
  'Оркеструй майбутнє',
  'Orkiestruj przyszłość',
  'Агенты, приносящие результат',
  'Агенти, що приносять результат',
  'Agenci, którzy dostarczają',
  'ИИ без границ',
  'ШІ без кордонів',
  'AI bez granic',
  'Автоматизируй всё',
  'Автоматизуй усе',
  'Automatyzuj wszystko',
  'Создавай. Развёртывай. Масштабируй.',
  'Створюй. Розгортай. Масштабуй.',
  'Buduj. Wdrażaj. Skaluj.',
  'Ваша команда на основе ИИ',
  'Ваша команда на основі ШІ',
  'Twój zespół AI',
  'Вместе мы умнее',
  'Разом розумніші',
  'Mądrzejsi razem',
  'Интеллект в действии',
  'Інтелект у дії',
  'Intelekt w działaniu',
  // Asian Languages (Chinese, Japanese, Korean)
  '编排未来',
  '未来を指揮する',
  '미래를 지휘하다',
  '交付结果的智能体',
  '成果を届けるエージェント',
  '결과를 전달하는 에이전트',
  '无限人工智能',
  '限界のない AI',
  '제한 없는 AI',
  '自动化一切',
  'すべてを自動化',
  '모든 것을 자동화하라',
  '构建。部署。扩展。',
  '構築。展開。拡張。',
  '구축. 배포. 확장.',
  '你的 AI 劳动力',
  'あなたの AI ワークフォース',
  '당신의 AI 인력',
  '携手更智能',
  '共に、より賢く',
  '함께 더 스마트하게',
  '智能进化',
  '進化するインテリジェンス',
  '진화하는 지능',
  // Hindi & Southeast Asian
  'भविष्य को संचालित करें',
  'Điều phối tương lai',
  'परिणाम देने वाले एजेंट',
  'Các đại lý mang lại kết quả',
  'बिना सीमा के AI',
  'AI không giới hạn',
  'सब कुछ स्वचालित करें',
  'Tự động hóa mọi thứ',
  'बनाएं। तैनात करें। बढ़ाएं।',
  'Xây dựng. Triển khai. Mở rộng.',
  'आपकी AI कार्यबल',
  'Lực lượng lao động AI của bạn',
  'साथ मिलकर होशियार',
  'Thông minh hơn cùng nhau',
  // Arabic & Turkish
  'نسق المستقبل',
  'Geleceği yönet',
  'وكلاء يحققون النتائج',
  'Sonuç odaklı ajanlar',
  'ذكاء اصطناعي بلا حدود',
  'Sınırsız Yapay Zeka',
  'أتمتة كل شيء',
  'Her şeyi otomatikleştir',
  'بناء. نشر. توسيع.',
  'İnşa Et. Dağıt. Ölçeklendir.',
  'قوة العمل بالذكاء الاصطناعي',
  'Yapay Zeka İş Gücünüz',
  'أذكى معًا',
  'Birlikte Daha Akıllı',
  // New Variations (Global)
  'Intelligence evolved',
  'Интеллект эволюционировал',
  'Інтелект еволюціонував',
  '智能进化',
  'Seamless integration',
  'Бесшовная интеграция',
  'Безшовна інтеграція',
  '无缝集成',
  'Beyond automation',
  'За пределами автоматизации',
  'За межами автоматизації',
  '超越自动化',
  'Precision at scale',
  'Точность в масштабе',
  'Точність у масштабі',
  '规模精准',
];

function Slogan() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * SLOGANS.length));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const delay = 3500 + Math.random() * 2500;
      timer = setTimeout(() => {
        setIdx((prev) => {
          let n;
          do { n = Math.floor(Math.random() * SLOGANS.length); } while (n === prev);
          return n;
        });
        tick();
      }, delay);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-4 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="text-[10px] text-fg-dimmed tracking-wide"
        >
          {SLOGANS[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function Logo({ className = '', showSlogan = false }: { className?: string; showSlogan?: boolean }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M8 16C8 11.582 11.582 8 16 8C20.418 8 24 11.582 24 16" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M12 16C12 13.791 13.791 12 16 12C18.209 12 20 13.791 20 16" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="2" fill="#06b6d4"/>
            <path d="M16 18V24" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 22L16 24L20 22" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="absolute inset-0 bg-sick-500/20 blur-lg rounded-full" />
        </div>
        <span className="logo-glitch font-display font-bold text-lg tracking-tight" data-text="SickAgent">
          <span className="text-fg">Sick</span>
          <span className="text-sick-400">Agent</span>
        </span>
      </div>
      {showSlogan && (
        <div className="mt-1 pl-[42px]">
          <Slogan />
        </div>
      )}
    </div>
  );
}
