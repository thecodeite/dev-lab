import { useEffect, useReducer, useRef, useState } from 'react'
import styled from 'styled-components'
import { xp } from './xp'
import { Countdown } from './Countdown'
import { AblyTest } from './AblyTest'
import {
  calculateValue,
  createMasterCalculatorDispatchers,
  createMasterCalculatorReducer,
  createMasterCalculatorState,
  formatValue,
  MasterCalculatorAction,
  MasterCalculatorState,
  outputIsBound,
  Target,
} from './dataMaster'
import * as Ably from 'ably'
import {
  AblyProvider,
  ChannelProvider,
  useChannel,
  useConnectionStateListener,
} from 'ably/react'

function getClientId() {
  const cachedId = localStorage.getItem('dev-lab-clientId')
  if (typeof cachedId === 'string' && cachedId.length > 0) {
    return cachedId
  }
  const newId = Math.floor(10 ** 36 * Math.random())
    .toString(36)
    .padStart(10, '0')
  localStorage.setItem('dev-lab-clientId', newId)
  return newId
}
const clientId = getClientId()

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
    mod(left) {
      return left
    },
  },
]

const masterCalculatorReducer = createMasterCalculatorReducer(boxes)

const client = new Ably.Realtime({
  key: 'gkzCVA.wmKFdw:FVC0SnUJ5iJ2IQj0o5UZEAc7x0tD_vtVtJvDJCDfdoo',
})

function useRemoteDataSync() {
  const initialState = createMasterCalculatorState(boxes)
  const [state, dispatcher] = useReducer(masterCalculatorReducer, initialState)
  const dispatchers = createMasterCalculatorDispatchers(dispatcher)
  const lastDispatch = useRef('')

  // const { channel } = useChannel('dev-lab', 'dispatch', (message) => {
  //   setLastMessage(message)
  // })
  useEffect(() => {
    client.channels.get('dev-lab').subscribe('dispatch', (message) => {
      console.log('message:', message.id, message.data.state)
      lastDispatch.current = 'remoteDataSync'
      dispatcher({
        n: 'remoteDataSync',
        data: message.data.state,
      })
    })
  }, [])

  useEffect(() => {
    // console.log('dispatch', lastDispatch.current)
    if (lastDispatch.current !== 'remoteDataSync') {
      client.channels.get('dev-lab').publish('dispatch', {
        clientId,
        action: lastDispatch.current,
        state,
      })
    }
  }, [state])

  const handler: ProxyHandler<
    ReturnType<typeof createMasterCalculatorDispatchers>
  > = {
    get(target, prop, receiver) {
      // console.log('get', prop)
      lastDispatch.current = prop.toString()
      return Reflect.get(target, prop, receiver)
    },
  }

  const dispatchersProxy = new Proxy(dispatchers, handler)

  return [state, dispatchersProxy] as const
}

function App() {
  // const { components, state } = useMasterCalculator(boxes)

  const [state, dispatchers] = useRemoteDataSync()

  return (
    <>
      <AppContainer>
        {boxes.map((box) => {
          return (
            <CalculatorBox
              dispatchers={dispatchers}
              box={box}
              state={state}
              key={box.id}
            />
          )
        })}
      </AppContainer>
      <AblyTest />
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </>
  )
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
  dispatchers: ReturnType<typeof createMasterCalculatorDispatchers>
  box: CalculatorBoxDef
  state: MasterCalculatorState
}

const BindableInput = styled.input<{ $bound?: boolean }>`
  margin: 5px;
  border: 2px solid ${(props) => (props.$bound ? 'red' : 'rgb(108, 108, 108)')};
`

export function CalculatorBox(props: CalculatorBoxProps) {
  const { dispatchers, box, state } = props
  const { title, leftName, rightName, midWord, target } = box

  const boxState = state.boxes[box.id]
  const { leftStr, rightStr } = boxState

  const leftIsBound = typeof leftStr !== 'string'
  const rightIsBound = typeof rightStr !== 'string'

  const leftStrVal = leftIsBound
    ? calculateValue(leftStr.id, boxes, state).toString()
    : leftStr

  const rightStrVal = rightIsBound
    ? calculateValue(rightStr.id, boxes, state).toString()
    : rightStr

  const result = formatValue(box.id, boxes, state)
  const isBound = outputIsBound(target, state)
  const playing = boxState.intervalHandle !== undefined

  const play = () => {
    const duration = Number(rightStr)
    const handle = window.setInterval(() => {
      dispatchers.dec(box.id, 1)
    }, duration * 1000)
    dispatchers.playing(box.id, handle)
  }

  const stop = () => {
    const handle = boxState.intervalHandle
    if (handle !== undefined) {
      clearInterval(handle)
      // dispatchers.set(box.id, 'intervalHandle', undefined)
      dispatchers.stopped(box.id)
    }
  }

  return (
    <Container title={title}>
      <div>
        <BindableInput
          $bound={leftIsBound}
          placeholder={leftName}
          value={leftStrVal}
          onChange={(e) => dispatchers.set(box.id, 'leftStr', e.target.value)}
        />
        {` ${midWord} `}
        <BindableInput
          $bound={rightIsBound}
          placeholder={rightName}
          value={rightStrVal}
          onChange={(e) => dispatchers.set(box.id, 'rightStr', e.target.value)}
        />
      </div>
      <Result>{result}</Result>
      <ButtonTray>
        {target === undefined ? null : (
          <>
            <button onClick={() => dispatchers.push(box, target)}>Push</button>
            <button onClick={() => dispatchers.bind(box, target)}>
              {isBound ? 'Un-bind' : `Bind`}
            </button>{' '}
          </>
        )}
        {box.canPlay === undefined ? null : playing ? (
          <>
            <button onClick={() => stop()}>⏸️</button>
            <Countdown duration={Number(rightStr)} resetValue={leftStrVal} />
          </>
        ) : (
          <button onClick={() => play()}>▶️</button>
        )}
      </ButtonTray>
    </Container>
  )
}
