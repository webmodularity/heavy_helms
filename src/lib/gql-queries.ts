import { gql } from "graphql-request";

export const PLAYER_DATA_FRAGMENT = gql`
  fragment PlayerDataFields on Player {
    id
    firstName
    surname
    fullName
    currentSkin {
      collection {
        id
        contractAddress
        isVerified
        skinType
        requiredNFTAddress
      }
      tokenId
      metadataURI
      weapon
      armor
    }
    stance
    strength
    constitution
    size
    agility
    stamina
    luck
    wins
    losses
    kills
    duelWins
    gauntletWins
    uniqueWins
    uniqueLosses
    battleRating
    isRetired
    isImmortal
    owner {
      address
    }
  }
`;

export const GET_PLAYERS_BY_IDS = gql`
  query GetPlayersByIds($playerIds: [ID!]!) {
    players(where: { id_in: $playerIds }) {
      ...PlayerDataFields
    }
  }
  ${PLAYER_DATA_FRAGMENT}
`;

export const GET_VERIFIED_SKIN_COLLECTIONS = gql`
  query GetVerifiedSkinCollections {
  skinCollections(where: { isVerified: true }) {
    id
    registryId
    contractAddress
    skinType
    requiredNFTAddress
    skins {
      id
      tokenId
      metadataURI
      weapon
      armor
      }
    }
  }
`;

// Base Fighter fragment for shared properties across all fighter types
export const FIGHTER_BASE_FRAGMENT = gql`
  fragment FighterBaseFields on Fighter {
    id
    fighterId
    fighterType
    isRetired
    
    # Common attributes
    strength
    constitution
    size
    agility
    stamina
    luck
    
    # Name fields
    firstName
    surname
    fullName
    
    # Skin information
    currentSkin {
      collection {
        id
        contractAddress
        isVerified
        skinType
        requiredNFTAddress
      }
      tokenId
      metadataURI
      weapon
      armor
    }
    stance
    
    # Record fields
    wins
    losses
    kills
    duelWins
    gauntletWins
  }
`;

// Fragment for Player-specific fields
export const PLAYER_SPECIFIC_FRAGMENT = gql`
  fragment PlayerSpecificFields on Player {
    isImmortal
    owner {
      address
    }
    battleRating
    uniqueWins
    uniqueLosses
    gauntletStatus
  }
`;

// Fragment for Monster-specific fields
export const MONSTER_SPECIFIC_FRAGMENT = gql`
  fragment MonsterSpecificFields on Monster {
    tier
  }
`;

// Complete Fighter fragment with type-specific fields
export const FIGHTER_COMPLETE_FRAGMENT = gql`
  fragment FighterCompleteFields on Fighter {
    ...FighterBaseFields
    ... on Player {
      ...PlayerSpecificFields
    }
    ... on Monster {
      ...MonsterSpecificFields
    }
    # DefaultPlayer has no additional fields beyond the base
  }
  ${FIGHTER_BASE_FRAGMENT}
  ${PLAYER_SPECIFIC_FRAGMENT}
  ${MONSTER_SPECIFIC_FRAGMENT}
`;

// Query to get fighters by IDs
export const GET_FIGHTERS_BY_IDS = gql`
  query GetFightersByIds($fighterIds: [ID!]!) {
    fighters(where: { id_in: $fighterIds }) {
      ...FighterCompleteFields
    }
  }
  ${FIGHTER_COMPLETE_FRAGMENT}
`;

// Challenge fragments
export const CHALLENGE_BASE_FRAGMENT = gql`
  fragment ChallengeBaseFields on DuelChallenge {
    id
    wagerAmount
    state
    createdAt
    challengerOwner
    defenderOwner
  }
`;

export const CHALLENGE_FIGHTER_FRAGMENT = gql`
  fragment ChallengeFighterFields on Fighter {
    id
    fighterId
    fighterType
    firstName
    surname
    fullName
    currentSkin {
      weapon
      armor
    }
    stance
  }
`;

