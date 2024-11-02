import { KeyCodes } from "./keycodes";

export enum Shortcuts {
    OpenProjectViewChat = `${KeyCodes.Control},2`,
    OpenProjectViewSettings = `${KeyCodes.Control},3`,
    OpenProjectViewTasks = `${KeyCodes.Control},4`,
}



export function getShortcutCombination( shortcut: Shortcuts): string[] {
    return shortcut.valueOf().toString().split(",")
}



// console.log(getShortcutCombination(Shortcuts.OpenProjectViewChat))