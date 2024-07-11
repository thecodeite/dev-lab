import { useState } from 'react'
import styled from 'styled-components'

const ListCalculatorsWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
`

const CalculatorList = styled.ul`
  list-style-type: none;
  padding: 0;

  display: flex;
`

const PickButton = styled.button<{ $picked: boolean }>`
  background-color: ${(props) => (props.$picked ? 'blue' : 'white')};
  color: ${(props) => (props.$picked ? 'white' : 'black')};
`

export function ListCalculators({
  calculators,
  setCalculators,
  activeCalculator,
  setActiveCalculator,
}: {
  calculators: string[]
  setCalculators: React.Dispatch<React.SetStateAction<string[]>>
  activeCalculator: string | undefined
  setActiveCalculator: React.Dispatch<React.SetStateAction<string | undefined>>
}) {
  const [adding, setAdding] = useState(false)
  const [newCalculator, setNewCalculator] = useState('')

  const addCalculator = () => {
    setCalculators([...calculators, newCalculator])
    setActiveCalculator(newCalculator)
    setNewCalculator('')
  }

  const clickAdd = () => {
    if (!adding) {
      setAdding(true)
    } else {
      addCalculator()
      setAdding(false)
    }
  }

  return (
    <ListCalculatorsWrapper>
      <CalculatorList>
        {calculators.map((calc) => (
          <li key={calc}>
            <PickButton
              $picked={activeCalculator === calc}
              onClick={() => setActiveCalculator(calc)}
            >
              {calc}
            </PickButton>
          </li>
        ))}
      </CalculatorList>
      {adding ? (
        <input
          value={newCalculator}
          onChange={(e) => setNewCalculator(e.target.value)}
        />
      ) : null}
      <button onClick={clickAdd}>Add</button>
    </ListCalculatorsWrapper>
  )
}
