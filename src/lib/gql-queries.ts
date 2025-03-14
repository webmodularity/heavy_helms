import { gql } from 'graphql-request';

export const GET_OWNED_PLAYERS_QUERY = gql`
  query GetOwnedPlayers($owner: String!) {
    owners(where: {address: $owner}) {
      address
      totalPlayers
      activePlayers(where: {isRetired: false}) {
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
      }
    }
  }
`;