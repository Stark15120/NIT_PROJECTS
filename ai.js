// AI dictionary
const ai = {
    email: "flowrite",
    website: "bolt/loveable",
    presentation: "gamma",
    socielmedia_campains: "ocoya",
    captions: "copy.ai",
    video_generation: "runway/veo3",
    reels: "captions",
    voice_overs: "llelvenlabs",
    logo: "looka",
    img_gen: "midjourney"
};

// ELEMENTS
const searchBox = document.getElementById("searchBox");
const searchBtn  = document.getElementById("searchBtn");
const resultBox  = document.getElementById("resultBox");

// SEARCH FUNCTION
searchBtn.addEventListener("click", () => {
    const key = searchBox.value.trim();   // get text

    if (key === "") return;               // ignore empty search

    if (ai[key]) {
        resultBox.innerText = `Artificial_intelligence: ${ai[key]}`;
        resultBox.classList.remove("hidden");
        resultBox.classList.remove("text-red-400");
        resultBox.classList.add("text-sky-300");
    } else {
        resultBox.innerText = `❌ Not found: "${key}"`;
        resultBox.classList.remove("hidden");
        resultBox.classList.remove("text-sky-300");
        resultBox.classList.add("text-red-400");
    }
});
