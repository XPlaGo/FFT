import { appWindow} from "@tauri-apps/api/window";
import hide from "../assets/minus.svg";
import min from "../assets/minimize.svg";
import max from "../assets/maximize.svg";
import close from "../assets/x.svg";
import {useState} from "react";


type TitlebarProps = {

}

export default function Titlebar(props: TitlebarProps) {
    const [isMax, setIsMax] = useState<boolean>(false);
    appWindow.isMaximized().then(is => {
        console.log("update");
        setIsMax(is);
    })

    appWindow.onResized(_ => {
        appWindow.isMaximized().then(is => {
            console.log("update");
            setIsMax(is);
        })
    });
    appWindow.onScaleChanged(_ => {
        appWindow.isMaximized().then(is => {
            console.log("update");
            setIsMax(is);
        })
    })
    return (
            <div data-tauri-drag-region className={"titlebar"}>
                <span>FFT</span>
                <ul>
                    <button onClick={() => appWindow.minimize()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="rgba(200, 200, 255, 0.5)" stroke-width="2" stroke-linecap="round"
                             stroke-linejoin="round" className="feather feather-minus">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                    <button onClick={() => appWindow.toggleMaximize()}>
                        {
                            !isMax ?
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none" stroke="rgba(200, 200, 255, 0.5)" stroke-width="2"
                                     stroke-linecap="round" stroke-linejoin="round"
                                     className="feather feather-maximize-2">
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <polyline points="9 21 3 21 3 15"></polyline>
                                    <line x1="21" y1="3" x2="14" y2="10"></line>
                                    <line x1="3" y1="21" x2="10" y2="14"></line>
                                </svg> :
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none" stroke="rgba(200, 200, 255, 0.5)" stroke-width="2"
                                     stroke-linecap="round" stroke-linejoin="round"
                                     className="feather feather-minimize-2">
                                    <polyline points="4 14 10 14 10 20"></polyline>
                                    <polyline points="20 10 14 10 14 4"></polyline>
                                    <line x1="14" y1="10" x2="21" y2="3"></line>
                                    <line x1="3" y1="21" x2="10" y2="14"></line>
                                </svg>
                        }
                    </button>
                    <button onClick={() => appWindow.close()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="rgba(200, 200, 255, 0.5)" stroke-width="2" stroke-linecap="round"
                             stroke-linejoin="round" className="feather feather-x">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </ul>
            </div>
    )
}