// Pet type isimlerini resimlerine map eden constants

export const PET_TYPE_IMAGES: Record<string, any> = {
  // Türkçe isimler için mapping
  kedi: require("../../assets/images/kedi.png"),
  köpek: require("../../assets/images/köpek.png"),
  kuş: require("../../assets/images/kuş.png"),
  balık: require("../../assets/images/balık.png"),
  hamster: require("../../assets/images/hamster.png"),
  tavşan: require("../../assets/images/tavşan.png"),
  sürüngen: require("../../assets/images/sürüngen.png"),

  // İngilizce isimler için mapping (API'den farklı formatta gelebilir)
  cat: require("../../assets/images/kedi.png"),
  dog: require("../../assets/images/köpek.png"),
  bird: require("../../assets/images/kuş.png"),
  fish: require("../../assets/images/balık.png"),
  rabbit: require("../../assets/images/tavşan.png"),
  reptile: require("../../assets/images/sürüngen.png"),
};

/**
 * Pet type name'ine göre resim kaynağını döndürür
 * @param petTypeName - Pet type adı (ör: "kedi", "köpek", "cat", "dog")
 * @returns Resim source objesi veya default resim
 */
export const getPetTypeImageByName = (petTypeName?: string) => {
  if (!petTypeName) return require("../../assets/images/default-user.png");

  const normalizedName = petTypeName.toLowerCase();
  return (
    PET_TYPE_IMAGES[normalizedName] ||
    require("../../assets/images/default-user.png")
  );
};
