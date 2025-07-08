# 🔥 SKIN DETAILS PAGE - AVAILABLE DATA GUIDE

**For Frontend Team: Here's ALL the skin analytics data available from the subgraph**

## 🚀 TLDR - WHAT YOU GET

**Input**: `skinCollectionId` + `skinTokenId` (what you already have)  
**Output**: Complete analytics for all 3 stances (Defensive, Balanced, Offensive)

**Key Metrics Available**:
- ✅ **Win/Loss breakdown per stance** (wins, losses, win rate)
- ✅ **Damage stats** (dealt, taken, efficiency, max damage)  
- ✅ **Lethality metrics** (kill rate, death rate, survival rate)
- ✅ **Win condition breakdown** (deaths, knockouts, exhaustions, max rounds)
- ✅ **Performance ratings** (S-Tier to D-Tier based on multiple factors)
- ✅ **🔥 TOP WARRIORS** (who performs best with this skin+stance) - **FAST QUERIES!**
- ✅ **🔥 PLAYER SKIN PERFORMANCE** (individual warrior records) - **FAST QUERIES!**
- ✅ **Meta insights** (automated performance analysis)

## 📊 PRIMARY DATA SOURCES

### **1. `SkinCombatStat` Entity (Overall Performance)**
**Entity ID Format**: `{skinCollectionId}-{skinTokenId}-{stance}`
- **Aggregated stats** across all players using this skin+stance
- **Perfect for stance comparison cards**

### **2. `PlayerSkinCombatStat` Entity (Individual Performance)** 🔥 **NEW!**
**Entity ID Format**: `{playerId}-{skinCollectionId}-{skinTokenId}-{stance}`
- **Individual player performance** with specific skin+stance
- **Perfect for Top Warriors rankings**
- **Fast queries** - no frontend processing needed!

### Example GraphQL Query for Single Skin Details:
```graphql
query getSkinAnalytics($skinCollectionId: BigInt!, $skinTokenId: Int!) {
  # Get all stance variations for this skin
  skinCombatStats(where: {
    skinCollectionId: $skinCollectionId,
    skinTokenId: $skinTokenId
  }) {
    id
    stance                    # 0=Defensive, 1=Balanced, 2=Offensive
    
    # COMBAT COUNTS
    totalCombats
    wins
    losses
    
    # WIN CONDITIONS BREAKDOWN
    kills                     # "DEATH" victories
    deaths                    # "DEATH" defeats  
    knockouts                 # "HEALTH"/"KO" victories
    knockedOut                # "HEALTH"/"KO" defeats
    exhaustions               # "EXHAUSTION" victories
    exhausted                 # "EXHAUSTION" defeats
    maxRoundWins              # "MAX_ROUNDS" victories
    maxRoundLosses            # "MAX_ROUNDS" defeats
    
    # CALCULATED RATES (BigDecimal)
    killRate                  # kills / totalCombats
    deathRate                 # deaths / totalCombats  
    killDeathRatio            # kills / deaths (infinite if no deaths)
    winRate                   # wins / totalCombats
    survivalRate              # (totalCombats - deaths) / totalCombats
    
    # OFFENSIVE METRICS
    totalDamageDealt
    averageDamageDealt        # totalDamageDealt / totalCombats
    maxDamageDealt            # Highest single combat damage
    
    # DEFENSIVE METRICS  
    totalDamageTaken
    averageDamageTaken        # totalDamageTaken / totalCombats
    totalHealthLost
    averageHealthLost         # totalHealthLost / totalCombats
    minDamageTaken            # Best defensive performance (lowest damage taken)
    
    # EFFICIENCY METRICS
    damageEfficiency          # damageDealt / damageTaken
    
    # TIMESTAMPS
    firstCombat               # When first used in combat
    lastCombat                # Most recent combat
    lastUpdated               # Last analytics update
    
    # SKIN REFERENCE
    skin {
      id
      metadataURI
      weapon
      armor
      collection {
        contractAddress
        isVerified
        skinType
      }
    }
  }
}
```

## 🏆 STANCE PERFORMANCE COMPARISON

**You get 3 records per skin (one for each stance):**

