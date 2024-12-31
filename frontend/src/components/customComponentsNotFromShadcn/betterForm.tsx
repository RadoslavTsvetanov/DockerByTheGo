import { Children, FormEvent, ReactNode } from "react"

export const BetterForm: React.FC<{
    onFormSubmitted: (e: FormEvent<HTMLFormElement>) => void,
    children: ReactNode // by deafult this is the element inside <component>{.......}</component>
}> = ({ onFormSubmitted, children }) => {
    return (
        <form onSubmit={(event) => {
            event.preventDefault()
            onFormSubmitted(event)
        }}>
            {children}
        </form>
    )
}

// Example usage to see how to utilize the latest component better
// <BetterForm>
//     <input type="text" name="username" placeholder="Username" />
//     <input type="password" name="password" placeholder="Password" />
//     <button type="submit">Submit</button>
// </BetterForm>