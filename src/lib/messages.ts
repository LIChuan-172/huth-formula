import type { HuthField, JointPresetId, ShearType } from '@/lib/huth'

export type Language = 'en' | 'zh'

export interface Messages {
  meta: { title: string; description: string }
  language: { label: string; en: string; zh: string }
  header: { eyebrow: string; title: string; lede: string; guide: string; offlineCopy: string }
  footer: { local: string; disclaimer: string }
  inputs: {
    title: string
    description: string
    reset: string
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
    lede: 'Estimate the shear compliance and stiffness of a bolt or rivet in a lap joint using Huth’s 1986 formula. Supports single and double shear, and metallic and composite plates. Thicknesses and diameter are in mm; moduli are in MPa.',
    guide: 'Guide (PDF)',
    offlineCopy: 'Offline copy',
  },
  footer: {
    local: 'Runs entirely in your browser; nothing you enter is sent anywhere.',
    disclaimer: 'Engineering estimate only. Verify against test data for certification work.',
  },
  inputs: {
    title: 'Joint definition',
    description: 'Results update as you type. Plate 2 is the middle plate in a double-shear joint.',
    reset: 'Reset',
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
    lede: '用 Huth 1986 公式估算搭接接头中螺栓或铆钉的剪切柔度与刚度。支持单剪与双剪，以及金属与复合材料板。厚度和直径单位为 mm，模量单位为 MPa。',
    guide: '导读（PDF）',
    offlineCopy: '离线副本',
  },
  footer: {
    local: '计算完全在浏览器中进行，输入内容不会发送到任何地方。',
    disclaimer: '仅供工程估算。用于认证时请对照试验数据校核。',
  },
  inputs: {
    title: '接头定义',
    description: '输入时即时更新结果。双剪接头中，板 2 为中间板。',
    reset: '重置',
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
} satisfies Messages

export const MESSAGES: Record<Language, Messages> = { en, zh }