```typescript
// Example response structure
const skinAnalytics = [
  {
    id: "123-456-0",           // Defensive stance
    stance: 0,
    totalCombats: 45,
    wins: 32,
    winRate: "0.711",          // 71.1% win rate
    averageDamageDealt: "85.6",
    averageDamageTaken: "42.3",
    damageEfficiency: "2.02",  // Deals 2x damage vs takes
    survivalRate: "0.956"      // 95.6% survival rate
  },
  {
    id: "123-456-1",           // Balanced stance  
    stance: 1,
    totalCombats: 67,
    wins: 41,
    winRate: "0.612",          // 61.2% win rate
    // ... more stats
  },
  {
    id: "123-456-2",           // Offensive stance
    stance: 2, 
    totalCombats: 23,
    wins: 18,
    winRate: "0.783",          // 78.3% win rate
    // ... more stats
  }
]
```

## 📈 AVAILABLE METRICS BREAKDOWN

### **Win/Loss Analysis**
- **Total Combats**: How many times this skin+stance was used
- **Win Rate**: Overall success rate (wins / total)
- **Wins/Losses**: Raw counts
- **W-L-K Format**: `{wins}-{losses}-{kills}` (like your UI shows: "4-1-0")

### **Lethality Analysis** 
- **Kill Rate**: % of combats ending in opponent death
- **Death Rate**: % of combats ending in own death  
- **Kill/Death Ratio**: Kills per death (shows lethality vs survivability)
- **Survival Rate**: % of combats survived (1 - death rate)

### **Win Condition Breakdown**
- **Kills/Deaths**: Opponent died vs you died
- **Knockouts/Knocked Out**: Health-based victories/defeats
- **Exhaustions/Exhausted**: Stamina-based victories/defeats  
- **Max Round Wins/Losses**: Time-based victories/defeats

### **Offensive Power**
- **Total Damage Dealt**: Cumulative damage across all combats
- **Average Damage**: Damage per combat (`averageDamageDealt`)
- **Max Damage**: Highest single combat damage output

### **Defensive Capability**
- **Total Damage Taken**: Cumulative damage received
- **Average Damage Taken**: Damage received per combat (`averageDamageTaken`)
- **Average Mitigation**: Average damage taken per combat (lower = better defense)
- **Min Damage Taken**: Best defensive performance
- **Total Health Lost**: Cumulative health lost
- **Average Health Lost**: Health lost per combat

### **Efficiency Metrics**
- **Damage Efficiency**: Damage dealt ÷ damage taken (higher = better trade ratio)

### **Performance Rating**
- **S-Tier to D-Tier**: Calculated performance rating based on multiple factors
- **Meta Insights**: Automated analysis (e.g., "🔥 Dominant performer", "🛡️ Excellent survivability")

### **Activity Tracking**
- **First Combat**: When this loadout was first used
- **Last Combat**: Most recent usage
- **Last Updated**: When analytics were last calculated

### **🆕 ADDITIONAL METRICS YOU CAN DERIVE**

**From CombatResult history, you can also calculate:**

#### **Combat Style Analysis**
- **Average Round Count**: How long fights typically last with this stance
- **Quick Finisher Rate**: % of fights ending in ≤3 rounds
- **Endurance Fighter Rate**: % of fights lasting ≥8 rounds

#### **Accuracy & Precision**
- **Hit Rate**: Successful hits ÷ total attacks
- **Critical Hit Rate**: Critical hits ÷ total attacks  
- **Attack Success Rate**: (Hits + Crits) ÷ total attacks

#### **Defensive Mastery**
- **Block Rate**: Successful blocks ÷ opponent attacks
- **Dodge Rate**: Successful dodges ÷ opponent attacks
- **Parry Rate**: Successful parries ÷ opponent attacks
- **Counter Rate**: Counter attacks ÷ opponent attacks

#### **Stamina Management**
- **Average Stamina Lost**: Stamina consumed per combat
- **Stamina Efficiency**: Damage dealt ÷ stamina consumed
- **Exhaustion Resistance**: % of fights where stamina > 20% at end

## 🏆 TOP WARRIORS - FAST QUERIES! 🔥

**Now you can get Top Warriors WITHOUT processing 10k+ combat results!**