export const CHALLENGE_COMPLETE_FRAGMENT = gql`
  fragment ChallengeCompleteFields on DuelChallenge {
    ...ChallengeBaseFields
    challengerSnapshot {
      ...ChallengeFighterFields
    }
    defenderSnapshot {
      ...ChallengeFighterFields
    }
  }
  ${CHALLENGE_BASE_FRAGMENT}
  ${CHALLENGE_FIGHTER_FRAGMENT}
`;

// Query to get a user's challenges
export const GET_USER_CHALLENGES = gql`
  query GetUserChallenges($userAddress: String!) {
    sentChallenges: duelChallenges(
      where: {
        state: OPEN,
        challengerOwner: $userAddress
      }
    ) {
      ...ChallengeCompleteFields
    }
    
    receivedChallenges: duelChallenges(
      where: {
        state: OPEN,
        defenderOwner: $userAddress
      }
    ) {
      ...ChallengeCompleteFields
    }
  }
  ${CHALLENGE_COMPLETE_FRAGMENT}
`;

export const GET_ACTIVE_PLAYERS_QUERY = gql`
  query GetActivePlayers($first: Int = 100) {
    players(where: { isRetired: false }, first: $first, orderBy: id, orderDirection: asc) {
      ...FighterBaseFields
    }
  }
  ${FIGHTER_BASE_FRAGMENT}
`;

export const GET_ACTIVE_IDS_QUERY = gql`
  query GetActiveIds {
    players(where: { isRetired: false }, first: 1000) {
      id
    }
  }
`;

export const GET_ALL_ACTIVE_PLAYER_IDS_QUERY = gql`
  query GetAllActivePlayerIds {
    players(where: { isRetired: false }, first: 1000) {
      id
    }
    defaultPlayers(where: { isRetired: false }, first: 1000) {
      id
    }
    monsters(where: { isRetired: false }, first: 1000) {
      id
    }
  }
`;

export const GET_ACTIVE_DEFAULT_PLAYER_IDS_QUERY = gql`
  query GetActiveDefaultPlayerIds {
    defaultPlayers(where: { isRetired: false }, first: 1000) {
      id
    }
  }
`;

// Add this new query to your gql-queries.ts file
export const GET_FIGHTER_CHALLENGES = gql`
  query GetFighterChallenges($fighterId: ID!) {
    sentChallenges: duelChallenges(
      where: {
        state: OPEN,
        challengerSnapshot_: { id: $fighterId }
      }
    ) {
      ...ChallengeCompleteFields
    }
    
    receivedChallenges: duelChallenges(
      where: {
        state: OPEN,
        defenderSnapshot_: { id: $fighterId }
      }
    ) {
      ...ChallengeCompleteFields
    }
  }
  ${CHALLENGE_COMPLETE_FRAGMENT}
`;

export const GET_OWNED_PLAYERS_QUERY = gql`
  query GetOwnedPlayers($owner: String!) {
    owners(where: {address: $owner}) {
      address
      totalPlayers
      playerSlots
      nameChangeCharges
      attributeSwapCharges
      activePlayers(where: {isRetired: false}) {
        ...FighterCompleteFields
      }
    }
  }
  ${FIGHTER_COMPLETE_FRAGMENT}
`;

export const GET_COMBAT_RESULT = gql`
  query GetCombatResult($txHash: Bytes!) {
    combatResults(
      where: { transactionHash: $txHash },
      first: 1
    ) {
      id
      transactionHash
      player1Data
      player2Data
      winningPlayerId
      packedResults
      blockTimestamp
      blockNumber
      logIndex
      
      # New detailed combat statistics (optional)
      player1Won
      gameEngineVersion
      winCondition
      roundCount
      player1TotalDamage
      player2TotalDamage
      player1Crits
      player2Crits
      player1Hits
      player2Hits
    }
  }
`;

