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
      stance
    }
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
      stance
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
      stance
    }
    
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
    fighterType
    firstName
    surname
    fullName
  }
`;

export const CHALLENGE_COMPLETE_FRAGMENT = gql`
  fragment ChallengeCompleteFields on DuelChallenge {
    ...ChallengeBaseFields
    challenger {
      ...ChallengeFighterFields
    }
    defender {
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

// Add this new query to your gql-queries.ts file
export const GET_FIGHTER_CHALLENGES = gql`
  query GetFighterChallenges($fighterId: ID!) {
    sentChallenges: duelChallenges(
      where: {
        state: OPEN,
        challenger_: { id: $fighterId }
      }
    ) {
      ...ChallengeCompleteFields
    }
    
    receivedChallenges: duelChallenges(
      where: {
        state: OPEN,
        defender_: { id: $fighterId }
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
      activePlayers(where: {isRetired: false}) {
        ...FighterCompleteFields
      }
    }
  }
  ${FIGHTER_COMPLETE_FRAGMENT}
`;
