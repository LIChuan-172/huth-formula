import type { HuthField, JointPresetId, ShearType } from '@/lib/huth'

export type Language = 'en' | 'zh'

export interface Messages {
  meta: { title: string; description: string }
  language: { label: string; en: string; zh: string }
  header: { eyebrow: string; title: string; lede: string; aboutLink: string }
  footer: { local: string; disclaimer: string }
  inputs: {
    title: string
    description: string
    reset: string
    units: string
    unitsSi: string
    unitsImperial: string
    unitsHint: string
    shear: string
    shearSingle: string
    shearDouble: string
    shearSingleHint: string
    shearDoubleHint: string
    joint: string
    custom: string
    exponent: string
    exponentHint: string
    coefficient: string
    coefficientHint: string
    geometry: string
    materials: string
    typicalSi: string
    typicalImperial: string
  }
  presets: Record<JointPresetId, { label: string; description: string }>
  fields: Record<HuthField, string>
  errors: {
    summary: string
    required: (label: string) => string
    number: (label: string) => string
    positive: (label: string) => string
    nonNegative: (label: string) => string
  }
  results: {
    title: string
    description: string
    copy: string
    copied: string
    stiffness: string
    compliance: string
    breakdown: string
    geometryFactor: string
    jointFactor: string
    plate1Bearing: string
    plate2Bearing: string
    fastenerAtPlate1: string
    fastenerAtPlate2: string
    bracketSum: string
    shareHint: string
    summaryTitle: string
    shearLine: (shear: ShearType, n: number, a: number, b: number) => string
  }
  about: {
    title: string
    description: string
    paragraph1: string
    paragraph2: string
    compliance: string
    stiffness: string
    symbols: string
    symbolCompliance: string
    symbolStiffness: string
    symbolThickness: string
    symbolDiameter: string
    symbolModulus: string
    symbolPlanes: string
    symbolExponent: string
    symbolCoefficient: string
    constants: string
    joint: string
    customHint: string
    reading: string
    readingBody: string
    limits: string
    limitForm: string
    limitAssumptions: string
    limitDoubleShear: string
    limitUnits: string
    references: string
  }
}

