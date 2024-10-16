// this component is used when we don`t want to display loading on the whole page and instead just a single component 

import React from "react";


export const MiniLoading: React.FC = () => {
    return (
        <div className="text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    )
}