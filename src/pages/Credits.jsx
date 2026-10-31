import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import './credits.css'

const content = {
  en: {
    kicker: 'SPACE LAB · ACKNOWLEDGEMENTS', title: 'Credits & sources',
    intro: 'SpaceLab combines educational information, public imagery and open-source software. These credits identify the sources used by the project.',
    textures: 'Planet textures', textureText: 'Planet, Sun, Moon and atmosphere texture maps are from Solar System Scope / INOVE and are distributed under Creative Commons Attribution 4.0 International (CC BY 4.0). Solar System Scope notes that its maps are based in part on NASA imagery and data, including NASA Blue Marble for Earth. NASA is credited as the original imagery/data source where applicable.',
    information: 'Science information', infoText: 'Learning content and mission facts are prepared from NASA and ISRO educational and mission resources. Follow the links below to their official sites.',
    libraries: 'Libraries and tools', libraryText: 'React, React DOM, React Router, Three.js, React Three Fiber, GSAP, ScrollTrigger, Lenis, Recharts, React Icons, Base UI, Class Variance Authority, cn, Tailwind CSS, tw-animate-css, shadcn, Vite, the Vite React and Tailwind plugins, Oxlint, and Watermelon UI.',
    textureLink: 'Solar System Scope texture library ↗', nasa: 'NASA ↗', isro: 'ISRO ↗', license: 'CC BY 4.0 license ↗', back: '← Back to SpaceLab'
  },
  hi: {
    kicker: 'स्पेस लैब · आभार', title: 'श्रेय और स्रोत',
    intro: 'SpaceLab में शैक्षिक जानकारी, सार्वजनिक चित्र और ओपन-सोर्स सॉफ़्टवेयर का उपयोग किया गया है। इस पृष्ठ पर परियोजना के स्रोत दिए गए हैं।',
    textures: 'ग्रहों के टेक्सचर', textureText: 'ग्रह, सूर्य, चंद्रमा और वायुमंडल के टेक्सचर Solar System Scope / INOVE से हैं और Creative Commons Attribution 4.0 International (CC BY 4.0) के अंतर्गत दिए गए हैं। Solar System Scope के अनुसार इनके कुछ नक्शे NASA की छवियों और डेटा पर आधारित हैं, जिनमें पृथ्वी के लिए NASA Blue Marble भी शामिल है। जहाँ लागू हो, मूल छवि और डेटा स्रोत के रूप में NASA को श्रेय दिया गया है।',
    information: 'विज्ञान संबंधी जानकारी', infoText: 'सीखने की सामग्री और मिशन संबंधी तथ्य NASA तथा ISRO के शैक्षिक और मिशन संसाधनों से तैयार किए गए हैं। उनके आधिकारिक पृष्ठ देखने के लिए नीचे दिए लिंक खोलें।',
    libraries: 'लाइब्रेरी और टूल', libraryText: 'React, React DOM, React Router, Three.js, React Three Fiber, GSAP, ScrollTrigger, Lenis, Recharts, React Icons, Base UI, Class Variance Authority, cn, Tailwind CSS, tw-animate-css, shadcn, Vite, Vite React और Tailwind प्लगइन, Oxlint और Watermelon UI।',
    textureLink: 'Solar System Scope टेक्सचर लाइब्रेरी ↗', nasa: 'NASA ↗', isro: 'ISRO ↗', license: 'CC BY 4.0 लाइसेंस ↗', back: '← SpaceLab पर वापस जाएँ'
  }
}

export default function Credits() {
  const { language } = useSettings()
  const c = content[language === 'hi' ? 'hi' : 'en']
  return <main className="credits-page">
    <Link to="/" className="learn-back">{c.back}</Link>
    <header className="learn-hero"><span>{c.kicker}</span><h1>{c.title}</h1><p>{c.intro}</p></header>
    <section className="credits-grid">
      <article><h2>{c.textures}</h2><p>{c.textureText}</p><ul><li><a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">{c.textureLink}</a></li><li><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">{c.license}</a></li></ul></article>
      <article><h2>{c.information}</h2><p>{c.infoText}</p><ul><li><a href="https://www.nasa.gov/" target="_blank" rel="noreferrer">{c.nasa}</a></li><li><a href="https://www.isro.gov.in/" target="_blank" rel="noreferrer">{c.isro}</a></li></ul></article>
      <article><h2>{c.libraries}</h2><p>{c.libraryText}</p></article>
    </section>
  </main>
}
