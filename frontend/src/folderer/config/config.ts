
export type Config = {
    excludedFiles: string[] // to do make them to have regex suuport 
    excludedFolders: string[]
}


export const config: Config = {
    excludedFiles: [".bin",".gitignore","bun"],
    excludedFolders: ["node_modules",".*"]
}