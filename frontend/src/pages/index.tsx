import { useEffect, useState } from "react";
import { PopUpFormWrapper } from "~/components/customComponentsNotFromShadcn/hideableCompoent";
import { cookies } from "~/utils/cookie_interacter";
import { pageProps } from "./_app";

const Home: React.FC<pageProps> = ({ ctx }) => {
  const [isBackendUrlSet, setIsBackendUrlSet] = useState(false);
  const [inputForBackendUrl, setInputForBackendUrl] = useState("");
  const [onlyForTriggeringArerender, setOnlyForTriggeringArerender] = useState(false);
  const [token, setToken] = useState("");
  const [newToken, setNewToken] = useState("");

  function hasBeenUrlSet() {
    return cookies.backendUrl.get() !== null;
  }

  useEffect(() => {
    if (hasBeenUrlSet()) {
      setIsBackendUrlSet(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <PopUpFormWrapper
          onSubmit={() => { setOnlyForTriggeringArerender(true); }}
          isHidden={isBackendUrlSet}
        >
          <div className="flex flex-col gap-4">
            <label htmlFor="backendUrl" className="text-gray-700 font-semibold">Enter Backend URL</label>
            <input
              id="backendUrl"
              type="text"
              className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setInputForBackendUrl(e.target.value)}
              value={inputForBackendUrl}
            />
            <button
              onClick={() => { cookies.backendUrl.set(inputForBackendUrl); setIsBackendUrlSet(true); }}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Done
            </button>
          </div>
        </PopUpFormWrapper>

        <div className="mt-6">
          <div className="text-lg font-medium text-gray-700 mb-2">Your Token:</div>
          <div className="px-4 py-2 border rounded-md text-gray-600">{token}</div>
        </div>

        <div className="mt-4">
          <button
            onClick={async () => {
              const res = await ctx.api.getK8sToken(cookies.username.get()!);
              if (res.k8sToken) {
                setToken(res.k8sToken);
              }
            }}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
          >
            Get Token
          </button>
        </div>

        <div className="mt-6">
          <label htmlFor="newToken" className="text-gray-700 font-semibold">New Token</label>
          <input
            id="newToken"
            name="newToken"
            value={newToken}
            placeholder="Enter new token"
            onChange={(e) => { setNewToken(e.target.value); }}
            className="mt-2 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <div className="mt-4">
          <button
            onClick={async () => {
              await ctx.api.setK8sToken(ctx.cookies.username.get()!, newToken);
              window.location.href = window.location.href; // reload page 
            }}
            className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none"
          >
            Update Token
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
