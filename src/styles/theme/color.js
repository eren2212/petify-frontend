const pawTheme = {
    primary: "#FF914D",      // Enerjik turuncu (hayvan dostu sıcaklık için)
    background: "#FFF8F3",   // Açık krem (sadelik ve okunabilirlik için)
    text: "#4A3428",         // Kahverengi tonları (doğallık)
    border: "#FFD9C7",       // Yumuşak turuncu/krem sınırlar
    white: "#FFFFFF",
    textLight: "#FFB899",    // Daha açık turuncu
    card: "#FFFFFF",
    shadow: "#000000",
  };
  
  const natureTheme = {
    primary: "#2E7D32",      // Doğayı çağrıştıran yeşil
    background: "#F1F8F4",   // Çok açık yeşilimsi beyaz
    text: "#1B4332",         // Derin koyu yeşil
    border: "#CDE6D0",       // Açık yeşil kenarlık
    white: "#FFFFFF",
    textLight: "#66BB6A",    // Canlı açık yeşil
    card: "#FFFFFF",
    shadow: "#000000",
  };
  
  const softBlueTheme = {
    primary: "#3D9DF5",      // Gökyüzü mavisi (pozitif ve güvenilir his)
    background: "#F0F8FF",   // Çok açık mavi
    text: "#1E3A5F",         // Koyu mavi (okunabilirlik)
    border: "#CDE6FA",       // Yumuşak açık mavi
    white: "#FFFFFF",
    textLight: "#90CAF9",    // Açık mavi ton
    card: "#FFFFFF",
    shadow: "#000000",
  };
  
  const friendlyTheme = {
    primary: "#FF6F91",      // Pembe-turuncu arası (samimiyet ve sevecenlik)
    background: "#FFF5F7",   // Açık pembe beyaz
    text: "#3A1F25",         // Koyu bordo kahve
    border: "#FFD1DA",       // Açık pastel pembe
    white: "#FFFFFF",
    textLight: "#FFB5C2",    // Daha açık pastel pembe
    card: "#FFFFFF",
    shadow: "#000000",
  };
  
  export const THEMES = {
    paw: pawTheme,
    nature: natureTheme,
    softBlue: softBlueTheme,
    friendly: friendlyTheme,
  };
  
  // 👇 buradan aktif temayı değiştirebilirsin
  export const COLORS = THEMES.paw;
  