export interface Target {
  id: string
  side: 'leftStr' | 'rightStr'
}

interface BoundTo {
  id: string
}

export interface MasterCalculatorState {
  clientRunningClock: string | null
  boxes: {
    [key: string]: {
      leftStr: string | BoundTo
      rightStr: string | BoundTo
      intervalHandle?: number
    }
  }
}

export interface CalculatorBoxDef {
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

export type MasterCalculatorAction =
  | {
      n: 'push'
      box: CalculatorBoxDef
      target: Target
    }
  | {
      n: 'bind'
      box: CalculatorBoxDef
      target: Target
    }
  | {
      n: 'dec'
      id: string
      value: number
    }
  | {
      n: 'playing'
      boxId: string
      handle: number
    }
  | {
      n: 'stopped'
      boxId: string
    }
  | {
      n: 'set'
      id: string
      side: 'leftStr' | 'rightStr'
      value: string
    }
  | {
      n: 'remoteDataSync'
      data: MasterCalculatorState
    }

export function createMasterCalculatorState(boxDefs: CalculatorBoxDef[]) {
  const boxes = boxDefs
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
    }, {} as Record<string, { leftStr: string; rightStr: string }>)

  const initialState: MasterCalculatorState = {
    clientRunningClock: null,
    boxes,
  }
  return initialState
}

type Reducer = (
  state: MasterCalculatorState,
  action: MasterCalculatorAction
) => MasterCalculatorState

export function createMasterCalculatorReducer(boxes: CalculatorBoxDef[]) {
  const reducer: Reducer = (
    state: MasterCalculatorState,
    action: MasterCalculatorAction
  ) => {
    switch (action.n) {
      case 'push':
        return push(state, action)
      case 'bind':
        return bind(state, action)
      case 'dec':
        return dec(state, action)
      case 'playing':
        return playing(state, action)
      case 'stopped':
        return stopped(state, action)
      case 'set':
        return set(state, action)
      case 'remoteDataSync':
        return action.data
    }
    return state
  }

  const push = (
    state: MasterCalculatorState,
    action: Extract<MasterCalculatorAction, { n: 'push' }>
  ) => {
    const { box, target } = action
    const value = calculateValue(box.id, boxes, state)
    console.log('push', box.id, target.id, value)

    return {
      ...state,
      boxes: {
        ...state.boxes,
        [target.id]: {
          ...state.boxes[target.id],
          [target.side]: value.toString(),
        },
      },
    }
  }

  const bind = (
    state: MasterCalculatorState,
    action: Extract<MasterCalculatorAction, { n: 'bind' }>
  ) => {
    const { box, target } = action
    const targetState = state.boxes[target.id][target.side]
    if (targetState === undefined || typeof targetState === 'string') {
      console.log('bind', box.id, target.id)

      return {
        ...state,
        boxes: {
          ...state.boxes,
          [target.id]: {
            ...state.boxes[target.id],
            [target.side]: {
              id: box.id,
            },
          },
        },
      }
    } else {
      console.log('un-bind', box.id, target.id)
      return {
        ...state,
        boxes: {
          ...state.boxes,
          [target.id]: {
            ...state.boxes[target.id],
            [target.side]: calculateValue(box.id, boxes, state).toString(),
          },
        },
      }
    }

    return state
  }

  const dec = (
    state: MasterCalculatorState,
    action: Extract<MasterCalculatorAction, { n: 'dec' }>
  ) => {
    const { id, value } = action
    const oldValue = state.boxes[id].leftStr
    const mod = boxes.find((box) => box.id === id)?.mod || ((a, b) => a - b)
    const scale = mod(value, Number(state.boxes[id].rightStr))
    console.log(
      `Setting scale to ${scale} by ${value} and ${state.boxes[id].rightStr} using ${mod}`
    )

    if (typeof oldValue !== 'string') {
      console.log({ state, id: oldValue.id, scale })
      return dec(state, { n: 'dec', id: oldValue.id, value: scale })
    } else {
      const newValue = (Number(oldValue) - scale).toString()
      console.log(
        `Trying to set ${id}:leftStr to ${newValue} by subtracting ${scale} from ${oldValue}`
      )
      return {
        ...state,
        boxes: {
          ...state.boxes,
          [id]: {
            ...state.boxes[id],
            leftStr: newValue,
          },
        },
      }
    }
  }
  const playing = (
    state: MasterCalculatorState,
    action: Extract<MasterCalculatorAction, { n: 'playing' }>
  ) => {
    const { boxId, handle } = action
    return {
      ...state,
      boxes: {
        ...state.boxes,
        [boxId]: {
          ...state.boxes[boxId],
          intervalHandle: handle,
        },
      },
    }
  }

  const stopped = (
    state: MasterCalculatorState,
    action: Extract<MasterCalculatorAction, { n: 'stopped' }>
  ) => {
    const { boxId } = action
    return {
      ...state,
      boxes: {
        ...state.boxes,
        [boxId]: {
          ...state.boxes[boxId],
          intervalHandle: undefined,
        },
      },
    }
  }

  // const play = (
  //   state: MasterCalculatorState,
  //   action: Extract<MasterCalculatorAction, { n: 'play' }>
  // ) => {
  //   const { box, dispatch } = action

  //   const duration = Number(state.boxes[box.id].rightStr)
  //   const handle = window.setInterval(() => {
  //     // dispatch({ n: 'dec', id: box.id, value: 1 })
  //     // const oldValue = state.boxes[box.id].leftStr
  //     // const change = 1 //Number(prev[box.id].rightStr)
  //     // if (typeof oldValue !== 'string') {
  //     //   return dec(state, { n: 'dec', id: oldValue.id, value: change })
  //     // } else {
  //     //   const newValue = Number(state.boxes[box.id].leftStr) - change
  //     //   dispatch({
  //     //     n: 'set',
  //     //     id: box.id,
  //     //     side: 'leftStr',
  //     //     value: newValue.toString(),
  //     //   })
  //     //   if (newValue <= 0) {
  //     //     dispatch({ n: 'stop', box })
  //     //   }
  //     // }
  //   }, duration * 1000)

  //   return {
  //     ...state, boxes: {
  //     [box.id]: {
  //       ...state.boxes[box.id],
  //       intervalHandle: handle,
  //     },
  //   }}
  // }

  // const stop = (
  //   state: MasterCalculatorState,
  //   action: Extract<MasterCalculatorAction, { n: 'stop' }>
  // ) => {
  //   const { box } = action
  //   const intervalHandle = state.boxes[box.id].intervalHandle
  //   if (intervalHandle !== undefined) {
  //     clearInterval(intervalHandle)

  //     return {
  //       ...state,  boxes: {
  //       [box.id]: {
  //         ...state.boxes[box.id],
  //         intervalHandle: undefined,
  //       },
  //     }}
  //   }
  //   return state
  // }

  const set = (
    state: MasterCalculatorState,
    action: Extract<MasterCalculatorAction, { n: 'set' }>
  ) => {
    const { id, side, value } = action
    return {
      ...state,
      boxes: {
        ...state.boxes,
        [id]: {
          ...state.boxes[id],
          [side]: value,
        },
      },
    }
  }

  return reducer
}

