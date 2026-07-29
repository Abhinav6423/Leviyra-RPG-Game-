import fetch from "node-fetch";

async function check() {
    const API_KEY = "ca9b2354-6d89-435c-8603-e055c0016765"; 
    
    try {
        console.log("Fetching ALL models from ArliAI...\n");
        const response = await fetch("https://api.arliai.com/v1/models", {
            headers: { "Authorization": `Bearer ${API_KEY}` }
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.log("Error aayi hai:", data.error);
            return;
        }

        // Ye code bina kisi filter ke saare models print karega
        data.data.forEach((m, index) => console.log(`${index + 1}. ${m.id}`));
        
    } catch (err) {
        console.log("Network ya Fetch Error:", err.message);
    }
}

check();