export const GET_COMBAT_RESULTS = gql`
  query GetCombatResultsByTxHash($txHash: Bytes!) {
    combatResults(
      where: { transactionHash: $txHash }
      orderBy: logIndex
      orderDirection: asc
    ) {
      id
      transactionHash
      logIndex
      player1Data
      player2Data
      winningPlayerId
      blockNumber
      blockTimestamp
      packedResults
    }
  }
`;

export const GET_COMBAT_RESULTS_DETAILED = gql`
  query GetCombatResultsDetailed($txHash: Bytes!) {
    combatResults(
      where: { transactionHash: $txHash }
      orderBy: logIndex
      orderDirection: asc
    ) {
      id
      transactionHash
      logIndex
      player1Data
      player2Data
      winningPlayerId
      blockNumber
      blockTimestamp
      packedResults
      
      # New detailed combat statistics
      player1Won
      gameEngineVersion
      winCondition
      roundCount
      
      # Player 1 combat statistics
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
      player1DefensiveActions
      player1MaxDamage
      
      # Player 1 Failed Attack Types (attacks that didn't land due to opponent's defense)
      player1AttacksBlocked
      player1AttacksCountered
      player1AttacksDodged
      player1AttacksParried
      player1AttacksRiposted
      
      # Player 2 combat statistics
      player2TotalDamage
      player2TotalStaminaLost
      player2Attacks
      player2Hits
      player2Misses
      player2Crits
      player2Blocks
      player2Counters
      player2Dodges
      player2Parries
      player2Ripostes
      player2DefensiveActions
      player2MaxDamage
      
      # Player 2 Failed Attack Types (attacks that didn't land due to opponent's defense)
      player2AttacksBlocked
      player2AttacksCountered
      player2AttacksDodged
      player2AttacksParried
      player2AttacksRiposted
      
      # New health and stamina fields
      player1MaxHealth
      player1MaxStamina
      player1EndingHealth
      player1EndingStamina
      player2MaxHealth
      player2MaxStamina
      player2EndingHealth
      player2EndingStamina
    }
  }
`;

// Query to fetch names by their indices
export const GET_NAMES_BY_INDICES = gql`
  query GetNamesByIndices(
    $firstNameIndex: Int!,
    $surnameIndex: Int!,
    $firstNameType: Int! # Use nameType instead of registryId
  ) {
    # Filter first name by the dynamic nameType (0 or 1)
    firstNameResult: names(where: { nameType: $firstNameType, index: $firstNameIndex }) {
      id
      value
    }
    # Filter surname by the fixed nameType 2
    surnameResult: names(where: { nameType: 2, index: $surnameIndex }) {
      id
      value
    }
  }
`;

// Query to fetch skin collection and skin data
export const GET_SKIN_BY_INDICES = gql`
  query GetSkinByIndices($registryId: BigInt!, $tokenId: Int!) {
    skinCollections(where: {registryId: $registryId}) {
      id
      contractAddress
      isVerified
      skinType
      requiredNFTAddress
      skins(where: {tokenId: $tokenId}) {
        id
        tokenId
        metadataURI
        weapon
        armor
      }
    }
  }
`;

// Query for all duels (without filtering)
export const GET_ALL_DUELS = gql`
  query GetAllDuels($limit: Int!, $skip: Int!) {
    duelCompletes(
      first: $limit,
      skip: $skip,
      orderBy: blockTimestamp,
      orderDirection: desc
    ) {
      id
      blockNumber
      blockTimestamp
      winnerId
      challenge {
        wagerAmount
        challengerId
        defenderId
        challengerSnapshot {
          id
          firstName
          surname
          fullName
          currentSkin {
            collection { id contractAddress isVerified skinType requiredNFTAddress }
            tokenId
            metadataURI
            weapon
            armor
          }
          stance
          strength
          constitution
          size
          agility
          stamina
          luck
          wins
          losses
          kills
          isRetired
          isImmortal
        }
        defenderSnapshot {
          id
          firstName
          surname
          fullName
          currentSkin {
            collection { id contractAddress isVerified skinType requiredNFTAddress }
            tokenId
            metadataURI
            weapon
            armor
          }
          stance
          strength
          constitution
          size
          agility
          stamina
          luck
          wins
          losses
          kills
          isRetired
          isImmortal
        }
      }
    }
  }
  ${PLAYER_DATA_FRAGMENT}
`;

