import { HuthFormula, StiffnessFormula } from '@/components/huth-formula'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { JOINT_PRESETS } from '@/lib/huth'
import { useLocale } from '@/lib/use-locale'
import type { Messages } from '@/lib/messages'

function symbolRows(about: Messages['about']) {
  return [
    { symbol: <i>C</i>, meaning: about.symbolCompliance },
    { symbol: <i>k</i>, meaning: about.symbolStiffness },
    {
      symbol: (
        <>
          <i>t</i>
          <sub>1</sub>, <i>t</i>
          <sub>2</sub>
        </>
      ),
      meaning: about.symbolThickness,
    },
    { symbol: <i>d</i>, meaning: about.symbolDiameter },
    {
      symbol: (
        <>
          <i>E</i>
          <sub>1</sub>, <i>E</i>
          <sub>2</sub>, <i>E</i>
          <sub>f</sub>
        </>
      ),
      meaning: about.symbolModulus,
    },
    { symbol: <i>n</i>, meaning: about.symbolPlanes },
    { symbol: <i>a</i>, meaning: about.symbolExponent },
    { symbol: <i>b</i>, meaning: about.symbolCoefficient },
  ]
}

export function Explanation() {
  const { m } = useLocale()
  const about = m.about

  return (
    <Card id="about">
      <CardHeader>
        <CardTitle>{about.title}</CardTitle>
        <CardDescription>{about.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 text-sm leading-relaxed">
        <div className="grid gap-3">
          <p>
            {about.paragraph1.includes(about.compliance) ? (
              <ParagraphWithTerms text={about.paragraph1} compliance={about.compliance} stiffness={about.stiffness} />
            ) : (
              about.paragraph1
            )}
          </p>
          <p>{about.paragraph2}</p>
        </div>

        <div className="overflow-x-auto rounded-xl bg-muted px-4 py-5">
          <HuthFormula className="mx-auto w-fit text-lg" />
          <StiffnessFormula className="mx-auto mt-3 w-fit text-lg" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <h3 className="font-medium">{about.symbols}</h3>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
              {symbolRows(about).map(({ symbol, meaning }, index) => (
                <div key={index} className="contents">
                  <dt className="font-serif text-base">{symbol}</dt>
                  <dd className="text-muted-foreground">{meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid gap-2">
            <h3 className="font-medium">{about.constants}</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-1.5 pr-2 font-medium">{about.joint}</th>
                  <th className="py-1.5 pr-2 font-medium">
                    <i>a</i>
                  </th>
                  <th className="py-1.5 font-medium">
                    <i>b</i>
                  </th>
                </tr>
              </thead>
              <tbody>
                {JOINT_PRESETS.map((preset) => (
                  <tr key={preset.id} className="border-b last:border-0">
                    <td className="py-1.5 pr-2">{m.presets[preset.id].label}</td>
                    <td className="py-1.5 pr-2 font-mono">{preset.a === 2 / 3 ? '2/3' : '2/5'}</td>
                    <td className="py-1.5 font-mono">{preset.b.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground">{about.customHint}</p>
          </div>
        </div>

        <div className="grid gap-2">
          <h3 className="font-medium">{about.reading}</h3>
          <p className="text-muted-foreground">{about.readingBody}</p>
        </div>

        <div className="grid gap-2">
          <h3 className="font-medium">{about.limits}</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>{about.limitForm}</li>
            <li>{about.limitAssumptions}</li>
            <li>
              {about.limitDoubleShear.includes('t1') ? (
                <DoubleShearNote text={about.limitDoubleShear} />
              ) : (
                about.limitDoubleShear
              )}
            </li>
            <li>{about.limitUnits}</li>
          </ul>
        </div>

        <div className="grid gap-2">
          <h3 className="font-medium">{about.references}</h3>
          <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>
              Huth, H. (1984). <i>Zum Einfluß der Nietnachgiebigkeit mehrreihiger Nietverbindungen auf die
              Lastübertragungs- und Lebensdauervorhersage</i>. LBF Report FB-172, Fraunhofer-Institut für
              Betriebsfestigkeit, Darmstadt.
            </li>
            <li>
              Huth, H. (1986). Influence of Fastener Flexibility on the Prediction of Load Transfer and Fatigue Life
              for Multiple-Row Joints. In J. M. Potter (Ed.), <i>Fatigue in Mechanically Fastened Composite and
              Metallic Joints</i>, ASTM STP 927, pp. 221–250.
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

function ParagraphWithTerms({ text, compliance, stiffness }: { text: string; compliance: string; stiffness: string }) {
  const complianceAt = text.indexOf(compliance)
  const stiffnessAt = text.indexOf(stiffness)
  if (complianceAt < 0 || stiffnessAt < 0 || stiffnessAt < complianceAt) return text
  return (
    <>
      {text.slice(0, complianceAt)}
      <strong>{compliance}</strong> <i>C</i>
      {text.slice(complianceAt + compliance.length, stiffnessAt)}
      <strong>{stiffness}</strong> <i>k</i>
      {text.slice(stiffnessAt + stiffness.length)}
    </>
  )
}

function DoubleShearNote({ text }: { text: string }) {
  const parts = text.split(/t1|t2/)
  if (parts.length !== 3) return text
  return (
    <>
      {parts[0]}
      <i>t</i>
      <sub>1</sub>
      {parts[1]}
      <i>t</i>
      <sub>2</sub>
      {parts[2]}
    </>
  )
}
