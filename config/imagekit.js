import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.IMAGEKIT_PUBLIC_KEY)
console.log(process.env.IMAGEKIT_PRIVATE_KEY)
console.log(process.env.IMAGEKIT_URL_ENDPOINT)

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});


imagekit.listFiles({ limit: 1 })
    .then(() => console.log("ImageKit connection OK"))
    .catch(err => console.log("ImageKit connection FAILED:", err.message));

export default imagekit;