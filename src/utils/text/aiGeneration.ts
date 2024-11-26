export const generateText = async ( apiKey: string, prompt: string ): Promise< string > => {
    console.log( 'Sending a request to generate text' )

    const response = await fetch(
        'https://pub0-ami.remardev.com/api/generate', // request url

        { // options
            method: 'POST',
            headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Authorization': apiKey
            },

            body: JSON.stringify({
                model: 'llama3.2:1b',
                prompt: prompt,
                stream: false,
                options: {
                    seed: Math.floor( Math.random() * 999999999 + 1 )
                },

                keep_alive: -1
            }) // body
        } // options
    ) // fetch

    const data = await response.json()
    console.log( data.response )

    return data.response
}