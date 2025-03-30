import { create } from 'zustand'
import { viemClient } from "@/config"
import { parseAbiItem } from "viem"

// Use your actual contract address constant
const PLAYER_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`

// Define a type for the character creation event data
interface CharacterCreationEventData {
  firstNameIndex: number;
  surnameIndex: number;
  strength: number;
  constitution: number;
  size: number;
  agility: number;
  stamina: number;
  luck: number;
}

type CharacterCreationState = {
  isListening: boolean
  requestId: bigint | null
  playerId: string | null
  isTimeout: boolean
  listenerTimeout: number | null
  unwatchFn: (() => void) | null
  eventData: CharacterCreationEventData | null
  
  // Group actions in a separate object
  actions: {
    startListening: (requestId: bigint, onCharacterCreated?: (playerId: string, eventData: CharacterCreationEventData | null) => void) => void
    stopListening: () => void
    setPlayerId: (playerId: string) => void
    markAsTimedOut: () => void
    clearState: () => void
    setListenerTimeout: (id: number) => void
  }
}

// Store implementation
const useCharacterCreationStore = create<CharacterCreationState>((set, get) => ({
  isListening: false,
  requestId: null,
  playerId: null,
  isTimeout: false,
  listenerTimeout: null,
  unwatchFn: null,
  eventData: null,
  
  actions: {
    startListening: (requestId, onCharacterCreated) => {
      // First clean up any existing listener
      const state = get()
      if (state.unwatchFn) state.unwatchFn()
      if (state.listenerTimeout) clearTimeout(state.listenerTimeout)
      
      // Set up the event watcher for PlayerCreationComplete
      const unwatchFn = viemClient.watchEvent({
        address: PLAYER_CONTRACT_ADDRESS,
        event: parseAbiItem('event PlayerCreationComplete(uint256 indexed requestId, uint32 indexed playerId, address indexed owner, uint256 randomness, uint16 firstNameIndex, uint16 surnameIndex, uint8 strength, uint8 constitution, uint8 size, uint8 agility, uint8 stamina, uint8 luck)'),
        onLogs: (logs) => {
          // Check if any of the logs are for our request
          const matchingLog = logs.find(
            (log) => log.args.requestId === requestId
          )
          
          if (matchingLog?.args) {
            // We found our character creation event
            console.log("PlayerCreationComplete event found:", matchingLog)
            
            const { 
              playerId: playerIdRaw, 
              firstNameIndex, 
              surnameIndex,
              strength,
              constitution,
              size,
              agility,
              stamina,
              luck
            } = matchingLog.args;
            
            // Convert playerId to string
            const playerIdFromEvent = playerIdRaw.toString();
            
            // Create event data object
            const eventData: CharacterCreationEventData = {
              firstNameIndex: Number(firstNameIndex),
              surnameIndex: Number(surnameIndex),
              strength: Number(strength),
              constitution: Number(constitution),
              size: Number(size),
              agility: Number(agility),
              stamina: Number(stamina),
              luck: Number(luck)
            };
            
            // Update the store
            set({ 
              playerId: playerIdFromEvent,
              isListening: false,
              eventData
            })
            
            // Stop the timeout if it exists
            const currentState = get()
            if (currentState.listenerTimeout) {
              clearTimeout(currentState.listenerTimeout)
              set({ listenerTimeout: null })
            }
            
            // Call the callback if provided
            if (onCharacterCreated) onCharacterCreated(playerIdFromEvent, eventData)
          }
        },
      })
      
      // Update state
      set({ 
        isListening: true,
        requestId,
        isTimeout: false,
        unwatchFn,
        eventData: null
      })
    },
    
    stopListening: () => {
      const state = get()
      
      // Clean up the event listener
      if (state.unwatchFn) {
        state.unwatchFn()
      }
      
      // Clean up the timeout
      if (state.listenerTimeout) {
        clearTimeout(state.listenerTimeout)
      }
      
      set({ 
        isListening: false, 
        unwatchFn: null,
        listenerTimeout: null 
      })
    },
    
    setPlayerId: (playerId) => set({ playerId }),
    
    markAsTimedOut: () => set({ isTimeout: true }),
    
    clearState: () => {
      const state = get()
      
      // Clean up the event listener
      if (state.unwatchFn) {
        state.unwatchFn()
      }
      
      // Clean up the timeout
      if (state.listenerTimeout) {
        clearTimeout(state.listenerTimeout)
      }
      
      return {
        isListening: false,
        requestId: null,
        playerId: null,
        isTimeout: false,
        listenerTimeout: null,
        unwatchFn: null,
        eventData: null
      }
    },
    
    setListenerTimeout: (id: number) => set({
      listenerTimeout: id
    })
  }
}))

// Export selectors as custom hooks
export const useIsCharacterCreationListening = () => useCharacterCreationStore(state => state.isListening)
export const useIsCharacterCreationTimeout = () => useCharacterCreationStore(state => state.isTimeout)
export const useCharacterCreationRequestId = () => useCharacterCreationStore(state => state.requestId)
export const useCreatedPlayerId = () => useCharacterCreationStore(state => state.playerId)
export const useCreatedPlayerEventData = () => useCharacterCreationStore(state => state.eventData)

// Export actions as a single hook
export const useCharacterCreationActions = () => useCharacterCreationStore(state => state.actions)

// Add a combined hook for the loading page
export const useCharacterCreationState = () => ({
  isListening: useCharacterCreationStore(state => state.isListening),
  isTimeout: useCharacterCreationStore(state => state.isTimeout),
  playerId: useCharacterCreationStore(state => state.playerId),
  eventData: useCharacterCreationStore(state => state.eventData)
}) 