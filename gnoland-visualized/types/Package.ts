export interface Package {
  Dir: string
  Name: string
  Imports: string[]
  Draft: boolean
  Creator: string
  Imported: string[]
  Contributors: Contributor[]
}

export interface Contributor {
  Name: string
  Email: string
  LOC: number
  Percentage: number
}

