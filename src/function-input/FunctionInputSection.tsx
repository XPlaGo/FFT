import Plot from "react-plotly.js";
import Mexp from "math-expression-evaluator";
import {useState} from "react";
import FunctionTokenBox from "./FunctionTokenBox";
import { v4 as uuid } from 'uuid';

type FunctionInputSectionProps = {
    mexp: Mexp,
    setExpression: (expr: string) => void,
    setFromBound: (from: string) => void,
    setToBound: (to: string) => void,
    setStep: (step: string) => void,
    handleExprAccepted: (tokend: Array<Token>) => void,
    funcData: Array<number>,
    funcBase: Array<number>,
    isFuncError: boolean
}

export enum TokenType {
    Function = 0,
    Variable = 3
}

export type Token = {
    id: string,
    accepted: boolean,
    type: TokenType,
    name: string,
    value: string
}

export default function FunctionInputSection(props: FunctionInputSectionProps) {

    const [tokens, setTokens] = useState<Array<Token>>([]);

    return (
        <div className={"functionInputSection styledSection"}>
            <h2>Function parameters</h2>
            <div className={"rangeBox"}>
                <span className={"name"}>f(x)=</span>
                <input className={"input"} type="text" onChange={(e) => {
                    props.setExpression(e.target.value);
                }}/>
                <span className={"from"}>From:</span>
                <input placeholder={"-10"} className={"finput"} type="text" onChange={(e) => {
                    props.setFromBound(e.target.value);
                }}/>
                <span className={"to"}>To:</span>
                <input placeholder={"10"} className={"tinput"} type="text" onChange={(e) => {
                    props.setToBound(e.target.value);
                }}/>
                <span className={"step"}>Samples:</span>
                <input placeholder={"1024"} className={"sinput"} type="text" onChange={(e) => {
                    props.setStep(e.target.value);
                }}/>
            </div>
            <button className={"acceptButton"} onClick={() => props.handleExprAccepted(tokens)}>Apply</button>
            <div className={"additiveInfo"}>
                <div className={"tokensContainer"}>
                    <button
                        className={"addButton"}
                        onClick={() => {
                            setTokens([
                                {
                                    id: uuid(),
                                    accepted: false,
                                    name: "",
                                    type: TokenType.Variable,
                                    value: ""
                                },
                                ...tokens
                            ])
                        }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="rgba(200, 200, 255, 1)" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round" className="feather feather-plus">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                    <span className={"addTitle"}>Add token</span>
                    <ul>{
                        tokens.map((item) => {
                            return <FunctionTokenBox tokenData={item} setTokenData={(data) => {
                                let i = tokens.findIndex((item) => item.id == data.id);
                                setTokens([...tokens.slice(0, i), data, ...tokens.slice(i + 1, tokens.length)]);
                            }} deleteToken={(id) => {
                                let i = tokens.findIndex((item) => item.id == id);
                                setTokens([...tokens.slice(0, i), ...tokens.slice(i + 1, tokens.length)]);
                            }
                            }/>;
                        })
                    }</ul>
                </div>
                {props.isFuncError ? <span className={"error"}><div>Error</div></span> : <Plot
                    data={[
                        {
                            x: props.funcBase,
                            y: props.funcData,
                            type: 'scatter',
                            line: {
                                color: "#f7c186",
                                width: 2,
                            }
                        }
                    ]}
                    layout={ {
                        autosize: true,
                        showlegend: false,
                        width: 350,
                        margin: {
                            l: 0,
                            r: 0,
                            b: 0,
                            t: 0,
                            pad: 0
                        },
                        height: 360,
                        plot_bgcolor: "rgba(0, 0, 0, 0)",
                        paper_bgcolor: "rgba(0, 0, 0, 0)",
                        legend: {
                            font: {
                                color: "rgba(200, 200, 255, 0.5)"
                            }
                        },
                        yaxis: {
                            autorange: true,
                            color: "rgba(200, 200, 255, 0.2)",
                            linecolor: "rgba(200, 200, 255, 0.1)",
                            gridcolor: "rgba(200, 200, 255, 0.1)"
                        },
                        xaxis: {
                            autorange: true,
                            color: "rgba(200, 200, 255, 0.2)",
                            linecolor: "rgba(200, 200, 255, 0.1)",
                            gridcolor: "rgba(200, 200, 255, 0.1)"
                        }
                    } }
                    useResizeHandler={false}
                    config={{
                        //displayModeBar: false,
                        scrollZoom: true,
                        //responsive: true,
                    }}
                />}
            </div>
        </div>
    )
}