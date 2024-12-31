import { cookies } from "./cookie_interacter"

const object = {
    getBackendUrl: () => {
        return cookies.backendUrl.get()
    },
    setBackendUrl: (newVal: string) => { 
        cookies.backendUrl.set(newVal)
    }
}