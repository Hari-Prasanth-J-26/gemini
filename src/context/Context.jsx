import { createContext, useState } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {

    const [input, setInput] = useState('')
    const [recentPrompt, setRecentPrompt] = useState('')
    const [prevPrompts, setPrevPrompts] = useState([])
    const [showResult, setShowResult] = useState(false)
    const [loading, setLoading] = useState(false)
    const [resultData, setResultData] = useState('')

    const delayPara = (index, nextWord) => {
        setTimeout(function () {
            setResultData(prev => prev + nextWord)
        }, 75 * index)
    }

    const newChat = () => {
        setLoading(false)
        setShowResult(false)
    }

    const onSent = async (prompt) => {
        setResultData('')
        setLoading(true)
        setShowResult(true)
        try {
            let response;
            if (prompt !== undefined) {
                response = await run(prompt);
                setRecentPrompt(prompt)
            }
            else {
                setPrevPrompts(prev => [...prev, input])
                setRecentPrompt(input)
                response = await run(input)
            }
            let responseArray = response.split('**');
            let newResponse1 = '';
            for (let i = 0; i < responseArray.length; i++) {
                if (i === 0 || i % 2 !== 1) {
                    newResponse1 += responseArray[i];
                }
                else {
                    newResponse1 += '<b>' + responseArray[i] + '</b>';
                }
            }
            let newResponse2 = newResponse1.split('*').join('</br>');
            let newResponseArray = newResponse2.split(' ');
            for (let i = 0; i < newResponseArray.length; i++) {
                const nextWord = newResponseArray[i];
                delayPara(i, nextWord + ' ')
            }
        } catch (error) {
            console.error("Error in onSent:", error);
            if (error.message.includes("429")) {
                setResultData("Sorry, the Gemini API quota has been exceeded for this key. Please check your API key or wait a few minutes.");
            } else {
                setResultData("Sorry, something went wrong. " + error.message);
            }
        } finally {
            setLoading(false)
            setInput('')
        }
    }

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        recentPrompt,
        setRecentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat
    }
    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default ContextProvider