### **GraphQL Query for Top Warriors:**
```graphql
query getTopWarriors($skinCollectionId: BigInt!, $skinTokenId: Int!, $stance: Int!) {
  # Most Wins
  playerSkinCombatStats(
    where: { skinCollectionId: $skinCollectionId, skinTokenId: $skinTokenId, stance: $stance }
    orderBy: wins
    orderDirection: desc
    first: 10
  ) {
    playerId
    wins
    losses
    totalCombats
    winRate
    player {
      fullName
      fighterId
    }
  }
  
  # Best Win Rate (minimum 5 fights)
  playerSkinCombatStats(
    where: { 
      skinCollectionId: $skinCollectionId, 
      skinTokenId: $skinTokenId, 
      stance: $stance,
      totalCombats_gte: 5
    }
    orderBy: winRate
    orderDirection: desc
    first: 10
  ) {
    playerId
    winRate
    totalCombats
    wins
    losses
    player {
      fullName
      fighterId
    }
  }
  
  # Most Damage
  playerSkinCombatStats(
    where: { skinCollectionId: $skinCollectionId, skinTokenId: $skinTokenId, stance: $stance }
    orderBy: totalDamageDealt
    orderDirection: desc
    first: 10
  ) {
    playerId
    totalDamageDealt
    averageDamageDealt
    totalCombats
    player {
      fullName
      fighterId
    }
  }
  
  # Best Survival Rate
  playerSkinCombatStats(
    where: { 
      skinCollectionId: $skinCollectionId, 
      skinTokenId: $skinTokenId, 
      stance: $stance,
      totalCombats_gte: 5
    }
    orderBy: survivalRate
    orderDirection: desc
    first: 10
  ) {
    playerId
    survivalRate
    deaths
    totalCombats
    player {
      fullName
      fighterId
    }
  }
  
  # Most Kills
  playerSkinCombatStats(
    where: { skinCollectionId: $skinCollectionId, skinTokenId: $skinTokenId, stance: $stance }
    orderBy: kills
    orderDirection: desc
    first: 10
  ) {
    playerId
    kills
    killRate
    totalCombats
    player {
      fullName
      fighterId
    }
  }
}
```

### **Frontend Usage:**
```typescript
// Get all 5 top warrior categories in a single query
const topWarriors = await getTopWarriors({
  skinCollectionId: "123",
  skinTokenId: 456,
  stance: 1  // Balanced stance
});

// Results are pre-calculated and lightning fast! ⚡
```

## 🔍 SECONDARY DATA: Historical Combat Results

**For detailed combat history, query `CombatResult` entities:**

```graphql
query getSkinCombatHistory($skinCollectionId: BigInt!, $skinTokenId: Int!, $stance: Int) {
  combatResults(
    where: {
      or: [
        {
          player1SkinCollectionId: $skinCollectionId,
          player1SkinTokenId: $skinTokenId,
          player1Stance: $stance
        },
        {
          player2SkinCollectionId: $skinCollectionId,
          player2SkinTokenId: $skinTokenId,
          player2Stance: $stance
        }
      ]
    },
    orderBy: blockTimestamp,
    orderDirection: desc,
    first: 50
  ) {
    id
    transactionHash
    winCondition              # "DEATH", "HEALTH", "EXHAUSTION", "MAX_ROUNDS"
    roundCount               # How many rounds the fight lasted
    blockTimestamp
    
    # Player 1 data
    player1Won
    player1SkinCollectionId
    player1SkinTokenId  
    player1Stance
    player1TotalDamage
    player1TotalStaminaLost
    player1Attacks
    player1Hits
    player1Misses
    player1Crits
    player1Blocks
    player1Counters
    player1Dodges
    player1Parries
    player1Ripostes
    player1MaxHealth
    player1EndingHealth
    player1MaxStamina
    player1EndingStamina
    
    # Player 2 data (same structure)
    player2Won
    player2SkinCollectionId
    player2SkinTokenId
    player2Stance
    player2TotalDamage
    # ... all player2 stats
    
    # Skin references
    player1Skin {
      id
      metadataURI
      weapon
      armor
    }
    player2Skin {
      id
      metadataURI  
      weapon
      armor
    }
  }
}
```

## 💡 FRONTEND IMPLEMENTATION TIPS

### **1. Stance Name Helper**
```typescript
const getStanceName = (stance: number): string => {
  const names = ['Defensive', 'Balanced', 'Offensive'];
  return names[stance] || 'Unknown';
};

const getStanceColor = (stance: number): string => {
  const colors = ['#3B82F6', '#10B981', '#EF4444']; // Blue, Green, Red
  return colors[stance] || '#6B7280';
};
```

