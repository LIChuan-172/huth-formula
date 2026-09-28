import type { ReactNode } from 'react'

function Sub({ base, sub }: { base: string; sub: string }) {
  return (
    <msub>
      <mi>{base}</mi>
      <mn>{sub}</mn>
    </msub>
  )
}

function Reciprocal({ children }: { children: ReactNode }) {
  return (
    <mfrac>
      <mn>1</mn>
      <mrow>{children}</mrow>
    </mfrac>
  )
}

/** The Huth compliance formula rendered as MathML. */
export function HuthFormula({ className }: { className?: string }) {
  return (
    <math display="block" className={className}>
      <mrow>
        <mi>C</mi>
        <mo>=</mo>
        <msup>
          <mrow>
            <mo>(</mo>
            <mfrac>
              <mrow>
                <Sub base="t" sub="1" />
                <mo>+</mo>
                <Sub base="t" sub="2" />
              </mrow>
              <mrow>
                <mn>2</mn>
                <mi>d</mi>
              </mrow>
            </mfrac>
            <mo>)</mo>
          </mrow>
          <mi>a</mi>
        </msup>
        <mo>·</mo>
        <mfrac>
          <mi>b</mi>
          <mi>n</mi>
        </mfrac>
        <mo>·</mo>
        <mo>[</mo>
        <Reciprocal>
          <Sub base="t" sub="1" />
          <Sub base="E" sub="1" />
        </Reciprocal>
        <mo>+</mo>
        <Reciprocal>
          <mi>n</mi>
          <Sub base="t" sub="2" />
          <Sub base="E" sub="2" />
        </Reciprocal>
        <mo>+</mo>
        <Reciprocal>
          <mn>2</mn>
          <Sub base="t" sub="1" />
          <Sub base="E" sub="f" />
        </Reciprocal>
        <mo>+</mo>
        <Reciprocal>
          <mn>2</mn>
          <mi>n</mi>
          <Sub base="t" sub="2" />
          <Sub base="E" sub="f" />
        </Reciprocal>
        <mo>]</mo>
      </mrow>
    </math>
  )
}

/** k = 1 / C rendered as MathML. */
export function StiffnessFormula({ className }: { className?: string }) {
  return (
    <math display="block" className={className}>
      <mrow>
        <mi>k</mi>
        <mo>=</mo>
        <mfrac>
          <mn>1</mn>
          <mi>C</mi>
        </mfrac>
      </mrow>
    </math>
  )
}
