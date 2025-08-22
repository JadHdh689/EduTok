
export const colors={
initial:"rgb(255, 255, 255)",
secondary:"#fa0d0dff",
iconColor:"#000000ff",
screenColor:"rgb(255, 255, 255)",
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
    shadowOpacity: 0.25,
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