
export const colors={
initial:"rgb(255, 255, 255)",
secondary:"rgb(93, 131, 202)",
iconColor:"rgb(41, 41, 41)",
screenColor:"rgb(247, 247, 247)",
saveColor:'#f59e0b' ,
favColor:'#ef4444' ,
};

export const fonts = {
  initial: "Domine",
};

export const maxCharacters=35;
export const shadowIntensity = {
   bottomShadow: {
    shadowColor: "black",
    shadowOffset: {
      width: 0,    // No horizontal shadow
      height: 9,   // Shadow only at bottom
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderRadius:2,
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