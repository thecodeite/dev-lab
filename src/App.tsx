import { useState } from 'react'
import styled from 'styled-components'
import { xp } from './xp'

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
  font-size: 24px;
`

const useInput = (initialValue: string) => {
  const [value, setValue] = useState(initialValue)
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }
  return { i: { value, onChange }, value, setValue }
}

function App() {
  const durationInput = useInput('')
  const timesInput = useInput('')

  const targetValue = useInput('')
  const perInput = useInput('')

  const currentXPInput = useInput('')
  const targetLevelInput = useInput('')

  let totalTime = ''
  if (!Number.isNaN(durationInput.value) && !Number.isNaN(timesInput.value)) {
    const totalSeconds = Number(durationInput.value) * Number(timesInput.value)
    if (totalSeconds < 60) {
      totalTime = `${totalSeconds} seconds`
    } else if (totalSeconds < 3600) {
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      totalTime = `${minutes} minutes ${seconds} seconds`
    } else if (totalSeconds < 86400) {
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = Math.floor(totalSeconds % 60)
      totalTime = `${hours} hours ${minutes} minutes ${seconds} seconds`
    } else {
      const days = Math.floor(totalSeconds / 86400)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = Math.floor(totalSeconds % 60)
      totalTime = `${days}d ${hours}h ${minutes}m ${seconds}s`
    }
  } else {
    totalTime = ''
  }

  let times = 0
  const target = Number(targetValue.value)
  const per = Number(perInput.value)
  if (!Number.isNaN(target) && !Number.isNaN(per) && per > 0) {
    times = Math.ceil(target / per)
  }

  let xpNeeded = 0
  const targetLevel = Number(targetLevelInput.value)
  const currentXP = Number(currentXPInput.value)
  if (
    !Number.isNaN(targetLevel) &&
    !Number.isNaN(currentXP) &&
    targetLevel > 0 &&
    targetLevel <= 100
  ) {
    xpNeeded = xp[targetLevel] - currentXP
  }

  // 8929400
  const ukFormat = new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 0,
  })

  return (
    <AppContainer>
      <Container title="XP Calculator">
        <div>
          <input placeholder="current Xp" {...currentXPInput.i} />
          to
          <input placeholder="target level" {...targetLevelInput.i} />
          <button onClick={() => targetValue.setValue(xpNeeded + '')}>→</button>
        </div>
        <Result>XP Needed: {ukFormat.format(xpNeeded)}</Result>
      </Container>

      <Container title="Repetitions">
        <div>
          <input placeholder="target value" {...targetValue.i} />
          to
          <input placeholder="perInput" {...perInput.i} />
          <button onClick={() => timesInput.setValue(times + '')}>→</button>
        </div>
        <Result>Times: {ukFormat.format(times)}</Result>
      </Container>

      <Container title="Time Calculator">
        <div>
          <input placeholder="duration" {...durationInput.i} />
          *
          <input placeholder="times" {...timesInput.i} />
        </div>
        <Result>{totalTime}</Result>
      </Container>
    </AppContainer>
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
