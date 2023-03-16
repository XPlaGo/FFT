import {useEffect, useState} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow} from "@tauri-apps/api/window";
import { getName } from "@tauri-apps/api/app";
import Plot from 'react-plotly.js';
import "./App.css";
import "./main.css";
import Mexp from "math-expression-evaluator";
import FunctionInputSection, {Token} from "./function-input/FunctionInputSection";
import Titlebar from "./titlebar/Titlebar";
type fft_data = {function_data: Array<number>, fourier_transformed_data: Array<number>, result_data: Array<number>, fourier_transformed_freq: Array<number>}

function App() {

    const [expression, setExpression] = useState<string>("");
    const [funcData, setFuncData] = useState<Array<number>>([]);
    const [funcBase, setFuncBase] = useState<Array<number>>([]);
    const [funcFData, setFuncFData] = useState<Array<number>>([]);
    const [funcFBase, setFuncFBase] = useState<Array<number>>([]);
    const [funcNData, setFuncNData] = useState<Array<number>>([]);
    const [fromBound, setFromBound] = useState<number>(-10);
    const [toBound, setToBound] = useState<number>(10);
    const [step, setStep] = useState<number>(20 / 1024);
    const [isFFTLoading, setIsFFTLoading] = useState<boolean>(false);
    const [isFFTError, setFFTError] = useState<boolean>(false);
    const [isFuncError, setFuncError] = useState<boolean>(false);

    const approx = []
    for (let i = 0; i < funcData.length; i++) {
        approx.push(funcData[i] - funcNData[i]);
    }

    let mexp = new Mexp();
    mexp.math.isDegree = false;

    function if_fft_data(data: unknown): data is fft_data {
        return (data as fft_data)?.fourier_transformed_data !== undefined &&
                (data as fft_data)?.fourier_transformed_freq !== undefined &&
                (data as fft_data)?.function_data !== undefined &&
                (data as fft_data)?.result_data !== undefined;
    }

    const handleExprAccepted = (tokens: Array<Token>) => {
        let func = calcFunction(expression, fromBound, toBound, step, tokens);
        setFuncData(func.func_data);
        setFuncBase(func.func_base);
        invoke("fft_handle", {funcData: func.func_data, funcBase: func.func_base}).then((res: unknown) => {
            if (if_fft_data(res)) {
                setFuncFData(res.fourier_transformed_data);
                setFuncFBase(res.fourier_transformed_freq);
                setFuncNData(res.result_data);
                setIsFFTLoading(false);
            } else {
                alert("Error data");
                setFFTError(true);
                setIsFFTLoading(false);
            }
        }).catch(_ => {
            setFFTError(true);
            setIsFFTLoading(false);
        });
        setFFTError(false);
        setIsFFTLoading(true);
    }

    const calcFunction = (expression: string, from: number, to: number, delta: number, tokens: Array<Token>): {func_base: Array<number>, func_data: Array<number>} => {
        let func_data = [];
        let func_base = [];
        let constants: {
            [key: string]: any
        } = {};
        let tokensList: { type: number; show: string; token: string; value: string; precedence: number; }[] = [];
        try {
            tokens.forEach(token => {
                if (token.type == 3 && token.accepted) {
                    constants[token.name] = mexp.eval(token.value, [], {});
                    tokensList.push(
                        {
                            type: 3,
                            show: token.name,
                            token: token.name,
                            value: token.name,
                            precedence: 1
                        }
                    )
                }
            });
            let i = 0;
            for (let t = from; t <= to; t += delta) {
                func_base.push(t);
                let functions: { type: number; show: string; token: string; value: (a: number) => void; precedence: number; }[] = [];
                tokens.forEach(token => {
                    if (token.type == 0 && token.accepted) {
                        functions.push(
                            {
                                type: 0,
                                show: token.name + "(",
                                token: token.name,
                                value: function (t: number) {
                                    //return new Function("t", token.value).call(this, {t: a})
                                    //let res: number = vm.runInThisContext(token.value, {t: a});
                                    //return res;
                                    let res = eval(token.value);
                                    return res;
                                },
                                precedence: 1
                            }
                        )
                    }
                });
                i++;
                let value = mexp.eval(
                    expression,
                    [{ type: 3, show: "t", token: "t", value: "t", precedence: 0}, ...tokensList, ...functions],
                    {"t": t, ...constants})
                console.log(value);
                func_data.push(value);
            }
            setFuncError(false);
        } catch (error) {
            setFuncError(true)
            setFuncError(true);
            setIsFFTLoading(false);
            return {func_base: [NaN], func_data: [NaN]}
        }
        console.log(func_data)
        if (func_base == null || func_data == null) {
            setFFTError(true);
            setIsFFTLoading(false);
        }
        return {func_base, func_data};
    }

    const setExpressionStr = (expr: string) => {
        setExpression(expr);
    }

    const setFromBoundStr = (from: string) => {
        setFromBound(mexp.eval(from, [],  {}));
    }

    const setToBoundStr = (to: string) => {
        setToBound(mexp.eval(to, [],  {}));
    }

    const setStepStr = (step: string) => {
        setStep((toBound - fromBound) / mexp.eval(step, [],  {}));
    }

    document.body.style.background = appWindow.label == "win10" ? "rgba(32, 32, 32, 1)" : "transparent";

    return (
        <>
            <Titlebar/>
            <div className="container">
                <FunctionInputSection
                    mexp={mexp}
                    setExpression={setExpressionStr}
                    setFromBound={setFromBoundStr}
                    setToBound={setToBoundStr}
                    setStep={setStepStr}
                    handleExprAccepted={handleExprAccepted}
                    funcData={funcData}
                    funcBase={funcBase}
                    isFuncError={isFuncError}/>
                <div className={"funcFPlotBox plotBox styledSection"}>
                    {isFFTError ? <span className={"error"}><div>Error</div></span> : isFFTLoading ? <span className="loading"><div></div></span> :
                    <Plot
                        data={[
                        {
                            name: "F₊[f(x)]",
                            x: funcFBase,
                            y: funcFData,
                            type: 'scatter',
                            line: {
                                color: "#f7c186",
                                width: 2,
                            }
                        }
                    ]}
                        layout={ {
                        autosize: true,
                            showlegend: true,
                            height: 700,
                            width: 700,
                            transition: {
                            duration: 200,
                                easing: 'cubic-in-out'
                            },
                            title: {
                            font: {
                                family: '"JetBrains Mono Medium", Consolas, monospaced',
                                color: "rgba(200, 200, 255, 0.5)",
                                size: 30
                            },
                                text: "F₊[f(x)]",
                            },
                            legend: {
                            font: {
                                color: "rgba(200, 200, 255, 0.5)"
                            }
                            },
                            plot_bgcolor: "rgba(0, 0, 0, 0)",
                            paper_bgcolor: "rgba(0, 0, 0, 0)",
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
                        scrollZoom: true
                    }}
                    />}
                </div>
                <div className={"funcNPlotBox plotBox styledSection"}>
                    {isFFTError ? <span className={"error"}><div>Error</div></span> : isFFTLoading ? <span className="loading"><div></div></span> :
                    <><Plot
                        data={[
                        {
                            name: "f(x)",
                            x: funcBase,
                            y: funcData,
                            type: 'scatter',
                            line: {
                                color: "rgba(200, 200, 255, 0.5)",
                                width: 2,
                                dash: "dash"
                            }
                        },
                        {
                            name: "F₋[F₊[f(x)]]",
                            x: funcBase,
                            y: funcNData,
                            type: 'scatter',
                            line: {
                                color: "#f7c186",
                                width: 2
                            }
                        }
                    ]}
                        layout={ {
                        autosize: true,
                            showlegend: true,
                            height: 700,
                            width: 700,
                            title: {
                            font: {
                                family: '"JetBrains Mono Medium", Consolas, monospaced',
                                color: "rgba(200, 200, 255, 0.5)",
                                size: 30
                            },
                                text: "F₋[F₊[f(x)]]",
                            },
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
                        config={{scrollZoom: true}}
                    />
                    <Plot
                        data={[
                        {
                            name: "Approx",
                            x: approx,
                            y: funcBase,
                            type: 'scatter',
                            line: {
                                color: "#f7c186",
                                width: 2
                            }
                        },
                    ]}
                    layout={ {
                        autosize: true,
                        showlegend: false,
                        height: 700,
                        width: 300,
                        title: {
                            font: {
                                family: '"JetBrains Mono Medium", Consolas, monospaced',
                                color: "rgba(200, 200, 255, 0.5)",
                                size: 30
                            },
                            text: "Approx",
                        },
                        legend: {
                            font: {
                                color: "rgba(200, 200, 255, 0.5)"
                            }
                        },
                        plot_bgcolor: "rgba(0, 0, 0, 0)",
                        paper_bgcolor: "rgba(0, 0, 0, 0)",
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
                    config={{scrollZoom: true}}
                    /></>}
                </div>
            </div>
        </>
    );
}

export default App;