import { useEffect, useState } from "react";
import { PopUpFormWrapper } from "~/components/customComponentsNotFromShadcn/hideableCompoent";
import { cookies } from "~/utils/cookie_interacter";

export default function Home() {
  const [isBackendUrlSet, setIsBackendUrlSet] = useState(false)
  const [inputForBackendUrl, setInputForBackendUrl] = useState("")
  const [onlyForTriggeringArerender, setOnlyForTriggeringArerender] = useState(false)

  function hasBeenUrlSet() {
  return cookies.backendUrl.get() !== null
  }

  useEffect(() => {
    if (hasBeenUrlSet()) {
      setIsBackendUrlSet(true)
    }
  

  }, [])

    

  return (
    <>
    <div>
      <PopUpFormWrapper onSubmit={() => {setOnlyForTriggeringArerender(true)}} isHidden={isBackendUrlSet}>
        <input type="text" onChange={(e) => setInputForBackendUrl(e.target.value)} value={inputForBackendUrl}/>
          <button
            onClick={() => { cookies.backendUrl.set(inputForBackendUrl); setIsBackendUrlSet(true) }
          }>
            Done
          </button>
        </PopUpFormWrapper>
    </div>
    </>
  );
}