const en = {
  meta: {
    title: 'Huth fastener stiffness calculator',
    description:
      'Calculate fastener shear stiffness and compliance with the Huth (1986) formula for bolted and riveted metallic and composite joints.',
  },
  language: { label: 'Language', en: 'English', zh: '中文' },
  header: {
    eyebrow: 'Fastener flexibility',
    title: 'Huth fastener stiffness calculator',
    lede: 'Estimate the shear compliance and stiffness of a bolt or rivet in a lap joint using Huth’s 1986 formula. Supports single and double shear, metallic and composite plates, SI and imperial units.',
    aboutLink: 'How the formula works',
  },
  footer: {
    local: 'Runs entirely in your browser; nothing you enter is sent anywhere.',
    disclaimer: 'Engineering estimate only. Verify against test data for certification work.',
  },
  inputs: {
    title: 'Joint definition',
    description: 'Results update as you type. Plate 2 is the middle plate in a double-shear joint.',
    reset: 'Reset',
    units: 'Unit system',
    unitsSi: 'SI (mm, MPa)',
    unitsImperial: 'Imperial (in, psi)',
    unitsHint: 'Switching units converts the values you have entered.',
    shear: 'Shear configuration',
    shearSingle: 'Single shear (n = 1)',
    shearDouble: 'Double shear (n = 2)',
    shearSingleHint: 'Two plates, one shear plane through the fastener.',
    shearDoubleHint: 'Three plates, two shear planes; plate 2 is the centre plate.',
    joint: 'Joint type',
    custom: 'Custom constants',
    exponent: 'Exponent',
    exponentHint: 'Huth used 2/3 for bolts and 2/5 for rivets.',
    coefficient: 'Coefficient',
    coefficientHint: 'Huth used 3.0 (bolted metal), 2.2 (riveted) and 4.2 (bolted composite).',
    geometry: 'Geometry',
    materials: 'Materials',
    typicalSi: 'Typical: aluminium 72 000, titanium 110 000, steel 210 000 MPa.',
    typicalImperial: 'Typical: aluminium 10.5e6, titanium 16e6, steel 30e6 psi.',
  },
  presets: {
    'bolted-metallic': {
      label: 'Bolted, metallic plates',
      description: 'Bolts through aluminium, titanium or steel sheets.',
    },
    'riveted-metallic': {
      label: 'Riveted, metallic plates',
      description: 'Solid rivets through metallic sheets.',
    },
    'bolted-composite': {
      label: 'Bolted, graphite/epoxy plates',
      description: 'Bolts through carbon-fibre reinforced laminates.',
    },
  },
  fields: {
    t1: 'Plate 1 thickness',
    t2: 'Plate 2 thickness',
    d: 'Fastener diameter',
    E1: 'Plate 1 modulus',
    E2: 'Plate 2 modulus',
    Ef: 'Fastener modulus',
    a: 'Exponent a',
    b: 'Coefficient b',
  },
  errors: {
    summary: 'Check the highlighted inputs',
    required: (label: string) => `${label} is required.`,
    number: (label: string) => `${label} must be a number.`,
    positive: (label: string) => `${label} must be greater than zero.`,
    nonNegative: (label: string) => `${label} must not be negative.`,
  },
  results: {
    title: 'Results',
    description: 'Compliance and stiffness of one fastener in shear.',
    copy: 'Copy',
    copied: 'Copied',
    stiffness: 'Stiffness',
    compliance: 'Compliance',
    breakdown: 'Breakdown',
    geometryFactor: 'Geometry factor',
    jointFactor: 'Joint factor b / n',
    plate1Bearing: 'Plate 1 bearing',
    plate2Bearing: 'Plate 2 bearing',
    fastenerAtPlate1: 'Fastener at plate 1',
    fastenerAtPlate2: 'Fastener at plate 2',
    bracketSum: 'Bracket sum',
    shareHint: "Percentages show each term's share of the bracket sum, i.e. where the flexibility comes from.",
    summaryTitle: 'Huth fastener flexibility',
    shearLine: (shear: ShearType, n: number, a: number, b: number) =>
      `${shear} shear (n = ${n}), a = ${a}, b = ${b}`,
  },
  about: {
    title: 'What this calculates',
    description: 'The Huth formula is a semi-empirical estimate of how much a single fastener deflects in shear.',
    paragraph1:
      'When a bolted or riveted joint carries load, the fastener does not act as a rigid pin. It bends, tilts and bears into the plates, so the two plates slip relative to one another. That slip per unit of load is the fastener compliance; its reciprocal is the fastener stiffness. In a multi-row joint the stiffness of each fastener decides how the total load is shared between rows, which in turn governs bearing stresses and fatigue life.',
    paragraph2:
      'Heimo Huth derived the expression below from load-transfer tests on aluminium, titanium and graphite/epoxy specimens (LBF report FB-172, 1984; ASTM STP 927, 1986). It is widely used as the spring stiffness for fastener elements in finite-element and analytical joint models.',
    compliance: 'compliance',
    stiffness: 'stiffness',
    symbols: 'Symbols',
    symbolCompliance: 'Fastener compliance (flexibility): displacement per unit of transferred load.',
    symbolStiffness: 'Fastener stiffness, the reciprocal of the compliance.',
    symbolThickness: 'Plate thicknesses. In double shear, plate 2 is the centre plate and t1 is one outer plate.',
    symbolDiameter: 'Fastener shank diameter.',
    symbolModulus: "Young's moduli of plate 1, plate 2 and the fastener.",
    symbolPlanes: 'Number of shear planes: 1 for single shear, 2 for double shear.',
    symbolExponent: 'Exponent on the thickness-to-diameter ratio; captures fastener bending and tilting.',
    symbolCoefficient: 'Empirical coefficient fitted to Huth’s test data for each joint type.',
    constants: 'Joint-type constants',
    joint: 'Joint',
    customHint: 'Use custom constants when you have your own test data or a company-specific calibration.',
    reading: 'Reading the terms',
    readingBody:
      'The leading factor scales the flexibility with how slender the fastener is relative to the grip: the larger the combined thickness compared to the diameter, the more the fastener bends. The four terms inside the brackets are the bearing flexibilities of plate 1, plate 2 and the fastener at each plate. The n in the second and fourth terms halves the contribution of the centre plate in double shear, because it bears on two shear planes.',
    limits: 'Notes and limits',
    limitForm:
      'This tool follows the symmetric form from Huth’s original report. The ASTM STP 927 reprint contains a typographical error (an n instead of a 2 in the third term) that makes single-shear results depend on which plate is labelled 1.',
    limitAssumptions:
      'The model assumes elastic behaviour, a neat-fit fastener and no clamp-up friction. It does not account for hole clearance, interference fit, countersinks or fastener preload.',
    limitDoubleShear:
      'For double shear, t1 is the thickness of one outer plate and t2 is the full thickness of the centre plate.',
    limitUnits:
      'Units must be consistent. With mm and MPa the compliance is in mm/N and the stiffness in N/mm; with in and psi the compliance is in in/lbf and the stiffness in lbf/in.',
    references: 'References',
  },
} satisfies Messages

