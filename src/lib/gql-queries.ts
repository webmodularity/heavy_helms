import { gql } from 'graphql-request';

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

export const GET_OWNED_PLAYERS_QUERY = gql`
  query GetOwnedPlayers($owner: String!) {
    owners(where: {address: $owner}) {
      address
      totalPlayers
      activePlayers(where: {isRetired: false}) {
        ...PlayerDataFields
      }
    }
  }
  ${PLAYER_DATA_FRAGMENT}
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