### **2. Performance Rating Calculator**
```typescript
const calculatePerformanceRating = (stats: SkinCombatStat): string => {
  if (stats.totalCombats < 5) return 'Insufficient Data';
  
  const winRate = parseFloat(stats.winRate);
  const survivalRate = parseFloat(stats.survivalRate);
  const damageEfficiency = parseFloat(stats.damageEfficiency);
  
  // Weighted score (win rate 50%, survival 25%, efficiency 25%)
  const score = (winRate * 0.5) + (survivalRate * 0.25) + (Math.min(damageEfficiency, 3) / 3 * 0.25);
  
  if (score >= 0.8) return 'S-Tier';
  if (score >= 0.7) return 'A-Tier'; 
  if (score >= 0.6) return 'B-Tier';
  if (score >= 0.5) return 'C-Tier';
  return 'D-Tier';
};
```

### **3. Best Stance Recommendation**
```typescript
const getBestStance = (allStanceStats: SkinCombatStat[]): SkinCombatStat | null => {
  const validStats = allStanceStats.filter(s => s.totalCombats >= 3);
  if (validStats.length === 0) return null;
  
  return validStats.reduce((best, current) => {
    const bestScore = parseFloat(best.winRate) * best.totalCombats;
    const currentScore = parseFloat(current.winRate) * current.totalCombats;
    return currentScore > bestScore ? current : best;
  });
};
```

### **4. Meta Analysis**
```typescript
const getMetaInsights = (stats: SkinCombatStat): string[] => {
  const insights: string[] = [];
  const winRate = parseFloat(stats.winRate);
  const killRate = parseFloat(stats.killRate);
  const survivalRate = parseFloat(stats.survivalRate);
  const damageEfficiency = parseFloat(stats.damageEfficiency);
  
  if (winRate > 0.75) insights.push('🔥 Dominant performer');
  if (killRate > 0.3) insights.push('💀 High lethality');
  if (survivalRate > 0.9) insights.push('🛡️ Excellent survivability');
  if (damageEfficiency > 2.0) insights.push('⚔️ Superior damage efficiency');
  if (stats.totalCombats > 100) insights.push('📊 Battle-tested veteran');
  
  return insights;
};
```

### **5. W-L-K Format Helper**
```typescript
const formatWLK = (stats: SkinCombatStat): string => {
  return `${stats.wins}-${stats.losses}-${stats.kills}`;
};
```

### **6. Advanced Combat Analytics**
```typescript
const calculateAdvancedMetrics = (combatHistory: CombatResult[], skinId: string, stance: number) => {
  const relevantCombats = combatHistory.filter(combat => {
    const isPlayer1 = combat.player1SkinCollectionId + '-' + combat.player1SkinTokenId === skinId && 
                     combat.player1Stance === stance;
    const isPlayer2 = combat.player2SkinCollectionId + '-' + combat.player2SkinTokenId === skinId && 
                     combat.player2Stance === stance;
    return isPlayer1 || isPlayer2;
  });

  let totalRounds = 0;
  let quickFinishes = 0;
  let enduranceFights = 0;
  let totalHits = 0;
  let totalAttacks = 0;
  let totalCrits = 0;
  let totalBlocks = 0;
  let totalDodges = 0;
  let totalParries = 0;
  let totalCounters = 0;
  let totalStaminaLost = 0;
  let totalOpponentAttacks = 0;

  relevantCombats.forEach(combat => {
    const isPlayer1 = combat.player1SkinCollectionId + '-' + combat.player1SkinTokenId === skinId;
    
    if (isPlayer1) {
      totalRounds += combat.roundCount;
      totalHits += combat.player1Hits;
      totalAttacks += combat.player1Attacks;
      totalCrits += combat.player1Crits;
      totalBlocks += combat.player1Blocks;
      totalDodges += combat.player1Dodges;
      totalParries += combat.player1Parries;
      totalCounters += combat.player1Counters;
      totalStaminaLost += combat.player1TotalStaminaLost;
      totalOpponentAttacks += combat.player2Attacks;
    } else {
      totalRounds += combat.roundCount;
      totalHits += combat.player2Hits;
      totalAttacks += combat.player2Attacks;
      totalCrits += combat.player2Crits;
      totalBlocks += combat.player2Blocks;
      totalDodges += combat.player2Dodges;
      totalParries += combat.player2Parries;
      totalCounters += combat.player2Counters;
      totalStaminaLost += combat.player2TotalStaminaLost;
      totalOpponentAttacks += combat.player1Attacks;
    }

    if (combat.roundCount <= 3) quickFinishes++;
    if (combat.roundCount >= 8) enduranceFights++;
  });

  const totalCombats = relevantCombats.length;
  
  return {
    averageRoundCount: totalCombats > 0 ? (totalRounds / totalCombats).toFixed(1) : '0',
    quickFinisherRate: totalCombats > 0 ? ((quickFinishes / totalCombats) * 100).toFixed(1) + '%' : '0%',
    enduranceFighterRate: totalCombats > 0 ? ((enduranceFights / totalCombats) * 100).toFixed(1) + '%' : '0%',
    hitRate: totalAttacks > 0 ? ((totalHits / totalAttacks) * 100).toFixed(1) + '%' : '0%',
    criticalHitRate: totalAttacks > 0 ? ((totalCrits / totalAttacks) * 100).toFixed(1) + '%' : '0%',
    attackSuccessRate: totalAttacks > 0 ? (((totalHits + totalCrits) / totalAttacks) * 100).toFixed(1) + '%' : '0%',
    blockRate: totalOpponentAttacks > 0 ? ((totalBlocks / totalOpponentAttacks) * 100).toFixed(1) + '%' : '0%',
    dodgeRate: totalOpponentAttacks > 0 ? ((totalDodges / totalOpponentAttacks) * 100).toFixed(1) + '%' : '0%',
    parryRate: totalOpponentAttacks > 0 ? ((totalParries / totalOpponentAttacks) * 100).toFixed(1) + '%' : '0%',
    counterRate: totalOpponentAttacks > 0 ? ((totalCounters / totalOpponentAttacks) * 100).toFixed(1) + '%' : '0%',
    averageStaminaLost: totalCombats > 0 ? (totalStaminaLost / totalCombats).toFixed(1) : '0'
  };
};
```