export const GET_PLAYER_DUELS = gql`
  query GetPlayerDuels($limit: Int!, $skip: Int!, $playerId: ID!) {
     duelCompletes(
      where: {
        or: [
          { challenge_: { challengerId: $playerId } }, 
          { challenge_: { defenderId: $playerId } }
        ]
      },
      first: $limit,
      skip: $skip,
      orderBy: blockTimestamp,
      orderDirection: desc
    ) {
      id
      blockNumber
      blockTimestamp
      winnerId
      challenge {
        wagerAmount
        challengerId
        defenderId
        challengerSnapshot {
          id
          firstName
          surname
          fullName
          currentSkin {
            collection { id contractAddress isVerified skinType requiredNFTAddress }
            tokenId
            metadataURI
            weapon
            armor
          }
          stance
          strength
          constitution
          size
          agility
          stamina
          luck
          wins
          losses
          kills
          isRetired
          isImmortal
        }
        defenderSnapshot {
          id
          firstName
          surname
          fullName
          currentSkin {
            collection { id contractAddress isVerified skinType requiredNFTAddress }
            tokenId
            metadataURI
            weapon
            armor
          }
          stance
          strength
          constitution
          size
          agility
          stamina
          luck
          wins
          losses
          kills
          isRetired
          isImmortal
        }
      }
    }
  }
`;

export const GET_GAME_STATS = gql`
  query GetGameStats {
    stats(id: "all") {      
      # Fighter counts
      playerCount
      activePlayerCount
      retiredPlayerCount
      defaultPlayerCount
      monsterCount
      activeMonsterCount
      retiredMonsterCount
      totalFightersCount
      
      # Combat statistics
      totalWins
      totalLosses
      totalKills
      
      # Duel statistics
      totalDuels
      totalWagerDuels
      totalNonWagerDuels
      openChallenges
      completedDuels
      cancelledDuels
      forfeitedDuels
      
      # Wager statistics
      totalWageredAmount
      totalFeesCollected
      totalWinnerPayouts
      averageWagerAmount
      
      # Skin statistics
      skinCollectionsCount
      verifiedSkinCollectionsCount
      totalSkinsCount
      
      # Owner statistics
      uniqueOwnersCount
      
      # Timestamps
      lastUpdated

      # Gauntlet statistics
      totalGauntletsStarted
      totalGauntletsCompleted
      totalGauntletsRecovered
      totalGauntletPrizeMoneyAwarded
      totalGauntletFeesCollected
      currentGauntletQueueSize
      currentGauntletEntryFee
      currentGauntletSize
      currentGauntletFeePercentage
      currentMinTimeBetweenGauntlets
    }
  }
`;

export const GET_GAME_OWNED_SKIN_COLLECTION = gql`
  query GetGameOwnedSkinCollection($skinType: Int!) {
    skinCollections(
      where: { skinType: $skinType, isVerified: true }
      first: 1
      orderBy: registryId
      orderDirection: asc
    ) {
      registryId
      contractAddress
      skinType
      requiredNFTAddress
      skins(first: 1) {
        id
        tokenId
        metadataURI
        weapon
        armor
      }
    }
  }
`;

export const GET_ALL_OPEN_CHALLENGES = gql`
  query GetAllOpenChallenges($limit: Int!, $skip: Int!) {
    duelChallenges(
      orderBy: createdAt,
      orderDirection: desc,
      where: { state: OPEN },
      first: $limit,
      skip: $skip
    ) {
      ...ChallengeCompleteFields
    }
  }
  ${CHALLENGE_COMPLETE_FRAGMENT}
`;

