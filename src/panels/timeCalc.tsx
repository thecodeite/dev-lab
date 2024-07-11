import { CalculatorBoxDef } from '../dataMaster'

export const timeCalc: CalculatorBoxDef = {
  id: 'time-calc',
  title: 'Time Calculator',
  leftName: 'times',
  rightName: 'duration',
  midWord: '*',
  calculate: (duration: number, times: number) => duration * times,
  outputFormatter: (value: number) => {
    if (value < 60) {
      return `${value} seconds`
    } else if (value < 3600) {
      const minutes = Math.floor(value / 60)
      const seconds = Math.floor(value % 60)
      return `${minutes} minutes ${seconds} seconds`
    } else if (value < 86400) {
      const hours = Math.floor(value / 3600)
      const minutes = Math.floor((value % 3600) / 60)
      const seconds = Math.floor(value % 60)
      return `${hours} hours ${minutes} minutes ${seconds} seconds`
    } else {
      const days = Math.floor(value / 86400)
      const hours = Math.floor((value % 86400) / 3600)
      const minutes = Math.floor((value % 3600) / 60)
      const seconds = Math.floor(value % 60)
      return `${days}d ${hours}h ${minutes}m ${seconds}s`
    }
  },
  canPlay: true,
  mod(left) {
    return left
  },
}
