import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Helper function to convert IPFS URLs to HTTPS gateway URLs
export function ipfsToHttps(url: string): string {
  if (!url) return '';
  
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  
  if (url.startsWith('Qm') || url.startsWith('bafy')) {
    return `https://ipfs.io/ipfs/${url}`;
  }
  
  return url;
}