export function createMasterCalculatorDispatchers(
  dispatch: React.Dispatch<MasterCalculatorAction>
) {
  return {
    push: (box: CalculatorBoxDef, target: Target) => {
      dispatch({ n: 'push', box, target })
    },
    bind: (box: CalculatorBoxDef, target: Target) => {
      dispatch({ n: 'bind', box, target })
    },
    dec: (id: string, value: number) => {
      dispatch({ n: 'dec', id, value })
    },
    playing: (boxId: string, handle: number) => {
      dispatch({ n: 'playing', boxId, handle })
    },
    stopped: (boxId: string) => {
      dispatch({ n: 'stopped', boxId })
    },
    set: (id: string, side: 'leftStr' | 'rightStr', value: string) => {
      dispatch({ n: 'set', id, side, value })
    },
  }
}

export function calculateValue(
  id: string,
  boxes: CalculatorBoxDef[],
  state: MasterCalculatorState
): number {
  const box = boxes.find((box) => box.id === id)
  if (!box) {
    return NaN
  }
  const { leftStr, rightStr } = state.boxes[id]
  const left =
    typeof leftStr === 'string'
      ? Number(leftStr)
      : calculateValue(leftStr.id, boxes, state)
  const right =
    typeof rightStr === 'string'
      ? Number(rightStr)
      : calculateValue(rightStr.id, boxes, state)
  return box.calculate(left, right)
}

export function formatValue(
  id: string,
  boxes: CalculatorBoxDef[],
  state: MasterCalculatorState
): string {
  const box = boxes.find((box) => box.id === id)
  if (!box) {
    return ''
  }
  const value = calculateValue(id, boxes, state)
  return box.outputFormatter(value)
}

export function outputIsBound(
  target: Target | undefined,
  state: MasterCalculatorState
): boolean {
  if (!target) return false
  const { id, side } = target
  const value = state.boxes[id][side]
  return value !== '' && typeof value !== 'string'
}
