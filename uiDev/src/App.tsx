import { useEffect, useState } from "react";
import { Button, SegmentedControl } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Editor, useMonaco } from "@monaco-editor/react";
import axios from "axios";

type ValidModes = "javascript" | "lua";

export default function App() {
    const [code, setCode] = useState("");
    const [mode, _setMode] = useState<ValidModes>("javascript");
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(
        process.env.NODE_ENV === "development" ? true : false
    );

    const monaco = useMonaco();

    useEffect(() => {
        async function waitMonaco() {
            while (!monaco) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            const tsData = await axios.get(
                "https://cdn.jsdelivr.net/npm/@citizenfx/client@latest/natives_universal.d.ts"
            );
            const tsData2 = await axios.get(
                "https://cdn.jsdelivr.net/npm/@citizenfx/client@latest/index.d.ts"
            );

            monaco.languages.typescript.javascriptDefaults.addExtraLib(
                tsData.data,
                "file:///natives.d.ts"
            );

            monaco.languages.typescript.javascriptDefaults.addExtraLib(
                tsData2.data,
                "file:///index.d.ts"
            );

            const luaData = await axios.get(
                "https://raw.githubusercontent.com/dhawton/vsc-fivem/master/snippets/snippets.json"
            );

            const LuaSnippets = luaData.data as Record<
                string,
                {
                    prefix: string;
                    body: string[];
                    description?: string;
                }
            >;

            monaco.languages.registerCompletionItemProvider("lua", {
                provideCompletionItems: () => {
                    return {
                        suggestions: Object.keys(LuaSnippets).map((key) => {
                            return {
                                label: key,
                                kind: monaco.languages.CompletionItemKind
                                    .Function,
                                insertText: LuaSnippets[key].body.join("\n"),
                                insertTextRules:
                                    monaco.languages
                                        .CompletionItemInsertTextRule
                                        .InsertAsSnippet,
                                documentation: LuaSnippets[key].description,
                            };
                        }),
                    };
                },
            });

            monaco.languages.registerCompletionItemProvider("javascript", {
                provideCompletionItems: () => {
                    return {
                        suggestions: [
                            {
                                label: "ped",
                                kind: monaco.languages.CompletionItemKind
                                    .Snippet,
                                insertText: "const ped = PlayerPedId();",
                                insertTextRules:
                                    monaco.languages
                                        .CompletionItemInsertTextRule
                                        .InsertAsSnippet,
                                documentation: "Get the player's ped",
                            },
                        ],
                    };
                },
            });

            monaco.languages.registerCompletionItemProvider("javascript", {
                provideCompletionItems: () => {
                    return {
                        suggestions: [
                            {
                                label: "ped",
                                kind: monaco.languages.CompletionItemKind
                                    .Snippet,
                                insertText: "const ped = PlayerPedId();",
                                insertTextRules:
                                    monaco.languages
                                        .CompletionItemInsertTextRule
                                        .InsertAsSnippet,
                                documentation: "Get the player's ped",
                            },
                        ],
                    };
                },
            });

            // JS compiler options for no unused stuff
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                noUnusedLocals: true,
                noUnusedParameters: true,
                // noImplicitReturns: true,
                // noFallthroughCasesInSwitch: true,
                // allowJs: true,
                // checkJs: true,
                // noImplicitAny: true,
                allowNonTsExtensions: true,
                target: monaco.languages.typescript.ScriptTarget.ES2019,
            });

            console.log("Editor Ready");
            setLoading(false);
        }

        waitMonaco();

        window.addEventListener("message", (event) => {
            const data = event.data;
            if (data.type === "toggle") {
                setVisible(data.state);
            }

            if (data.type === "exec_error") {
                notifications.show({
                    title: "Error executing code",
                    id: "exec_error",
                    message: `${data.message}`,
                    color: "red",
                });

                console.log(data);
            }
        });
    }, [monaco]);

    function setMode(val: ValidModes) {
        setCode("");
        _setMode(val);
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // @ts-ignore - GetParentResourceName is a function that is injected by CFX NUI
        if (typeof GetParentResourceName === "function") {
            fetch(
                // @ts-ignore - GetParentResourceName is a function that is injected by CFX NUI
                `https://${GetParentResourceName()}/${
                    mode === "javascript"
                        ? "execute_callback"
                        : "execute_callback_lua"
                }`,
                {
                    method: "POST",
                    body: JSON.stringify({ code }),
                }
            );

            setVisible(false);
        } else {
            try {
                new Function(code)();
            } catch (e) {
                console.error("Error executing code:");
                console.error(e);
            }
        }
    }

    useEffect(() => {
        if (process.env.NODE_ENV === "production") {
            document.documentElement.style.colorScheme = "none";
        }
    }, []);

    return (
        <div
            className={`h-screen w-screen flex flex-col gap-2 items-center justify-center !bg-transparent ${
                !visible && "!hidden"
            }`}
        >
            {process.env.NODE_ENV === "development" && (
                <div className="absolute top-0 left-0 w-full flex flex-row gap-3">
                    <b>Dev Tools</b>
                    <Button
                        onClick={() => {
                            window.dispatchEvent(
                                new MessageEvent("message", {
                                    data: {
                                        type: "exec_error",
                                        message: "Error executing code",
                                    },
                                })
                            );
                        }}
                    >
                        Fire error
                    </Button>
                </div>
            )}

            <SegmentedControl
                defaultValue="javascript"
                onChange={(val) => setMode(val as ValidModes)}
                data={[
                    { value: "javascript", label: "JavaScript" },
                    { value: "lua", label: "Lua" },
                ]}
            />
            <form
                onSubmit={onSubmit}
                className="w-2/3 h-2/3 flex flex-col p-5 bg-neutral-800"
            >
                <Editor
                    theme="vs-dark"
                    height="100%"
                    language={mode}
                    className="grow"
                    loading={loading}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 16,
                    }}
                />
                <Button type="submit" className="justify-self-end">
                    Execute
                </Button>
            </form>
        </div>
    );
}
