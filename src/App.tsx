import { useState } from 'react'
import { MasterCalculatorState } from './dataMaster'
import { ListCalculators } from './ListCalculators'
import {
  createBrowserRouter,
  createRoutesFromElements,
  LoaderFunction,
  Navigate,
  Route,
  RouterProvider,
  useLoaderData,
  useParams,
} from 'react-router-dom'
import { useRemoteDataSync } from './useRemoteDataSync'
import { boxes } from './panels/boxes'
import { CalculatorBox } from './CalculatorBox'
import styled from 'styled-components'

const makeId = () =>
  Math.floor(36 ** 10 * Math.random())
    .toString(36)
    .padStart(10, '0')

const pageLoader: LoaderFunction = async (args) => {
  const id = args.params.id

  if (!id) {
    return null
  }

  const r = await fetch(`/api/calc?id=${id}`)

  if (r.ok) {
    const initialState = await r.json()
    return initialState
  }

  return null
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Navigate to={`/${makeId()}`} />} />
      <Route path="/:id" element={<Page />} loader={pageLoader} />
    </Route>
  )
)

export function App() {
  return <RouterProvider router={router} />
}

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
`

function Page() {
  const stateId = useParams().id as string
  const instalState = useLoaderData() as MasterCalculatorState | undefined
  // const { components, state } = useMasterCalculator(boxes)
  const [calculators, setCalculators] = useState<string[]>([])
  const [activeCalculator, setActiveCalculator] = useState<string | undefined>(
    undefined
  )
  const [state, dispatchers] = useRemoteDataSync(stateId, instalState)

  return (
    <>
      <ListCalculators
        calculators={calculators}
        setCalculators={setCalculators}
        activeCalculator={activeCalculator}
        setActiveCalculator={setActiveCalculator}
      />
      <PageContainer>
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
      </PageContainer>
    </>
  )
}
