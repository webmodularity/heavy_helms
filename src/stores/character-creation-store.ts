import { create } from 'zustand'
import { viemClient } from "@/config"
import { parseAbiItem } from "viem"

// Use your actual contract address constant
const PLAYER_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`

// Define a type for the character creation event data
export interface CharacterCreationEventData {
  firstNameIndex: number;
  surnameIndex: number;
  strength: number;
  constitution: number;
  size: number;
  agility: number;
  stamina: number;
  luck: number;
}

// Revert callback type to original (no namePreference)
type CharacterCreationCallback = (
  playerId: string,
  eventData: CharacterCreationEventData | null
) => void

type CharacterCreationState = {
  isListening: boolean
  requestId: bigint | null
  playerId: string | null
  isTimeout: boolean
  listenerTimeout: number | null
  unwatchFn: (() => void) | null
  eventData: CharacterCreationEventData | null // Use original type name
  
  // Group actions in a separate object
  actions: {
    // Revert startListening signature
    startListening: (
      requestId: bigint,
      onCharacterCreated?: CharacterCreationCallback // Use original callback type
    ) => void
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
    // Revert startListening implementation signature
    startListening: (requestId, onCharacterCreated) => {
      // First clean up any existing listener
      const state = get()
      if (state.unwatchFn) state.unwatchFn()
      if (state.listenerTimeout) clearTimeout(state.listenerTimeout)
      
      // Set up the event watcher for PlayerCreationComplete
      const unwatchFn = viemClient.watchEvent({
        address: PLAYER_CONTRACT_ADDRESS,
        event: parseAbiItem('event PlayerCreationComplete(uint256 indexed requestId, uint32 indexed playerId, address indexed owner, uint256 randomness, uint16 firstNameIndex, uint16 surnameIndex, uint8 strength, uint8 constitution, uint8 size, uint8 agility, uint8 stamina, uint8 luck)'),
        args: {
          requestId: requestId,
        },
        onLogs: (logs) => {
          const state = get();
          if (state.isListening && logs[0]) {
            const log = logs[0];
            // Revert type assertion if changed
            const args = log.args as unknown as CharacterCreationEventData & { playerId: number };
            const playerId = args.playerId.toString();

            // Revert eventData type if changed
            const eventData: CharacterCreationEventData = {
              firstNameIndex: args.firstNameIndex,
              surnameIndex: args.surnameIndex,
              strength: args.strength,
              constitution: args.constitution,
              size: args.size,
              agility: args.agility,
              stamina: args.stamina,
              luck: args.luck,
            };

            set({ playerId: playerId, isListening: false, eventData: eventData });
            
            // Stop the timeout if it exists
            const currentState = get()
            if (currentState.listenerTimeout) {
              clearTimeout(currentState.listenerTimeout)
              set({ listenerTimeout: null })
            }
            
            // Call the original callback (no namePreference)
            if (onCharacterCreated) {
              onCharacterCreated(playerId, eventData);
            }
          }
        },
      })
      
      // Revert state update if needed
      set({ isListening: true, requestId: requestId, unwatchFn: unwatchFn, isTimeout: false, eventData: null });
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