## 🚨 IMPORTANT DATA NOTES

### **Data Availability**
- **Analytics populate from new combats only** - historical data builds over time
- **Minimum 1 combat** required for analytics to exist
- **Stance-specific data** - each stance gets separate analytics

### **BigDecimal Handling**
```typescript
// Convert BigDecimal strings to numbers for display
const formatRate = (bigDecimalString: string): string => {
  const rate = parseFloat(bigDecimalString);
  return (rate * 100).toFixed(1) + '%';
};

const formatRatio = (bigDecimalString: string): string => {
  const ratio = parseFloat(bigDecimalString);
  return ratio.toFixed(2);
};
```

### **Fallback for Missing Data**
```typescript
const getSkinStats = async (skinCollectionId: string, skinTokenId: number) => {
  const analytics = await querySkinCombatStats(skinCollectionId, skinTokenId);
  
  if (analytics.length === 0) {
    // Fallback: Calculate from CombatResult entities
    const combatHistory = await querySkinCombatHistory(skinCollectionId, skinTokenId);
    return calculateStatsFromHistory(combatHistory);
  }
  
  return analytics;
};
```

## 🎯 UI COMPONENTS YOU CAN BUILD

### **1. Stance Performance Cards** ✅ (Like your mockup)
- Win rate, W-L-K format, performance tier
- Color-coded by stance (Defensive=Blue, Balanced=Green, Offensive=Red)
- Average damage dealt/taken (AVG DMG/AVG MIT)
- Battle count and rating

### **2. Lethality vs Survivability Chart**  
- X-axis: Kill Rate, Y-axis: Survival Rate
- Shows if skin is aggressive, defensive, or balanced

### **3. Damage Efficiency Meter**
- Bar chart showing damage dealt vs damage taken
- Efficiency ratio as multiplier (2.5x = deals 2.5x more than takes)

### **4. Win Condition Breakdown Pie Chart**
- Deaths, Knockouts, Exhaustions, Max Rounds
- Shows how this skin typically wins/loses

### **5. Combat Timeline**
- Recent combat results with opponents
- Win/loss streaks and performance trends

### **6. Meta Insights Panel**
- Automated insights based on performance metrics
- Recommendations for stance usage

### **🆕 7. Advanced Analytics Dashboard**
- **Combat Style Radar Chart**: Hit rate, crit rate, block rate, dodge rate, parry rate
- **Round Duration Analysis**: Average rounds, quick finisher %, endurance fighter %
- **Stamina Management**: Average stamina lost, efficiency metrics
- **Defensive Mastery Breakdown**: Block/dodge/parry/counter rates

