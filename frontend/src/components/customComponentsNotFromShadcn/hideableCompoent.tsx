import { ReactNode, useState } from "react"
import { BetterForm } from "./betterForm"
// might be a bit too much overengineering 
export const Hideable: React.FC<{isHidden: boolean, children: ReactNode}> =  ({isHidden, children}) => {
    return (
        <div>
            {!isHidden &&
                <>
                    {children}
                </>
            }
        </div>
    )
}

export const PopUpFormWrapper: React.FC<{  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, isHidden: boolean, children: React.ReactNode }> = ({ children, onSubmit, isHidden }) => {
    
    return (
        <div>
            <Hideable isHidden={isHidden}>
                <BetterForm onFormSubmitted={(e) => {
                    onSubmit(e)
                }}>
                    {children}
                </BetterForm>
            </Hideable >
        </div>
    )
}