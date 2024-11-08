import axios, { AxiosResponse } from "axios"
import { randomUUID } from "crypto"
import { ENV } from "~/env"

type ApiRequest<BodyType,ParamsType> = {

    body?: BodyType
    method: "GET" | "POST" | "PUT" | "DELETE", // better than enums in this example 
    params?: ParamsType
    path: string // example paths, if you want to send request to http://localhost:4000/api/huh you send just api/huh, note that the first / is skipped since it appers in the base request, see line 15
    headers: Record<string, string>
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function getAuthToken() {
    // Implement logic to get token from your backend
    return "your_token_here"
}

async function baseSendRequest<B,P,ResponseType>(request: ApiRequest<B,P>)  {

    let numbersOfRetires = 0;

    while (true) {
        
        if (numbersOfRetires > 5) {
            throw new Error("Failed to send request after 5 attempts")
        }

        try {

            const res = await axios<ResponseType>({
                method: request.method,
                url: `${ENV.getUrl()}/${request.path}`,
                data: request.body,
                params: request.params,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getAuthToken()}`,
                    "request_id": randomUUID(),     // to identify requests in the baxckend so that retrying requests remain idempotent
                    ...request.headers,
                }
            })
            return res

        } catch (error) {
            numbersOfRetires++;
        }

        const one_sec_in_ms = 1000;
        await sleep(one_sec_in_ms * numbersOfRetires)

    }
}



//example request
/*


const res = await baseSendRequest<{ exampleFiled: number }, { exampl: string }, {prize: string}>({
    body: { exampleFiled: 1 },
    path: "example",
    params: { exampl: "hui" },
    method: "POST",
    headers: {
    }
})

res.data.prize

*/

