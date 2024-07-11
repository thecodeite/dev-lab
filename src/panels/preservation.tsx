import { CalculatorBoxDef } from '../dataMaster'

const ukFormat = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 0,
})

export const preservationBoxDef: CalculatorBoxDef = {
  id: 'preservation',
  title: 'Resource preservation',
  leftName: 'items',
  rightName: 'percentToPreserve',
  midWord: 'to',
  calculate: (left: number, right: number) => {
    const items = left
    const percentToPreserve = right
    if (
      Number.isNaN(items) ||
      Number.isNaN(percentToPreserve) ||
      percentToPreserve < 0 ||
      percentToPreserve > 100
    ) {
      return NaN
    }
    if (percentToPreserve === 100) {
      return Number.POSITIVE_INFINITY
    }
    return (100 * items) / (100 - percentToPreserve)
  },
  outputFormatter: (value: number) =>
    `Expected return: ${ukFormat.format(value)}`,

  mod(left) {
    return -left
  },
}
