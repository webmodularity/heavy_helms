# 🛡️ Combat Results Schema Migration Guide

## Summary of Changes

The `CombatResult` entity schema has been significantly enhanced with detailed combat statistics. **The good news is that existing queries will continue to work** because all the basic fields are still present. The new fields are **additive**, providing much more detailed combat data.

## ✅ What Still Works

Your existing GraphQL queries using these fields will continue to work unchanged:

```graphql
# These fields are still available and unchanged
id
transactionHash
logIndex
player1Data
player2Data
winningPlayerId
blockNumber
blockTimestamp
packedResults
```

## 🆕 New Fields Available

### Basic Combat Info
```graphql
player1Won: Boolean!           # True if player1 won
gameEngineVersion: Int!        # Game engine version used
winCondition: String!          # "HEALTH" | "EXHAUSTION" | "MAX_ROUNDS" | "DEATH"
roundCount: Int!               # Number of combat rounds
```

### Player 1 Combat Statistics
```graphql
player1TotalDamage: Int!       # Total damage dealt
player1TotalStaminaLost: Int!  # Total stamina consumed
player1Attacks: Int!           # Attack attempts
player1Hits: Int!              # Successful hits
player1Misses: Int!            # Missed attacks
player1Crits: Int!             # Critical hits (includes riposte/counter crits)
player1Blocks: Int!            # Successful blocks
player1Counters: Int!          # Counter attacks
player1Dodges: Int!            # Successful dodges
player1Parries: Int!           # Successful parries
player1Ripostes: Int!          # Riposte attacks
player1DefensiveActions: Int!  # Total defensive actions (blocks + dodges + parries)
player1MaxDamage: Int!         # Highest single damage dealt
```

### Player 2 Combat Statistics
```graphql
# Same fields as Player 1, prefixed with player2
player2TotalDamage: Int!
player2TotalStaminaLost: Int!
# ... (all the same fields as player1)
```

## 🔧 Updated Frontend Code

### 1. Enhanced TypeScript Interfaces

The `RawCombatResult` interface has been updated to include all new fields as optional properties for backward compatibility:

```typescript
interface RawCombatResult {
  // Existing fields (unchanged)
  id: string;
  transactionHash: string;
  player1Data: string;
  player2Data: string;
  winningPlayerId: string;
  packedResults: string;
  blockTimestamp: string;
  blockNumber: string;
  logIndex?: number;
  
  // New detailed combat statistics (optional)
  player1Won?: boolean;
  gameEngineVersion?: number;
  winCondition?: 'HEALTH' | 'EXHAUSTION' | 'MAX_ROUNDS' | 'DEATH';
  roundCount?: number;
  
  // Player combat statistics...
  player1TotalDamage?: number;
  player1Attacks?: number;
  // ... (see full interface in src/types/game.types.ts)
}
```

### 2. New GraphQL Queries

#### Enhanced Detailed Query
```typescript
import { GET_COMBAT_RESULTS_DETAILED } from "@/lib/gql-queries";

// Use this to get all the new detailed statistics
const response = await request(SUBGRAPH_URL, GET_COMBAT_RESULTS_DETAILED, {
  txHash: "0x..."
});
```

#### Backward Compatible Query
```typescript
import { GET_COMBAT_RESULTS } from "@/lib/gql-queries";

// This still works exactly as before, but now also includes some basic new fields
const response = await request(SUBGRAPH_URL, GET_COMBAT_RESULTS, {
  txHash: "0x..."
});
```

### 3. New Combat Statistics Utilities

A new utility file `src/lib/combat-stats-utils.ts` provides:

```typescript
import { 
  extractCombatMetrics, 
  hasDetailedStats, 
  formatAccuracy, 
  formatDamage 
} from "@/lib/combat-stats-utils";

// Check if combat result has detailed stats
if (hasDetailedStats(combatResult)) {
  const metrics = extractCombatMetrics(combatResult);
  
  // Display enhanced combat statistics
  console.log(`Player 1 Accuracy: ${formatAccuracy(metrics.player1.accuracy)}`);
  console.log(`Player 1 Crit Rate: ${formatAccuracy(metrics.player1.critRate)}`);
  console.log(`Total Damage: ${formatDamage(metrics.summary.totalDamage)}`);
}
```

