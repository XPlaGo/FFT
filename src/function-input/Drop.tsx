import drop_down_svg from "../assets/drop-down.svg";
import "./drop.css";
import {useState} from "react";

type DropProps = {
    selected: number,
    setSelected: (alt: number) => void,
    list: Array<{name: string, alt: number}>
}

export default function Drop(props: DropProps) {
    const [isOpened, setOpened] = useState<boolean>(false);
    return (
        <div className={"dropBox"}>
            <p className={"dropValue"}>
                {props.list.filter((item) => item.alt == props.selected)[0].name}
            </p>
            <button onClick={() => setOpened(!isOpened)}><img style={{transform: isOpened ? "rotate(180deg)" : "rotate(0)"}} src={drop_down_svg}/></button>
            {isOpened &&
                <ul className={"dropList"}>
                    {props.list.map((item) => <span className={props.selected == item.alt ? "selected" : ""} onClick={() => {
                        props.setSelected(item.alt);
                        setOpened(false);
                    }}>{item.name}</span>)}
                </ul>
            }
        </div>
    )
}