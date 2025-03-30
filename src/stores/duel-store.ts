import { create } from 'zustand'
import { viemClient } from "@/config";
import { parseAbiItem } from "viem";

// Use your actual contract address constant
const DUEL_GAME_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as `0x${string}`;

type DuelState = {
  isListening: boolean
  duelTxHash: string | null
  challengeId: bigint | null
  isTimeout: boolean
  listenerTimeout: number | null
  unwatchFn: (() => void) | null
  
  // Group actions in a separate object
  actions: {
    startListening: (challengeId: bigint, onDuelComplete?: (txHash: string) => void) => void
    stopListening: () => void
    setDuelTxHash: (txHash: string) => void
    markAsTimedOut: () => void // Renamed to avoid confusion with native setTimeout
    clearState: () => void
    setListenerTimeout: (id: number) => void
  }
}

// Store is NOT exported directly
const useDuelStore = create<DuelState>((set, get) => ({
  isListening: false,
  duelTxHash: null,
  challengeId: null,
  isTimeout: false,
  listenerTimeout: null,
  unwatchFn: null,
  
  actions: {
    startListening: (challengeId, onDuelComplete) => {
      // First clean up any existing listener
      const state = get()
      if (state.unwatchFn) state.unwatchFn()
      if (state.listenerTimeout) clearTimeout(state.listenerTimeout)
      
      // Set up the event watcher
      const unwatchFn = viemClient.watchEvent({
        address: DUEL_GAME_CONTRACT_ADDRESS,
        event: parseAbiItem('event DuelComplete(uint256 indexed challengeId, uint32 indexed winnerId, uint256 randomness, uint256 winnerPayout)'),
        onLogs: (logs) => {
          // Check if any of the logs are for our challenge
          const matchingLog = logs.find(
            (log) => log.args.challengeId === challengeId
          )
          
          if (matchingLog) {
            // We found our duel completion event
            console.log("DuelComplete event found:", matchingLog)
            
            // Get the transaction hash
            const txHash = matchingLog.transactionHash
            
            // Update the store
            set({ 
              duelTxHash: txHash,
              isListening: false
            })
            
            // Stop the timeout if it exists
            const currentState = get()
            if (currentState.listenerTimeout) {
              clearTimeout(currentState.listenerTimeout)
              set({ listenerTimeout: null })
            }
            
            // Call the callback if provided
            if (onDuelComplete) onDuelComplete(txHash)
          }
        },
      })
      
      // Update state
      set({ 
        isListening: true,
        challengeId,
        isTimeout: false,
        unwatchFn
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
    
    setDuelTxHash: (txHash) => set({ duelTxHash: txHash }),
    
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
        duelTxHash: null,
        challengeId: null,
        isTimeout: false,
        listenerTimeout: null,
        unwatchFn: null
      }
    },
    
    setListenerTimeout: (id: number) => set({
      listenerTimeout: id
    })
  }
}))

// Export atomic selectors as custom hooks
export const useIsDuelListening = () => useDuelStore(state => state.isListening)
export const useIsDuelTimeout = () => useDuelStore(state => state.isTimeout)
export const useDuelChallengeId = () => useDuelStore(state => state.challengeId)
export const useDuelTxHash = () => useDuelStore(state => state.duelTxHash)

// Export actions as a single hook
export const useDuelActions = () => useDuelStore(state => state.actions)

// Add a combined hook for the loading page
export const useDuelLoadingState = () => ({
  isListening: useDuelStore(state => state.isListening),
  isTimeout: useDuelStore(state => state.isTimeout),
  duelTxHash: useDuelStore(state => state.duelTxHash)
}) 