/** Inserts a space when a label ends in Latin text, so “系数 b” does not collide with the following Chinese. */
function zhPhrase(label: string, rest: string): string {
  return /[A-Za-z0-9]$/.test(label) ? `${label} ${rest}` : `${label}${rest}`
}

const zh = {
  meta: {
    title: 'Huth 紧固件刚度计算器',
    description: '用 Huth（1986）公式计算螺栓与铆钉在金属及复合材料接头中的剪切刚度和柔度。',
  },
  language: { label: '语言', en: 'English', zh: '中文' },
  header: {
    eyebrow: '紧固件柔度',
    title: 'Huth 紧固件刚度计算器',
    lede: '用 Huth 1986 公式估算搭接接头中螺栓或铆钉的剪切柔度与刚度。支持单剪与双剪、金属与复合材料板，以及国际单位制和英制。',
    aboutLink: '公式说明',
  },
  footer: {
    local: '计算完全在浏览器中进行，输入内容不会发送到任何地方。',
    disclaimer: '仅供工程估算。用于认证时请对照试验数据校核。',
  },
  inputs: {
    title: '接头定义',
    description: '输入时即时更新结果。双剪接头中，板 2 为中间板。',
    reset: '重置',
    units: '单位制',
    unitsSi: '国际单位（mm、MPa）',
    unitsImperial: '英制（in、psi）',
    unitsHint: '切换单位会换算已输入的数值。',
    shear: '剪切形式',
    shearSingle: '单剪（n = 1）',
    shearDouble: '双剪（n = 2）',
    shearSingleHint: '两块板，紧固件上有一个剪切面。',
    shearDoubleHint: '三块板、两个剪切面；板 2 为中间板。',
    joint: '接头类型',
    custom: '自定义常数',
    exponent: '指数',
    exponentHint: 'Huth 对螺栓取 2/3，对铆钉取 2/5。',
    coefficient: '系数',
    coefficientHint: 'Huth 对金属螺栓取 3.0，铆接取 2.2，复合材料螺栓取 4.2。',
    geometry: '几何',
    materials: '材料',
    typicalSi: '典型值：铝 72 000，钛 110 000，钢 210 000 MPa。',
    typicalImperial: '典型值：铝 10.5e6，钛 16e6，钢 30e6 psi。',
  },
  presets: {
    'bolted-metallic': {
      label: '螺栓，金属板',
      description: '螺栓连接铝、钛或钢板。',
    },
    'riveted-metallic': {
      label: '铆钉，金属板',
      description: '实心铆钉连接金属板。',
    },
    'bolted-composite': {
      label: '螺栓，石墨/环氧板',
      description: '螺栓连接碳纤维增强层压板。',
    },
  },
  fields: {
    t1: '板 1 厚度',
    t2: '板 2 厚度',
    d: '紧固件直径',
    E1: '板 1 模量',
    E2: '板 2 模量',
    Ef: '紧固件模量',
    a: '指数 a',
    b: '系数 b',
  },
  errors: {
    summary: '请检查标出的输入',
    required: (label: string) => zhPhrase(label, '为必填项。'),
    number: (label: string) => zhPhrase(label, '必须是数字。'),
    positive: (label: string) => zhPhrase(label, '必须大于零。'),
    nonNegative: (label: string) => zhPhrase(label, '不能为负。'),
  },
  results: {
    title: '结果',
    description: '单个紧固件在剪切下的柔度与刚度。',
    copy: '复制',
    copied: '已复制',
    stiffness: '刚度',
    compliance: '柔度',
    breakdown: '分项',
    geometryFactor: '几何因子',
    jointFactor: '接头因子 b / n',
    plate1Bearing: '板 1 挤压',
    plate2Bearing: '板 2 挤压',
    fastenerAtPlate1: '紧固件在板 1',
    fastenerAtPlate2: '紧固件在板 2',
    bracketSum: '括号求和',
    shareHint: '百分比表示各项在括号求和中所占份额，即柔度的来源。',
    summaryTitle: 'Huth 紧固件柔度',
    shearLine: (shear: ShearType, n: number, a: number, b: number) =>
      `${shear === 'double' ? '双剪' : '单剪'}（n = ${n}），a = ${a}，b = ${b}`,
  },
  about: {
    title: '计算内容',
    description: 'Huth 公式是对单个紧固件在剪切下挠曲量的半经验估算。',
    paragraph1:
      '螺栓或铆接接头受载时，紧固件并不是一根刚性销。它会弯曲、倾斜，并挤压孔壁，使两块板发生相对滑移。单位载荷下的滑移量就是紧固件柔度，其倒数是紧固件刚度。在多排接头中，每个紧固件的刚度决定总载荷如何在各排之间分配，进而影响挤压应力与疲劳寿命。',
    paragraph2:
      'Heimo Huth 根据铝、钛和石墨/环氧试样的传载试验推导出下面的表达式（LBF 报告 FB-172，1984；ASTM STP 927，1986）。它被广泛用作有限元和分析接头模型中紧固件单元的弹簧刚度。',
    compliance: '柔度',
    stiffness: '刚度',
    symbols: '符号',
    symbolCompliance: '紧固件柔度（柔性）：单位传递载荷下的位移。',
    symbolStiffness: '紧固件刚度，即柔度的倒数。',
    symbolThickness: '板厚。双剪时，板 2 为中间板，t1 为一侧外板。',
    symbolDiameter: '紧固件钉杆直径。',
    symbolModulus: '板 1、板 2 和紧固件的杨氏模量。',
    symbolPlanes: '剪切面数：单剪为 1，双剪为 2。',
    symbolExponent: '厚度与直径之比的指数，反映紧固件的弯曲与倾斜。',
    symbolCoefficient: '按接头类型由 Huth 试验数据拟合的经验系数。',
    constants: '接头类型常数',
    joint: '接头',
    customHint: '若已有自有试验数据或企业标定值，请使用自定义常数。',
    reading: '各项的含义',
    readingBody:
      '前导因子按紧固件相对夹持厚度的细长程度放大柔度：组合厚度相对直径越大，紧固件弯曲越明显。括号中的四项分别是板 1、板 2 以及紧固件在各板处的挤压柔度。第二项和第四项中的 n 使双剪时中间板的贡献减半，因为它作用在两个剪切面上。',
    limits: '说明与适用范围',
    limitForm:
      '本工具采用 Huth 原始报告中的对称形式。ASTM STP 927 的转载本有一处排印错误（第三项中的 2 被印成了 n），会使单剪结果取决于哪块板标为 1。',
    limitAssumptions:
      '模型假定弹性行为、紧配合紧固件且无夹紧摩擦。它不考虑孔间隙、干涉配合、锪窝或紧固件预紧力。',
    limitDoubleShear: '双剪时，t1 为一侧外板的厚度，t2 为中间板的全厚度。',
    limitUnits:
      '单位必须自洽。使用 mm 与 MPa 时，柔度为 mm/N，刚度为 N/mm；使用 in 与 psi 时，柔度为 in/lbf，刚度为 lbf/in。',
    references: '参考文献',
  },
} satisfies Messages

export const MESSAGES: Record<Language, Messages> = { en, zh }