### **🆕 8. Stance Comparison Table**
```
| Metric          | Defensive | Balanced | Offensive |
|-----------------|-----------|----------|-----------|
| Win Rate        | 71.1%     | 80.0%    | 50.0%     |
| W-L-K           | 32-13-2   | 4-1-0    | 2-2-0     |
| Avg Damage      | 143.5     | 342.8    | 249.3     |
| Avg Mitigation  | 339.5     | 190.6    | 234.3     |
| Hit Rate        | 68.2%     | 75.4%    | 82.1%     |
| Block Rate      | 45.3%     | 32.1%    | 18.7%     |
| Quick Finishes  | 12.5%     | 28.6%    | 41.2%     |
| Rating          | A-Tier    | S-Tier   | B-Tier    |
```

### **🆕 9. Performance Trends**
- Win rate over time (last 30 days)
- Damage efficiency trends
- Recent performance vs historical average

---

## 🔥 BONUS: CHAMPION/LEADERBOARD DATA

**Want to show "Top Warriors" for this skin? Query all combat results and calculate:**

```graphql
query getSkinsTopWarriors($skinCollectionId: BigInt!, $skinTokenId: Int!) {
  combatResults(
    where: {
      or: [
        {
          player1SkinCollectionId: $skinCollectionId,
          player1SkinTokenId: $skinTokenId
        },
        {
          player2SkinCollectionId: $skinCollectionId,
          player2SkinTokenId: $skinTokenId
        }
      ]
    }
  ) {
    # Extract player IDs and performance data
    player1Data  # Contains player ID in first 4 bytes
    player2Data  # Contains player ID in first 4 bytes
    player1Won
    player1TotalDamage
    player2TotalDamage
    # ... use to calculate per-player stats with this skin
  }
}
```

**Then calculate top performers client-side for:**
- Most wins with this skin
- Best win rate with this skin (min 5 fights)
- Most damage dealt with this skin
- Best survival rate with this skin

---

---

## 🎯 EXACT DATA FOR YOUR UI MOCKUP

**Based on your screenshot, here's the exact mapping:**

```typescript
// For each stance card in your UI
const stanceCardData = {
  stanceName: getStanceName(stats.stance), // "DEFENSIVE", "BALANCED", "OFFENSIVE"
  stanceColor: getStanceColor(stats.stance), // Blue, Green, Red
  winRate: formatRate(stats.winRate), // "80.0%"
  wlkRecord: formatWLK(stats), // "4-1-0" 
  battles: stats.totalCombats, // 5
  avgDamage: parseFloat(stats.averageDamageDealt).toFixed(1), // "342.8"
  avgMitigation: parseFloat(stats.averageDamageTaken).toFixed(1), // "190.6" 
  rating: calculatePerformanceRating(stats) // "S-TIER"
};
```

**GraphQL Query for Your Exact UI:**
```graphql
query getStanceBreakdown($skinCollectionId: BigInt!, $skinTokenId: Int!) {
  skinCombatStats(where: {
    skinCollectionId: $skinCollectionId,
    skinTokenId: $skinTokenId
  }) {
    stance
    winRate
    wins
    losses  
    kills
    totalCombats
    averageDamageDealt
    averageDamageTaken
  }
}
```

**Frontend Component:**
```tsx
const StanceCard = ({ stats }: { stats: SkinCombatStat }) => (
  <div className={`stance-card stance-${stats.stance}`}>
    <div className="stance-header">
      <Icon className={getStanceIcon(stats.stance)} />
      <span>{getStanceName(stats.stance)}</span>
    </div>
    
    <div className="win-rate">{formatRate(stats.winRate)}</div>
    <div className="wlk-record">{formatWLK(stats)}</div>
    <div className="battles">{stats.totalCombats}</div>
    <div className="avg-damage">{parseFloat(stats.averageDamageDealt).toFixed(1)}</div>
    <div className="avg-mitigation">{parseFloat(stats.averageDamageTaken).toFixed(1)}</div>
    <div className="rating">{calculatePerformanceRating(stats)}</div>
  </div>
);
```

---

**Questions? The data is all there - just query `SkinCombatStat` entities and you're golden! 🚀** 