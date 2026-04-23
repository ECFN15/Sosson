import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect'
import type { DataConnect } from 'firebase/data-connect'
import { connectorConfig, dataConnectSettings } from '@dataconnect/generated'
import { firebaseApp, ENV } from '@/lib/firebase'

let dataConnect: DataConnect | null = null
let emulatorConnected = false

export const shouldUseDataConnectEmulator =
  import.meta.env.VITE_DATACONNECT_USE_EMULATOR === 'true' ||
  (import.meta.env.DEV && ENV === 'sandbox')

export const isDataConnectEnabled =
  import.meta.env.VITE_DATACONNECT_ENABLED !== 'false'

export function getSossonDataConnect() {
  if (!dataConnect) {
    dataConnect = getDataConnect(firebaseApp, connectorConfig, dataConnectSettings)
  }

  if (shouldUseDataConnectEmulator && !emulatorConnected) {
    const host = import.meta.env.VITE_DATACONNECT_EMULATOR_HOST ?? '127.0.0.1'
    const port = Number(import.meta.env.VITE_DATACONNECT_EMULATOR_PORT ?? 9399)
    try {
      connectDataConnectEmulator(dataConnect, host, port)
    } catch (error) {
      if (!String(error).includes('already been called')) throw error
    }
    emulatorConnected = true
  }

  return dataConnect
}
