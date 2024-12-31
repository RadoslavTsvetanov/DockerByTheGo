import React from "react";
import {type Alert } from "~/types/alert";

export const Alertn: React.FC<{alert: Alert}> = ({alert}) => {
    return <div>
        <div>{alert.body}</div>
        <div>Channel: {alert.channelId}</div>
    </div>
}