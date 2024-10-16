import { Response } from "express"

export const helpers = {
    Requests: {
        async succesfulReq( res: Response, dataToBeSentToClient /* might be a bit too exhausting name*/: object) {
            return res.status(200).json({ data: dataToBeSentToClient, something_else_for_the_future: "kook" }) 
        }
    }
}