### 4. Enhanced CombatService

New method for fetching detailed combat statistics:

```typescript
import { CombatService } from "@/game/services/CombatService";

// Fetch with detailed statistics (falls back to basic if not available)
const detailedResult = await CombatService.fetchDetailedCombatResultByTx(
  txHash, 
  logIndex, 
  gameContractAddress
);
```

## 🎯 Migration Strategy

### Phase 1: Immediate (No Breaking Changes)
- ✅ All existing code continues to work
- ✅ New fields are optional and backward compatible
- ✅ Enhanced queries are available for new features

### Phase 2: Enhanced Features (Optional)
You can now build enhanced UI features like:

1. **Combat Performance Cards**
   ```typescript
   const metrics = extractCombatMetrics(combatResult);
   // Display accuracy, crit rate, defense rate, etc.
   ```

2. **Detailed Battle Statistics**
   ```typescript
   // Show round count, win condition, total damage
   const summary = metrics.summary;
   ```

3. **Player Combat Analysis**
   ```typescript
   // Compare player performance metrics
   const p1Rating = getPerformanceRating(metrics.player1);
   const p2Rating = getPerformanceRating(metrics.player2);
   ```

## 🚨 Troubleshooting

### Issue: Gauntlets Not Loading
**Cause**: If you're seeing missing gauntlets, it's likely due to GraphQL query errors.

**Solution**: Check your browser's network tab for GraphQL errors. The enhanced queries might be failing on older combat results that don't have the new fields.

**Quick Fix**: Use the basic `GET_COMBAT_RESULTS` query instead of `GET_COMBAT_RESULTS_DETAILED` for older combat results.

### Issue: New Fields Showing as `undefined`
**Cause**: Older combat results in the subgraph don't have the new detailed statistics.

**Solution**: Always check if the new fields exist before using them:

```typescript
if (combatResult.player1TotalDamage !== undefined) {
  // Use new detailed statistics
} else {
  // Fallback to basic display
}
```

## 🎉 Benefits of the New Schema

1. **Detailed Combat Analytics**: See exactly how fights played out
2. **Performance Metrics**: Calculate accuracy, crit rates, defense rates
3. **Enhanced UI Possibilities**: Build rich combat statistics displays
4. **Better Game Balance**: Analyze combat patterns and balance
5. **Backward Compatibility**: All existing code continues to work

## 📝 Example Usage

```typescript
// Fetch detailed combat result
const combatResult = await CombatService.fetchDetailedCombatResultByTx(
  txHash, 
  logIndex, 
  gameContractAddress
);

// Check if we have detailed stats
if (hasDetailedStats(combatResult)) {
  const metrics = extractCombatMetrics(combatResult);
  
  // Display enhanced combat summary
  const summary = `
    🏆 Winner: Player ${metrics.summary.winner}
    ⚔️ Win Condition: ${metrics.summary.winCondition}
    🎯 Rounds: ${metrics.summary.rounds}
    💥 Total Damage: ${formatDamage(metrics.summary.totalDamage)}
    
    Player 1 Performance:
    - Accuracy: ${formatAccuracy(metrics.player1.accuracy)}
    - Crit Rate: ${formatAccuracy(metrics.player1.critRate)}
    - Defense Rate: ${formatAccuracy(metrics.player1.defenseRate)}
    - Rating: ${getPerformanceRating(metrics.player1)}
  `;
} else {
  // Fallback to basic display
  const winner = combatResult.winningPlayerId;
  // ... basic display logic
}
```

This migration maintains full backward compatibility while providing powerful new features for enhanced combat analysis and display! 🎯 