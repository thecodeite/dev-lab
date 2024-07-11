import { useReducer, useRef, useEffect } from 'react'
import { boxes } from './panels/boxes'
import {
  MasterCalculatorState,
  createMasterCalculatorState,
  createMasterCalculatorDispatchers,
  createMasterCalculatorReducer,
} from './dataMaster'
import { getClientId } from './getClientId'
import Ably from 'ably'

const clientId = getClientId()

const client = new Ably.Realtime({
  key: 'gkzCVA.wmKFdw:FVC0SnUJ5iJ2IQj0o5UZEAc7x0tD_vtVtJvDJCDfdoo',
})

const masterCalculatorReducer = createMasterCalculatorReducer(boxes)

export function useRemoteDataSync(
  stateId: string,
  initialLoaderState?: MasterCalculatorState
) {
  const initialState =
    initialLoaderState || createMasterCalculatorState(stateId, boxes)
  // console.log(
  //   'initialState, initialLoaderState:',
  //   initialState,
  //   initialLoaderState
  // )
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
    const { current } = lastDispatch
    console.log('dispatch', lastDispatch.current)
    if (current !== '' && current !== 'remoteDataSync') {
      if (current !== 'dec') {
        fetch(`/api/calc?id=${stateId}`, {
          method: 'PUT',
          body: JSON.stringify(state),
        }).then((res) => {
          console.log('post success', current, res.ok)
        })
      }
      console.log('publishing', current)
      client.channels.get('dev-lab').publish('dispatch', {
        clientId,
        action: current,
        state,
      })
    }
  }, [state, stateId])

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