export const GET_FIGHTER_CHALLENGES_PAGINATED = `
  query GetFighterChallenges($fighterId: ID!, $limit: Int!, $skip: Int!) {
    sentChallenges: duelChallenges(
      orderBy: createdAt,
      orderDirection: desc,
      first: $limit,
      skip: $skip,
      where: {
        state: OPEN,
        challengerId: $fighterId
      }
    ) {
      ...ChallengeCompleteFields
    }
    
    receivedChallenges: duelChallenges(
      orderBy: createdAt,
      orderDirection: desc,
      first: $limit,
      skip: $skip,
      where: {
        state: OPEN,
        defenderId: $fighterId
      }
    ) {
      ...ChallengeCompleteFields
    }
  }
  ${CHALLENGE_COMPLETE_FRAGMENT}
`;

export const GET_USER_CHALLENGES_PAGINATED = `
  query GetUserChallenges($userAddress: String!, $limit: Int!, $skip: Int!) {
    sentChallenges: duelChallenges(
      orderBy: createdAt,
      orderDirection: desc,
      first: $limit,
      skip: $skip,
      where: {
        state: OPEN,
        challengerOwner: $userAddress
      }
    ) {
      ...ChallengeCompleteFields
    }
    
    receivedChallenges: duelChallenges(
      orderBy: createdAt,
      orderDirection: desc,
      first: $limit,
      skip: $skip,
      where: {
        state: OPEN,
        defenderOwner: $userAddress
      }
    ) {
      ...ChallengeCompleteFields
    }
  }
  ${CHALLENGE_COMPLETE_FRAGMENT}
`;

// Fighter snapshot fragment needed for challenge display
export const CHALLENGE_FIGHTER_SNAPSHOT_FRAGMENT = gql`
  fragment ChallengeFighterSnapshotFields on PlayerSnapshot {
     id
     # No need for full PlayerDataFields, just name and maybe ID
     fullName
  }
`;

export const GET_OPEN_CHALLENGES = gql`
  query GetOpenChallenges($limit: Int!, $skip: Int!) {
    duelChallenges(
      first: $limit,
      skip: $skip,
      orderBy: createdAt,
      orderDirection: desc,
      where: {
        state: OPEN
      }
    ) {
      id
      wagerAmount
      createdAt # Timestamp for sorting and display
      challengerSnapshot {
       ...ChallengeFighterSnapshotFields
      }
      defenderSnapshot {
       ...ChallengeFighterSnapshotFields
      }
    }
  }
  ${CHALLENGE_FIGHTER_SNAPSHOT_FRAGMENT}
`;

// Query for expired challenges (older than 7 days but less than 3 months)
export const GET_EXPIRED_CHALLENGES = gql`
  query GetExpiredChallenges($limit: Int!, $skip: Int!, $maxTimestamp: BigInt!, $minTimestamp: BigInt!) {
    duelChallenges(
      first: $limit,
      skip: $skip,
      orderBy: createdAt,
      orderDirection: desc,
      where: {
        state: OPEN,
        createdAt_lt: $maxTimestamp, # Filter for challenges created < 7 days ago
        createdAt_gt: $minTimestamp # Filter for challenges created > 3 months ago
      }
    ) {
      id
      wagerAmount
      createdAt
      challengerSnapshot {
       ...ChallengeFighterSnapshotFields
      }
      defenderSnapshot {
       ...ChallengeFighterSnapshotFields
      }
    }
  }
  ${CHALLENGE_FIGHTER_SNAPSHOT_FRAGMENT}
`;

// New query for leaderboard data
export const GET_LEADERBOARD_PLAYERS = gql`
  query GetLeaderboardPlayers($limit: Int = 100, $skip: Int = 0) {
    players(
      first: $limit, 
      skip: $skip, 
      where: { isRetired: false }, 
      orderBy: battleRating, 
      orderDirection: desc
      # Secondary sort by wins requires handling post-fetch or a more complex GQL setup if supported
      # For now, primary sort by battleRating. We can add wins sort in the frontend hook.
    ) {
      ...PlayerDataFields
    }
  }
  ${PLAYER_DATA_FRAGMENT}
`;

