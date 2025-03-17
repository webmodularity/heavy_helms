import type { WeaponType, ArmorType, StanceType } from "./equipment.types";

export interface Skin {
  collection: SkinCollection;
  tokenId: number;
  metadataURL: string;
  imageURL: string;
  spritesheet: Spritesheet;
  weapon: WeaponType;
  armor: ArmorType;
  stance: StanceType;
}

export interface SkinInfo {
  skinIndex: number;
  skinTokenId: number;
}

export interface SkinCollection {
  id: string;
  contractAddress: string;
  isVerified: boolean;
  skinType: SkinType;
  requiredNFTAddress?: string;
}

export interface SkinResponse extends Omit<Skin, "metadataURL" | "collection" | "spritesheet"> {
  id: string;
  metadataURI:string
}
export interface VerifiedSkinCollectionResponse extends Omit<SkinCollection, "isVerified"> {
  skins: Array<SkinResponse>;
  registryId: string;
}

export interface Spritesheet {
  image: string;
  fps: AnimationFPS;
  format: string;
  size: Size;
  scale: number;
  frames: SpriteFrame[];
}

export enum SkinType {
  Player = 0,
  DefaultPlayer = 1,
  Monster = 2,
}

interface AnimationFPS {
  idle: number;
  walking: number;
  running: number;
  attacking: number;
  blocking: number;
  dying: number;
  hurt: number;
  dodging: number;
  taunting: number;
}

interface Size {
  w: number;
  h: number;
}

interface SourceSize {
  w: number;
  h: number;
}

interface SpriteSourceSize {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Anchor {
  x: number;
  y: number;
}

interface SpriteFrame {
  filename: string;
  rotated: boolean;
  trimmed: boolean;
  sourceSize: SourceSize;
  spriteSourceSize: SpriteSourceSize;
  frame: FrameRect;
  anchor: Anchor;
}
