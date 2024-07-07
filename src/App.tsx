import { useState } from 'react'
import styled from 'styled-components'
import { xp } from './xp'
import { Countdown } from './Countdown'

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
`

const Result = styled.pre`
  display: block;
  margin-top: 20px;
  font-size: 20px;
`

const ButtonTray = styled.div`
  display: flex;
`

interface Target {
  id: string
  side: 'leftStr' | 'rightStr'
}

interface BoundTo {
  id: string
}

interface CalculatorBoxDef {
  id: string
  title: string
  leftName: string
  rightName: string
  midWord: string
  calculate: (left: number, right: number) => number
  outputFormatter: (value: number) => string
  target?: Target
  canPlay?: boolean
  mod?: (left: number, right: number) => number
}

const ukFormat = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 0,
})

const boxes: CalculatorBoxDef[] = [
  {
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
  },
  {
    id: 'reps',
    title: 'Repetitions',
    leftName: 'target value',
    rightName: 'per',
    midWord: 'to',
    calculate: (target, per) => Math.ceil(target / per),
    outputFormatter: (value: number) => `Times: ${ukFormat.format(value)}`,
    target: { id: 'time-calc', side: 'leftStr' },
    mod(left, right) {
      console.log(`mod: reps - ${left} ${right}`)
      return right * left
    },
  },
  {
    id: 'time-calc',
    title: 'Time Calculator',
    leftName: 'times',
    rightName: 'duration',
    midWord: '*',
    calculate: (duration, times) => duration * times,
    outputFormatter: (value: number) => {
      if (value < 60) {
        return `${value} seconds`
      } else if (value < 3600) {
        const minutes = Math.floor(value / 60)
        const seconds = value % 60
        return `${minutes} minutes ${seconds} seconds`
      } else if (value < 86400) {
        const hours = Math.floor(value / 3600)
        const minutes = Math.floor((value % 3600) / 60)
        const seconds = value % 60
        return `${hours} hours ${minutes} minutes ${seconds} seconds`
      } else {
        const days = Math.floor(value / 86400)
        const hours = Math.floor((value % 86400) / 3600)
        const minutes = Math.floor((value % 3600) / 60)
        const seconds = value % 60
        return `${days}d ${hours}h ${minutes}m ${seconds}s`
      }
    },
    canPlay: true,
  },
]

interface MasterInterface {
  push: (box: CalculatorBoxDef, target: Target) => void
  bind: (box: CalculatorBoxDef, target: Target) => void
  outputIsBound(target: Target): boolean
  dec: (
    prev: MasterCalculatorState,
    id: string,
    value: number
  ) => MasterCalculatorState
  play: (box: CalculatorBoxDef) => void
  stop: (box: CalculatorBoxDef) => void
  setLeft: (id: string, value: string) => void
  setRight: (id: string, value: string) => void
  calculateValue: (id: string) => number
  calculate: (id: string) => string
}

interface MasterCalculatorState {
  [key: string]: {
    leftStr: string | BoundTo
    rightStr: string | BoundTo
    intervalHandle?: number
  }
}

function useMasterCalculator(boxes: CalculatorBoxDef[]) {
  const [state, setState] = useState<MasterCalculatorState>(() => {
    return boxes
      .map((box) => {
        return {
          [box.id]: {
            leftStr: '',
            rightStr: '',
          },
        }
      })
      .reduce((acc, item) => {
        return { ...acc, ...item }
      }, {} as MasterCalculatorState)
  })

  const master: MasterInterface = {
    push(box: CalculatorBoxDef, target: Target) {
      const value = master.calculateValue(box.id)
      console.log('push', box.id, target.id, value)
      setState((prev) => {
        return {
          ...prev,
          [target.id]: {
            ...prev[target.id],
            [target.side]: value.toString(),
          },
        }
      })
    },
    bind(box: CalculatorBoxDef, target: Target) {
      const targetState = state[target.id][target.side]
      if (targetState === undefined || typeof targetState === 'string') {
        console.log('bind', box.id, target.id)
        setState((prev) => {
          return {
            ...prev,
            [target.id]: {
              ...prev[target.id],
              [target.side]: {
                id: box.id,
              },
            },
          }
        })
      } else {
        console.log('un-bind', box.id, target.id)
        setState((prev) => {
          return {
            ...prev,
            [target.id]: {
              ...prev[target.id],
              [target.side]: master.calculateValue(box.id).toString(),
            },
          }
        })
      }
    },
    outputIsBound(target: Target) {
      const value = state[target.id][target.side]
      return value !== undefined && typeof value !== 'string'
    },
    dec(prev: MasterCalculatorState, id: string, value: number) {
      const oldValue = prev[id].leftStr
      const mod = boxes.find((box) => box.id === id)?.mod || ((a, b) => a - b)
      const scale = mod(value, Number(prev[id].rightStr))
      console.log(
        `Setting scale to ${scale} by ${value} and ${prev[id].rightStr} using ${mod}`
      )

      if (typeof oldValue !== 'string') {
        console.log({ prev, id: oldValue.id, scale })
        return master.dec(prev, oldValue.id, scale)
      } else {
        const newValue = (Number(oldValue) - scale).toString()
        console.log(
          `Trying to set ${id}:leftStr to ${newValue} by subtracting ${scale} from ${oldValue}`
        )
        return {
          ...prev,
          [id]: {
            ...prev[id],
            leftStr: newValue,
          },
        }
      }
    },
    play(box: CalculatorBoxDef) {
      const duration = Number(state[box.id].rightStr)
      const handle = setInterval(() => {
        setState((prev) => {
          let intervalHandle = prev[box.id].intervalHandle
          const oldValue = prev[box.id].leftStr
          const change = 1 //Number(prev[box.id].rightStr)
          if (typeof oldValue !== 'string') {
            return master.dec(prev, oldValue.id, change)
          } else {
            const newValue = Number(prev[box.id].leftStr) - change
            if (newValue <= 0) {
              clearInterval(intervalHandle)
              intervalHandle = undefined
            }
            return {
              ...prev,
              [box.id]: {
                ...prev[box.id],
                leftStr: newValue.toString(),
                intervalHandle,
              },
            }
          }
        })
      }, duration * 1000)
      setState((prev) => {
        return {
          ...prev,
          [box.id]: {
            ...prev[box.id],
            intervalHandle: handle,
          },
        }
      })
    },
    stop(box: CalculatorBoxDef) {
      const intervalHandle = state[box.id].intervalHandle
      if (intervalHandle !== undefined) {
        clearInterval(intervalHandle)
        setState((prev) => {
          return {
            ...prev,
            [box.id]: {
              ...prev[box.id],
              intervalHandle: undefined,
            },
          }
        })
      }
    },
    setLeft(id: string, value: string) {
      setState((prev) => {
        return {
          ...prev,
          [id]: {
            ...prev[id],
            leftStr: value,
          },
        }
      })
    },
    setRight(id: string, value: string) {
      setState((prev) => {
        return {
          ...prev,
          [id]: {
            ...prev[id],
            rightStr: value,
          },
        }
      })
    },
    calculateValue(id: string) {
      const box = boxes.find((box) => box.id === id)
      if (!box) {
        return NaN
      }
      const { leftStr, rightStr } = state[id]
      const left =
        typeof leftStr === 'string'
          ? Number(leftStr)
          : master.calculateValue(leftStr.id)
      const right =
        typeof rightStr === 'string'
          ? Number(rightStr)
          : master.calculateValue(rightStr.id)
      return box.calculate(left, right)
    },
    calculate(id: string) {
      const box = boxes.find((box) => box.id === id)
      if (!box) {
        return ''
      }
      const value = master.calculateValue(id)
      return box.outputFormatter(value)
    },
  }
  const components = boxes.map((box) => {
    const boxState = state[box.id]
    const { leftStr, rightStr } = boxState

    const leftIsBound = typeof leftStr !== 'string'
    const rightIsBound = typeof rightStr !== 'string'

    const leftStrVal = leftIsBound
      ? master.calculateValue(leftStr.id).toString()
      : leftStr

    const rightStrVal = rightIsBound
      ? master.calculateValue(rightStr.id).toString()
      : rightStr

    return (
      <CalculatorBox
        master={master}
        def={box}
        key={box.id}
        leftStr={leftStrVal}
        rightStr={rightStrVal}
        leftIsBound={leftIsBound}
        rightIsBound={rightIsBound}
        playing={boxState.intervalHandle !== undefined}
      />
    )
  })

  return { components }
}

function App() {
  const { components } = useMasterCalculator(boxes)

  return <AppContainer>{components}</AppContainer>
}

const ContainerWrapper = styled.div`
  border: 2px solid rgb(108, 108, 108);
  background-color: rgb(230, 230, 230);
  border-radius: 10px;
  padding: 10px;
  padding-top: 20px;
  margin: 5px;
  position: relative;

  legend {
    border: 2px solid rgb(108, 108, 108);
    background-color: rgb(230, 230, 230);
    font-size: 16px;
    font-weight: bold;
    position: absolute;
    top: -10px;
    left: 10px;
    border-radius: 5px;
  }
