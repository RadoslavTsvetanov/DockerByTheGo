export const ButtonWithShortcut: React.FC<{ ButtonToDisplayShortcutFor :React.ComponentType, shortcut: string }> = ({ ButtonToDisplayShortcutFor, shortcut }) => {
    return (
        <div className="flex flex-auto">
            <ButtonToDisplayShortcutFor />
            <div className="ml-2 text-xs text-gray-400">{shortcut}</div>
        </div>
    )
}