// Fragment for Gauntlet fields based on the provided Gauntlet entity schema
export const ARCHIVED_GAUNTLET_FIELDS_FRAGMENT = gql`
  fragment ArchivedGauntletFields on Gauntlet {
    id
    size
    entryFee
    state # GauntletState! (PENDING, COMPLETED)
    vrfRequestTimestamp # BigInt!
    completionTimestamp # BigInt
    champion { # Fighter
      id # Fighter's entity ID
      fighterId # Fighter's numerical ID
      fullName
    }
    prizeAwarded # BigInt!
    feeCollected # BigInt!
    startedAt # BigInt!
    startedTx # Bytes!
    completedAt # BigInt
    completedTx # Bytes
    finalParticipantIds # [String!]
    roundWinners # [String!]
    # Fields NOT on Gauntlet entity (will be handled in processing or removed from types):
    # - gauntletNumericId (derived from id)
    # - isPublic (does not exist)
  }
`;

// Query for fetching all recent gauntlets, paginated
export const GET_ARCHIVED_GAUNTLETS_PAGINATED = gql`
  query GetArchivedGauntletsPaginated(
    $limit: Int!
    $skip: Int!
  ) {
    gauntlets(
      first: $limit
      skip: $skip
      orderBy: startedAt
      orderDirection: desc
    ) {
      ...ArchivedGauntletFields
    }
  }
  ${ARCHIVED_GAUNTLET_FIELDS_FRAGMENT}
`;

export const GET_PLAYER_GAUNTLETS_PAGINATED = gql`
  query GetPlayerGauntletsPaginated(
    $playerId: String!
    $limit: Int!
    $skip: Int!
  ) {
    gauntletParticipants(
      first: $limit
      skip: $skip
      where: { player: $playerId }
      orderBy: id
      orderDirection: desc
    ) {
      id # GauntletParticipant ID
      gauntlet {
        id # Gauntlet ID
        size
        entryFee
        state
        vrfRequestTimestamp
        completionTimestamp
        champion {
          id
          fighterId
          fullName
          # Add other Fighter fields if needed for display
        }
        prizeAwarded
        feeCollected
        startedAt
        startedTx
        completedAt
        completedTx
        finalParticipantIds
        roundWinners
      }
      player { # To confirm, though primary filter is on this
        id
        fighterId
      }
      # skin used by player in this gauntlet if needed
      # stance used by player in this gauntlet if needed
    }
  }
`;

export const GET_QUEUED_GAUNTLET_PLAYERS = gql`
  query GetQueuedGauntletPlayers {
    players(where: { gauntletStatus: QUEUED, isRetired: false }) {
      ...FighterCompleteFields
    }
  }
  ${FIGHTER_COMPLETE_FRAGMENT}
`;

// Enhanced query for challenger selection with server-side filtering
export const SEARCH_ACTIVE_PLAYERS = gql`
  query SearchActivePlayers(
    $first: Int = 50
    $skip: Int = 0
    $where: Fighter_filter
  ) {
    players(
      where: $where
      first: $first
      skip: $skip
      orderBy: battleRating
      orderDirection: desc
    ) {
      ...FighterCompleteFields
    }
  }
  ${FIGHTER_COMPLETE_FRAGMENT}
`;

// Alternative ID-based search for manual ID input
export const SEARCH_PLAYERS_BY_ID = gql`
  query SearchPlayersByID($playerIds: [String!]!) {
    players(where: { id_in: $playerIds, isRetired: false }) {
      ...FighterCompleteFields
    }
  }
  ${FIGHTER_COMPLETE_FRAGMENT}
`;

// NEW: Skin + Stance Analytics Queries

