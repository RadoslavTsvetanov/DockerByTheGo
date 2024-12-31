/*

@RadoslavTsvetanov

@param destionation -> it is a subroute, for example we pass /auth/login and not http://localhost:8080/auth/login
*/
export function redirectTo(destination: string) {
    window.location.href = `${window.location.protocol}//${window.location.host}${destination}`
}