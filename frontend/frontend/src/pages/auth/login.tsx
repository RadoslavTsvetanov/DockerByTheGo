import { pageProps } from "../_app"



const Login: React.FC<pageProps> = ({ ctx }) => {
    return (
        <div>
            <h1>Login Page</h1>
            <button onClick={() => ctx.setLoading(true)}>Login</button>
        </div>
    )
}


export default Login