export const GET_COMBAT_RESULTS_WITH_LOADOUTS = gql`
  query getCombatResultsWithLoadouts($limit: Int!, $skip: Int = 0) {
    combatResults(
      first: $limit, 
      skip: $skip,
      orderBy: blockTimestamp, 
      orderDirection: desc
    ) {
      id
      winningPlayerId
      blockTimestamp
      
      # Player 1 historical loadout
      player1SkinCollectionId
      player1SkinTokenId
      player1Stance
      player1Skin {
        id
        metadataURI
        weapon
        armor
      }
      
      # Player 2 historical loadout  
      player2SkinCollectionId
      player2SkinTokenId
      player2Stance
      player2Skin {
        id
        metadataURI
        weapon
        armor
      }
      
      # Combat stats for analytics
      player1Won
      player1TotalDamage
      player1Hits
      player1Misses
      player2TotalDamage
      player2Hits
      player2Misses
      
      # Player data for ID extraction
      player1Data
      player2Data
    }
  }
`;

export const GET_PLAYER_VS_RECORDS = gql`
  query getPlayerVsRecords($playerId: String!) {
    playerVsRecords(where: { 
      or: [
        { player1: $playerId },
        { player2: $playerId }
      ]
    }) {
      id
      player1
      player2
      player1WinsAgainst2
      player2WinsAgainst1
      firstPlayer1Win
      firstPlayer2Win
      player1TotalWinsAgainst2
      player2TotalWinsAgainst1
      totalMatchups
      lastMatchup
    }
  }
`;

export const GET_SKIN_COMBAT_HISTORY = gql`
  query getSkinCombatHistory($skinCollectionId: BigInt!, $skinTokenId: Int!, $limit: Int = 1000) {
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
      },
      first: $limit,
      orderBy: blockTimestamp,
      orderDirection: desc
    ) {
      player1Won
      player1SkinCollectionId
      player1SkinTokenId
      player1Stance
      player1TotalDamage
      player2SkinCollectionId
      player2SkinTokenId
      player2Stance
      player2TotalDamage
      winningPlayerId
      blockTimestamp
      player1Data
      player2Data
    }
  }
`;

export const GET_SKIN_STANCE_COMBAT_HISTORY = gql`
  query getSkinStanceCombatHistory(
    $skinCollectionId: BigInt!, 
    $skinTokenId: Int!, 
    $stance: Int!,
    $limit: Int = 1000
  ) {
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
      first: $limit,
      orderBy: blockTimestamp,
      orderDirection: desc
    ) {
      player1Won
      player1SkinCollectionId
      player1SkinTokenId
      player1Stance
      player1TotalDamage
      player2SkinCollectionId
      player2SkinTokenId
      player2Stance
      player2TotalDamage
      winningPlayerId
      blockTimestamp
      player1Data
      player2Data
    }
  }
`;

// NEW: Enhanced skin analytics queries using SkinCombatStat entity
export const GET_SKIN_COMBAT_ANALYTICS = `
  query getSkinCombatAnalytics($minCombats: Int!) {
    skinCombatStats(
      where: { totalCombats_gte: $minCombats }
      orderBy: winRate
      orderDirection: desc
      first: 100
    ) {
      id
      skin {
        id
        metadataURI
        weapon
        armor
      }
      skinCollectionId
      skinTokenId
      stance
      
      # Combat counts
      totalCombats
      wins
      losses
      
      # Kill/Death tracking
      kills
      deaths
      knockouts
      knockedOut
      exhaustions
      exhausted
      maxRoundWins
      maxRoundLosses
      
      # Calculated rates
      killRate
      deathRate
      killDeathRatio
      winRate
      
      # Offensive metrics
      totalDamageDealt
      averageDamageDealt
      maxDamageDealt
      
      # Defensive metrics
      totalDamageTaken
      averageDamageTaken
      totalHealthLost
      averageHealthLost
      minDamageTaken
      
      # Efficiency metrics
      damageEfficiency
      survivalRate
      
      # Timestamps
      firstCombat
      lastCombat
      lastUpdated
    }
  }
`;

