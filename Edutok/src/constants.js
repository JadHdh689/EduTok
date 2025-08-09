
export const colors={
initial:"rgba(247, 247, 247, 1)",
secondary:"#bafdb5ff",
iconColor:"#000000ff",
screenColor:"rgba(247, 247, 247, 1)",
saveColor:"#ffec8cff",
favColor:"#ec8a93ff",
};

export const fonts = {
  initial: "Domine",
};

export const maxCharacters=25;
export const shadowIntensity = {
   bottomShadow: {
    shadowColor: "black",
    shadowOffset: {
      width: 0,    // No horizontal shadow
      height: 2,   // Shadow only at bottom
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,  // For Android
  },
};
 export const getDifficultyBadgeStyle = (difficulty) => {
  switch (difficulty) {
    case "easy": return "#92f295ff"; break;
    case "intermediate": return"#ffbe5cff"; break;
    case "hard": return"#f1584eff"; break;
    default: return"#9E9E9E";
  }
}; 


