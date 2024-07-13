import styled from 'styled-components'
import { boxes } from './panels/boxes'
import { Countdown } from './Countdown'
import {
  calculateValue,
  CalculatorBoxDef,
  createMasterCalculatorDispatchers,
  formatValue,
  MasterCalculatorState,
  outputIsBound,
} from './dataMaster'
import { mathExp } from './math-exp'

export interface CalculatorBoxProps {
  dispatchers: ReturnType<typeof createMasterCalculatorDispatchers>
  box: CalculatorBoxDef
  state: MasterCalculatorState
}

const Result = styled.pre`
  display: block;
  margin-top: 20px;
  font-size: 20px;
`

const ButtonTray = styled.div`
  display: flex;
`

const BindableInput = styled.input<{ $bound?: boolean }>`
  margin: 5px;
  border: 2px solid ${(props) => (props.$bound ? 'red' : 'rgb(108, 108, 108)')};
`

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

function Container({
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
    if (typeof rightStr !== 'string')
      throw new Error('rightStr is not a string')
    const duration = mathExp(rightStr)
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