// Highest Kill Rate (Most Lethal Combinations)
export const GET_HIGHEST_KILL_RATE = `
  query getHighestKillRate($minCombats: Int!) {
    skinCombatStats(
      where: { totalCombats_gte: $minCombats }
      orderBy: killRate
      orderDirection: desc
      first: 50
    ) {
      id
      skin {
        id
        metadataURI
        weapon
        armor
      }
      skinCollectionId
      skinTokenId
      stance
      totalCombats
      kills
      killRate
      killDeathRatio
      winRate
      averageDamageDealt
      survivalRate
    }
  }
`;

// Best Kill/Death Ratios
export const GET_BEST_KILL_DEATH_RATIOS = `
  query getBestKillDeathRatios($minCombats: Int!) {
    skinCombatStats(
      where: { 
        totalCombats_gte: $minCombats
        deaths_gt: 0
      }
      orderBy: killDeathRatio
      orderDirection: desc
      first: 50
    ) {
      id
      skin {
        id
        metadataURI
        weapon
        armor
      }
      skinCollectionId
      skinTokenId
      stance
      kills
      deaths
      killDeathRatio
      killRate
      deathRate
      totalCombats
      winRate
    }
  }
`;

// Best Survival Rate (Hardest to Kill)
export const GET_BEST_SURVIVAL_RATE = `
  query getBestSurvivalRate($minCombats: Int!) {
    skinCombatStats(
      where: { totalCombats_gte: $minCombats }
      orderBy: survivalRate
      orderDirection: desc
      first: 50
    ) {
      id
      skin {
        id
        metadataURI
        weapon
        armor
      }
      skinCollectionId
      skinTokenId
      stance
      totalCombats
      deaths
      survivalRate
      deathRate
      averageDamageTaken
      minDamageTaken
      damageEfficiency
    }
  }
`;

// Best Defense (Lowest Average Damage Taken)
export const GET_BEST_DEFENSE = `
  query getBestDefense($minCombats: Int!) {
    skinCombatStats(
      where: { totalCombats_gte: $minCombats }
      orderBy: averageDamageTaken
      orderDirection: asc
      first: 50
    ) {
      id
      skin {
        id
        metadataURI
        weapon
        armor
      }
      skinCollectionId
      skinTokenId
      stance
      averageDamageTaken
      minDamageTaken
      totalDamageTaken
      survivalRate
      damageEfficiency
      totalCombats
      winRate
    }
  }
`;

// Best Damage Efficiency
export const GET_BEST_DAMAGE_EFFICIENCY = `
  query getBestDamageEfficiency($minCombats: Int!) {
    skinCombatStats(
      where: { 
        totalCombats_gte: $minCombats
        totalDamageTaken_gt: 0
      }
      orderBy: damageEfficiency
      orderDirection: desc
      first: 50
    ) {
      id
      skin {
        id
        metadataURI
        weapon
        armor
      }
      skinCollectionId
      skinTokenId
      stance
      damageEfficiency
      totalDamageDealt
      totalDamageTaken
      averageDamageDealt
      averageDamageTaken
      totalCombats
      winRate
      killRate
      survivalRate
    }
  }
`;

// Win Condition Analysis
export const GET_WIN_CONDITION_ANALYSIS = `
  query getWinConditionAnalysis($minCombats: Int!) {
    skinCombatStats(
      where: { totalCombats_gte: $minCombats }
      orderBy: totalCombats
      orderDirection: desc
      first: 100
    ) {
      id
      skin {
        id
        metadataURI
        weapon
        armor
      }
      skinCollectionId
      skinTokenId
      stance
      totalCombats
      wins
      
      # Win condition breakdown
      kills
      knockouts
      exhaustions
      maxRoundWins
      
      # Loss condition breakdown  
      deaths
      knockedOut
      exhausted
      maxRoundLosses
      
      # Calculated rates
      killRate
      winRate
      survivalRate
      damageEfficiency
    }
  }
`;
