import { CalculatorBoxDef } from '../dataMaster'
import { preservationBoxDef } from './preservation'
import { timeCalc } from './timeCalc'
import { reps } from './reps'
import { xpCalc } from './xpCalc'

export const boxes: CalculatorBoxDef[] = [
  xpCalc,
  reps,
  timeCalc,
  preservationBoxDef,
]
