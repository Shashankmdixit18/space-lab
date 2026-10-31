import { Link, useParams } from 'react-router-dom'
import planets from '../../data/planets.json'
import { useT } from '../../hooks/useT'
import HUDPanel from '../../components/cockpit/HUDPanel'
import './planet-guide.css'

export default function PlanetGuide() {
  const { id = '' } = useParams()
  const { language } = useT()
  const planet = id === 'moon' ? { name: 'Moon', name_hi: 'चंद्रमा' } : planets.find(item => item.name.toLowerCase() === id.toLowerCase())
  const name = planet ? (language === 'hi' ? planet.name_hi : planet.name) : id
  const copy = language === 'hi'
    ? { kicker: 'स्पेस नॉलेज हब', title: `${name} गाइड तैयार हो रही है`, text: 'इस पिंड के लिए विस्तृत अध्ययन सामग्री जल्द उपलब्ध होगी।', back: 'एक्सप्लोरर पर लौटें' }
    : { kicker: 'SPACE KNOWLEDGE HUB', title: `${name} guide is in preparation`, text: 'A detailed learning guide for this world will be available here soon.', back: 'Return to the Explorer' }
  return <main className="planet-guide-page"><HUDPanel code="KNOW-01" label={copy.kicker} className="planet-guide-panel"><span>{copy.kicker}</span><h1>{copy.title}</h1><p>{copy.text}</p><Link className="cockpit-button cockpit-button--scan" to="/explorer">{copy.back} ↗</Link></HUDPanel></main>
}