`
export function Container({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <ContainerWrapper>
      <legend>{title}</legend>
      {children}
    </ContainerWrapper>
  )
}

export default App

interface CalculatorBoxProps {
  master: MasterInterface
  def: CalculatorBoxDef
  leftStr: string
  rightStr: string
  playing?: boolean
  leftIsBound?: boolean
  rightIsBound?: boolean
}

const BindableInput = styled.input<{ $bound?: boolean }>`
  margin: 5px;
  border: 2px solid ${(props) => (props.$bound ? 'red' : 'rgb(108, 108, 108)')};
`

export function CalculatorBox(props: CalculatorBoxProps) {
  const { master, def, leftStr, rightStr, playing } = props
  const { leftIsBound, rightIsBound } = props
  const { title, leftName, rightName, midWord, target } = def

  const result = master.calculate(def.id)
  const isBound = target && master.outputIsBound(target)

  return (
    <Container title={title}>
      <div>
        <BindableInput
          $bound={leftIsBound}
          placeholder={leftName}
          value={leftStr}
          onChange={(e) => master.setLeft(def.id, e.target.value)}
        />
        {` ${midWord} `}
        <BindableInput
          $bound={rightIsBound}
          placeholder={rightName}
          value={rightStr}
          onChange={(e) => master.setRight(def.id, e.target.value)}
        />

        {/* <button onClick={() => timesInput.setValue(times + '')}>→</button> */}
      </div>
      <Result>{result}</Result>
      <ButtonTray>
        {target === undefined ? null : (
          <>
            <button onClick={() => master.push(def, target)}>Push</button>
            <button onClick={() => master.bind(def, target)}>
              {isBound ? 'Un-bind' : `Bind`}
            </button>{' '}
          </>
        )}
        {def.canPlay === undefined ? null : playing ? (
          <>
            <button onClick={() => master.stop(def)}>⏸️</button>
            <Countdown duration={Number(rightStr)} resetValue={leftStr} />
          </>
        ) : (
          <button onClick={() => master.play(def)}>▶️</button>
        )}
      </ButtonTray>
    </Container>
  )
}
