import { useState } from 'react'
import * as Ably from 'ably'
import {
  AblyProvider,
  ChannelProvider,
  useChannel,
  useConnectionStateListener,
} from 'ably/react'

// Connect to Ably using the AblyProvider component and your API key
const client = new Ably.Realtime({
  key: 'gkzCVA.wmKFdw:FVC0SnUJ5iJ2IQj0o5UZEAc7x0tD_vtVtJvDJCDfdoo',
})

export function AblyTest() {
  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName="dev-lab">
        <AblyPubSub />
      </ChannelProvider>
    </AblyProvider>
  )
}

function AblyPubSub() {
  const [lastMessage, setLastMessage] = useState<Ably.Message | undefined>()

  useConnectionStateListener('connected', () => {
    console.log('Connected to Ably!')
  })

  // Create a channel called 'get-started' and subscribe to all messages with the name 'first' using the useChannel hook
  const { channel } = useChannel('dev-lab', 'dispatch', (message) => {
    setLastMessage(message)
  })

  return (
    // Publish a message with the name 'first' and the contents 'Here is my first message!' when the 'Publish' button is clicked
    <div>
      <pre>{JSON.stringify(lastMessage, null, 2)}</pre>
    </div>
  )
}
