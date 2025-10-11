// Her pet türü için popüler cinsler (5 adet + Diğer)
// Pet türü name değerine göre eşleştirilecek

const dogBreeds = [
  "Golden Retriever",
  "Labrador Retriever",
  "German Shepherd",
  "Bulldog",
  "Beagle",
  "Diğer",
];

const catBreeds = [
  "Tekir",
  "British Shorthair",
  "Scottish Fold",
  "Persian",
  "Siamese",
  "Diğer",
];

const birdBreeds = [
  "Muhabbet Kuşu",
  "Sultan Papağanı",
  "Kanarya",
  "Cennet Papağanı",
  "Forpus",
  "Diğer",
];

const fishBreeds = [
  "Japon Balığı",
  "Beta Balığı",
  "Guppy",
  "Neon Tetra",
  "Discus",
  "Diğer",
];

const hamsterBreeds = [
  "Syrian Hamster",
  "Dwarf Hamster",
  "Roborovski",
  "Campbell",
  "Winter White",
  "Diğer",
];

const rabbitBreeds = [
  "Holland Lop",
  "Mini Lop",
  "Lionhead",
  "Dutch Rabbit",
  "Flemish Giant",
  "Diğer",
];

const turtleBreeds = [
  "Red-Eared Slider",
  "Hermann's Tortoise",
  "Greek Tortoise",
  "Russian Tortoise",
  "Box Turtle",
  "Diğer",
];

const guineaPigBreeds = [
  "American",
  "Abyssinian",
  "Peruvian",
  "Skinny Pig",
  "Teddy",
  "Diğer",
];

const snakeBreeds = [
  "Ball Python",
  "Corn Snake",
  "King Snake",
  "Boa Constrictor",
  "Milk Snake",
  "Diğer",
];

export const POPULAR_BREEDS: Record<string, string[]> = {
  // İngilizce key'ler (büyük harf)
  Dog: dogBreeds,
  Cat: catBreeds,
  Bird: birdBreeds,
  Fish: fishBreeds,
  Hamster: hamsterBreeds,
  Rabbit: rabbitBreeds,
  Turtle: turtleBreeds,
  "Guinea Pig": guineaPigBreeds,
  Snake: snakeBreeds,

  // İngilizce key'ler (küçük harf - API'den böyle geliyor)
  dog: dogBreeds,
  cat: catBreeds,
  bird: birdBreeds,
  fish: fishBreeds,
  hamster: hamsterBreeds,
  rabbit: rabbitBreeds,
  turtle: turtleBreeds,
  "guinea pig": guineaPigBreeds,
  snake: snakeBreeds,

  // Türkçe key'ler
  Köpek: dogBreeds,
  Kedi: catBreeds,
  Kuş: birdBreeds,
  Balık: fishBreeds,
  Tavşan: rabbitBreeds,
  Kaplumbağa: turtleBreeds,
  Yılan: snakeBreeds,

  // Fallback için varsayılan liste
  default: ["Diğer"],
};

/**
 * Pet türü adına göre popüler cinsleri getir
 * @param petTypeName - Pet türünün name değeri (örn: "Dog", "Cat")
 * @returns Popüler cinsler dizisi
 */
export const getPopularBreeds = (petTypeName: string): string[] => {
  return POPULAR_BREEDS[petTypeName] || POPULAR_BREEDS.default;
};
