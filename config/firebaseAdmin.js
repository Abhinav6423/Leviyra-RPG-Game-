import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDXnSPSGR5mCRL2\nxiC20xsVnSO5+A7Xm5FkzcS/ZVInOmi0p/8H9KrPcEPBvsu7M/G57xnvOkmLnBur\na+iqSp7ddJbx36GWyDcZH+HamAPzSbq11PdBZ2UM8Bze0R3J+7eOWT/wCUg/T99n\nZTqVfMZyRe/jViEehqO3YZW7L8d3N867yLpi4ii92SlQc7/BepUTiauLYQUvK+79\nBglgl7OAZaKPIDeI4RXyoHENl2uaw4P+KX7cqwu/lZPMQjxaCIKB/7Rgj7W34Y8k\neyKyFHwrAvsBDzqGz/3b2Uk6cUN513G6/qdjNF8ZP+LE2mLJPGkSSzn3ciJaZaOm\n+Cy08EIlAgMBAAECggEAMawtzbAEQRELmacE7+GcHoNccPJNJw5btVuzXT2wKsHp\nz97ZIgHTnSUZswer42Wg5YtIUAT/Xwa4mCosyJiW12GOCcyRq01WZjciXuwBEvo0\nJcJZsStrDAtAN3P5NyiCvexhTsEwsAdMakNXtwsvI7HphVf5GtF9Y5i7eEuWWigo\ne6hsysyrwQmq5xEdZjLk+O+DYw30chzLAAcZcPU9R67LjoKVCfq1UQkxDFbhd+ll\nsW74JYT4iI83lnJxXMj4cU8R+3af+W1mYZWDhJgBXGM8mrxvwF8uAP36YDokLbuS\nITbXvjev78bX/CvjBA3VQDM/ijkl5xS+I2+Tq/23sQKBgQD7ebOE+JJItdnCQbjF\n4mFUMTnHYW8sVghmgVfi0JGqFzVqkphiTo0xgzFB6NQO/dRzcaSScNZ0x1q8bsaB\nttRUnNO4tKndKUO1F8kwrQ9bH1viiQaCJ4L8CUWffHoGP9cOFxo7s1kMhZuY1ZcB\nAj2ZtMLVvSVjzpXV8FKLemMvdQKBgQDbfkKF+vPTkuUkwdPysJAwnR/9jcCZeKLa\n6V91ztHhqxOaH+OgIVxRiDGP0u6tmcuLjDlXsOjqE7kt4wicuD+iF2tmjghvuVNf\njdfv2x9RWpaAGzOQIIydK9GXZq2SqNcgNzP7OCjop9kcDFpMayL89VuICMLC/jvz\ngSX9itih8QKBgFdNiOVA5ogXmeG2r08DqIZyEH0HdnEN7RypCrnTbr5+EC1Pd1ep\nrZri0Nbw3a3WsUriyR+NzOX9z6JbUs71igFV8KrPDamaCcd02oPrkMkxudSLfZbx\n4KdfEKytqi9BOofJvXG8cc3HFJ2aiTHwdTJHbtyFLdXYgmwjYoTJmGWBAoGAVmGa\nTKA21U06YPznLNvP41HzBRaEdeHENeMibnq2ntl1HXLvYlW+v1eaKcAZrriYIpNM\n/fXhtD2O40A2Y3cfk+sjmXjMWSvWZASutvbFnH7KPCB4aoBk1nYoRi1iohVQlJ0l\nF/lCIE3uY9t4rhp76pGlNCQ+gf8MGQj6qo26NAECgYAg3UHJLNuhAeyG3YbQWt94\n03PwkTTypkP7rW4L2gobRD667cTXvuHJuxRprw7VQR5EbcO+UvTE4Tf3e0p5//lt\nXyFFMZaDh8BNsVlx3myM/XOeG/HVjBUZ3aqypljAOehIU2jFDKP7WDn+l4b9+hyX\nNKSKRbIMSS5H/7C7nIl1pg==\n-----END PRIVATE KEY-----\n",
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;