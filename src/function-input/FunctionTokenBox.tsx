import Drop from "./Drop";
import {Token, TokenType} from "./FunctionInputSection";

type FunctionTokenBoxProps = {
    tokenData: {
        id: string,
        accepted: boolean,
        type: TokenType,
        name: string,
        value: string
    }
    setTokenData: (data: Token) => void
    deleteToken: (id: string) => void
}

const list = [
    {name: "Function", alt: 0},
    {name: "Variable", alt: 3},
]

export default function FunctionTokenBox(props: FunctionTokenBoxProps) {
    return (
        <div className={"functionTokenBox"}>
            <span className={"nameTitle"}>name:</span>
            <input value={props.tokenData.name} className={"nameInput"} onChange={(event) => {
                props.setTokenData({
                    id: props.tokenData.id,
                    accepted: props.tokenData.accepted,
                    type: props.tokenData.type,
                    name: event.target.value,
                    value: props.tokenData.value
                })
            }} type="text"/>
            <Drop selected={props.tokenData.type} setSelected={(value) => {
                props.setTokenData({
                    id: props.tokenData.id,
                    accepted: props.tokenData.accepted,
                    type: value,
                    name: props.tokenData.name,
                    value: props.tokenData.value
                })
            }
            } list={list}/>
            {
                props.tokenData.type == 0 ?
                    <div className={"tokenFunctionInput"}>
                        <span>function(t) {"{"}</span>
                        <textarea value={props.tokenData.value} onChange={(e) => {
                            props.setTokenData({
                                id: props.tokenData.id,
                                accepted: props.tokenData.accepted,
                                type: props.tokenData.type,
                                name: props.tokenData.name,
                                value: e.target.value
                            })
                        }}/>
                        <span>{"}"}</span>
                    </div>
                : props.tokenData.type == 3 ?
                    <div className={"tokenVarInput"}>
                        <span>value:</span>
                        <input value={props.tokenData.value} onChange={(e) => {
                            props.setTokenData({
                                id: props.tokenData.id,
                                accepted: props.tokenData.accepted,
                                type: props.tokenData.type,
                                name: props.tokenData.name,
                                value: e.target.value
                            })
                        }}/>
                    </div>
                : <></>
            }
            <div className={"buttonBox"}>
                <button onClick={() => {
                    props.setTokenData({
                        id: props.tokenData.id,
                        accepted: !props.tokenData.accepted,
                        type: props.tokenData.type,
                        name: props.tokenData.name,
                        value: props.tokenData.value
                    })
                }} className={(props.tokenData.accepted ? "deleteButton" : "acceptButton")}>{props.tokenData.accepted ? "Revoke" : "Accept"}</button>
                <button onClick={() => props.deleteToken(props.tokenData.id)} className={"deleteButton"}>Delete</button>
            </div>
        </div>
    )
}