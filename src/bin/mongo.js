import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // MongoDB URI iz .env datoteke
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // U razvojnom modu, koristimo globalnu varijablu da izbjegnemo ponovno povezivanje
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().then(() => {
      console.log('Successfully connected to MongoDB'); // Dodajte ovu liniju za uspešno povezivanje
      return client; // Vrati client objekat za dalje korišćenje
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // U produkcijskom modu, uvijek kreiramo novu konekciju
  client = new MongoClient(uri, options);
  clientPromise = client.connect().then(() => {
    console.log('Successfully connected to MongoDB'); // Dodajte ovu liniju za uspešno povezivanje
    return client; // Vrati client objekat za dalje korišćenje
  });
}

// Dodajemo `.catch` lanac za obradu grešaka prilikom povezivanja
clientPromise.catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1); // Izađi iz procesa sa greškom
});

export default clientPromise;
