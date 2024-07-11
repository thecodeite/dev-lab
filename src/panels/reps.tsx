import { CalculatorBoxDef } from '../dataMaster'

const ukFormat = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 0,
})

export const reps: CalculatorBoxDef = {
  id: 'reps',
  title: 'Repetitions',
  leftName: 'target value',
  rightName: 'per',
  midWord: 'to',
  calculate: (target: number, per: number) => Math.ceil(target / per),
  outputFormatter: (value: number) => `Times: ${ukFormat.format(value)}`,
  target: { id: 'time-calc', side: 'leftStr' },
  mod(left: number, right: number) {
    console.log(`mod: reps - ${left} ${right}`)
    return right * left
  },
}
