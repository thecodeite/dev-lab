import { CalculatorBoxDef } from '../dataMaster'
import { xp } from '../xp'

export const ukFormat = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 0,
})

export const xpCalc: CalculatorBoxDef = {
  id: 'xp-calc',
  title: 'XP Calculator',
  leftName: 'current Xp',
  rightName: 'target level',
  midWord: 'to',
  calculate: (currentXPArg: number, targetLevelArg: number) => {
    if (
      !Number.isNaN(targetLevelArg) &&
      !Number.isNaN(currentXPArg) &&
      targetLevelArg > 0 &&
      targetLevelArg <= 100 &&
      xp[targetLevelArg] !== undefined
    ) {
      return xp[targetLevelArg] - currentXPArg
    }
    return NaN
  },
  outputFormatter: (value: number) => `XP Needed: ${ukFormat.format(value)}`,
  target: { id: 'reps', side: 'leftStr' },
  mod(left) {
    return -left
  },
}
