const GROUPS = {
  A: ["México", "Sudáfrica", "Corea del Sur", "República Checa"],
  B: ["Canadá", "Qatar", "Suiza", "Bosnia y Herzegovina"],
  C: ["Brasil", "Marruecos", "Escocia", "Haití"],
  D: ["Estados Unidos", "Paraguay", "Turquía", "Australia"],
  E: ["Alemania", "Ecuador", "Costa de Marfil", "Curazao"],
  F: ["Países Bajos", "Japón", "Suecia", "Túnez"],
  G: ["Bélgica", "Irán", "Nueva Zelanda", "Egipto"],
  H: ["España", "Uruguay", "Cabo Verde", "Arabia Saudita"],
  I: ["Francia", "Senegal", "Noruega", "Irak"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "Colombia", "Uzbekistán", "RD Congo"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panamá"]
};

function generateMatches() {
  const matches = [];
  Object.entries(GROUPS).forEach(([group, teams]) => {
    const pairings = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]];
    pairings.forEach(([a,b], index) => {
      matches.push({
        id: `${group}-${index + 1}`,
        stage: "group",
        group,
        home: teams[a],
        away: teams[b],
        homeGoals: "",
        awayGoals: "",
        played: false
      });
    });
  });
  return matches;
}
