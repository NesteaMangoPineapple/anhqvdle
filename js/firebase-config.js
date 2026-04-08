// ════════════════════════════════════════════════════════
//  ANHQVdle — Configuración Firebase
//  Rellena estos valores con los de tu proyecto Firebase.
//
//  Cómo obtenerlos:
//  1. Ve a console.firebase.google.com
//  2. Crea un proyecto (o usa uno existente)
//  3. Project Settings → General → Your apps → Web app → Add app
//  4. Habilita "Realtime Database" (no Firestore) en el menú lateral
//  5. Copia el objeto firebaseConfig aquí abajo
//  6. En Realtime Database → Rules, pon:
//     { "rules": { "rooms": { "$id": { ".read": true, ".write": true } } } }
// ════════════════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCcXSSA5JH1YZ0fSb7pozNg8CBQEhMS9-4",
  authDomain:        "anhqvdle.firebaseapp.com",
  databaseURL:       "https://anhqvdle-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "anhqvdle",
  storageBucket:     "anhqvdle.firebasestorage.app",
  messagingSenderId: "337545091694",
  appId:             "1:337545091694:web:6084a0b7b88f53930da47f",
  measurementId:     "G-D02BKZMEGB"
};
