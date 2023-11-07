
export default async function handler(req, res) {
    const { messages, isJson } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: "Bearer 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",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-1106",
            messages: messages,
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            response_format: { type: `${isJson == false ? "text" : "json_object"}` },
        }),
    });

    const data = await response.json();

    if (!data) {
        res.status(500).json({ message: "Error" });
    }
    res.status(200).json(data);
}
