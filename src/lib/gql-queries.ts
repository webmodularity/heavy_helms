import { gql } from "graphql-request";

export const PLAYER_DATA_FRAGMENT = gql`
  fragment PlayerDataFields on Player {
    id
    firstName
    surname
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
    isRetired
    isImmortal
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
  }
`;

// Fragment for Player-specific fields
export const PLAYER_SPECIFIC_FRAGMENT = gql`
  fragment PlayerSpecificFields on Player {
    isImmortal
    owner {
      address
    }
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
  query GetActivePlayers {
    players(where: { isRetired: false }) {
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
  query GetCombatResult($txHash: ID!) {
    combatResult(id: $txHash) {
      id
      player1Data
      player2Data
      winningPlayerId
      packedResults
      blockTimestamp
    }
  }
`;

// Query to fetch names by their indices
export const GET_NAMES_BY_INDICES = gql`
  query GetNamesByIndices($firstNameIndex: Int!, $surnameIndex: Int!) {
    firstNameResult: names(where: {index: $firstNameIndex, nameType: 0}) {
      value
    }
    surnameResult: names(where: {index: $surnameIndex, nameType: 2}) {
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

// Query for a specific player's duels
export const GET_PLAYER_DUELS = gql`
  query GetPlayerDuels($limit: Int = 10, $skip: Int!, $playerId: ID!) {
    duelCompletes(
      first: $limit,
      skip: $skip,
      orderBy: blockNumber, 
      orderDirection: desc,
      where: {
        or: [
          { challenge_: { challengerId: $playerId } },
          { challenge_: { defenderId: $playerId } }
        ]
      }
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
          fullName
        }
        defenderSnapshot {
          id
          fullName
        }
      }
    }
  }
`;

// Query for all duels (without filtering)
export const GET_ALL_DUELS = gql`
  query GetAllDuels($limit: Int = 1, $skip: Int!) {
    duelCompletes(
      first: $limit, 
      skip: $skip,
      orderBy: blockNumber, 
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
        challenger {
          id
          fullName
        }
        defender {
          id
          fullName
        }
        winner {
          id
          fullName
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
