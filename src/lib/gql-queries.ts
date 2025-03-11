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
        strength
        constitution
        size
        agility
        stamina
        luck
        wins
        losses
        kills
        currentSkin {
          metadataURI
          weapon
          armor
          stance
        }
      }
    }
  }
`;