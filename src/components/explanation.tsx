import { HuthFormula, StiffnessFormula } from '@/components/huth-formula'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { JOINT_PRESETS } from '@/lib/huth'

const SYMBOLS: { symbol: React.ReactNode; meaning: string }[] = [
  { symbol: <i>C</i>, meaning: 'Fastener compliance (flexibility): displacement per unit of transferred load.' },
  { symbol: <i>k</i>, meaning: 'Fastener stiffness, the reciprocal of the compliance.' },
  {
    symbol: (
      <>
        <i>t</i>
        <sub>1</sub>, <i>t</i>
        <sub>2</sub>
      </>
    ),
    meaning: 'Plate thicknesses. In double shear, plate 2 is the centre plate and t1 is one outer plate.',
  },
  { symbol: <i>d</i>, meaning: 'Fastener shank diameter.' },
  {
    symbol: (
      <>
        <i>E</i>
        <sub>1</sub>, <i>E</i>
        <sub>2</sub>, <i>E</i>
        <sub>f</sub>
      </>
    ),
    meaning: "Young's moduli of plate 1, plate 2 and the fastener.",
  },
  { symbol: <i>n</i>, meaning: 'Number of shear planes: 1 for single shear, 2 for double shear.' },
  { symbol: <i>a</i>, meaning: 'Exponent on the thickness-to-diameter ratio; captures fastener bending and tilting.' },
  { symbol: <i>b</i>, meaning: 'Empirical coefficient fitted to Huth\u2019s test data for each joint type.' },
]

export function Explanation() {
  return (
    <Card id="about">
      <CardHeader>
        <CardTitle>What this calculates</CardTitle>
        <CardDescription>
          The Huth formula is a semi-empirical estimate of how much a single fastener deflects in shear.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 text-sm leading-relaxed">
        <div className="grid gap-3">
          <p>
            When a bolted or riveted joint carries load, the fastener does not act as a rigid pin. It bends, tilts
            and bears into the plates, so the two plates slip relative to one another. That slip per unit of load
            is the fastener <strong>compliance</strong> <i>C</i>; its reciprocal is the fastener{' '}
            <strong>stiffness</strong> <i>k</i>. In a multi-row joint the stiffness of each fastener decides how
            the total load is shared between rows, which in turn governs bearing stresses and fatigue life.
          </p>
          <p>
            Heimo Huth derived the expression below from load-transfer tests on aluminium, titanium and
            graphite/epoxy specimens (LBF report FB-172, 1984; ASTM STP 927, 1986). It is widely used as the
            spring stiffness for fastener elements in finite-element and analytical joint models.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl bg-muted px-4 py-5">
          <HuthFormula className="mx-auto w-fit text-lg" />
          <StiffnessFormula className="mx-auto mt-3 w-fit text-lg" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <h3 className="font-medium">Symbols</h3>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
              {SYMBOLS.map(({ symbol, meaning }, index) => (
                <div key={index} className="contents">
                  <dt className="font-serif text-base">{symbol}</dt>
                  <dd className="text-muted-foreground">{meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid gap-2">
            <h3 className="font-medium">Joint-type constants</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-1.5 pr-2 font-medium">Joint</th>
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
                    <td className="py-1.5 pr-2">{preset.label}</td>
                    <td className="py-1.5 pr-2 font-mono">{preset.a === 2 / 3 ? '2/3' : '2/5'}</td>
                    <td className="py-1.5 font-mono">{preset.b.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground">
              Use custom constants when you have your own test data or a company-specific calibration.
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <h3 className="font-medium">Reading the terms</h3>
          <p className="text-muted-foreground">
            The leading factor scales the flexibility with how slender the fastener is relative to the grip: the
            larger the combined thickness compared to the diameter, the more the fastener bends. The four terms
            inside the brackets are the bearing flexibilities of plate 1, plate 2 and the fastener at each plate.
            The <i>n</i> in the second and fourth terms halves the contribution of the centre plate in double shear,
            because it bears on two shear planes.
          </p>
        </div>

        <div className="grid gap-2">
          <h3 className="font-medium">Notes and limits</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              This tool follows the symmetric form from Huth&rsquo;s original report. The ASTM STP 927 reprint
              contains a typographical error (an <i>n</i> instead of a 2 in the third term) that makes single-shear
              results depend on which plate is labelled 1.
            </li>
            <li>
              The model assumes elastic behaviour, a neat-fit fastener and no clamp-up friction. It does not account
              for hole clearance, interference fit, countersinks or fastener preload.
            </li>
            <li>
              For double shear, <i>t</i>
              <sub>1</sub> is the thickness of one outer plate and <i>t</i>
              <sub>2</sub> is the full thickness of the centre plate.
            </li>
            <li>
              Units must be consistent. With mm and MPa the compliance is in mm/N and the stiffness in N/mm; with in
              and psi the compliance is in in/lbf and the stiffness in lbf/in.
            </li>
          </ul>
        </div>

        <div className="grid gap-2">
          <h3 className="font-medium">References</h3>
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
