
export interface client {
  id: number;
  documentId: string;
}
 
import type { StaticImageData } from "next/image"

export interface OutletType {
  id: number
  outlet: string
  icon: StaticImageData
  adSets: AdSet[]
  formats: Format[]
}

export interface AdSet {
  id: any
  name: string
  audience_type: string
  size: string
  format: any[]
}

export interface Format {
  format_type: string
  num_of_visuals: string
  previews?: Preview[]
}

export interface Preview {
  url: string
}
