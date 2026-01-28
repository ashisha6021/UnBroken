// Motivational quotes for the home screen

export const MOTIVATIONAL_QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "The only bad workout is the one that didn't happen.",
  "Motivation gets you started. Discipline keeps you going.",
  "You don't have to be great to start, but you have to start to be great.",
  "The pain of discipline is nothing like the pain of regret.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Discipline is the bridge between goals and accomplishment.",
  "The only way to do great work is to love what you do.",
  "Excellence is not a skill, it's an attitude.",
  "Champions aren't made in gyms. Champions are made from something deep inside them.",
  "The difference between the impossible and the possible lies in a person's determination.",
  "It's not about perfect. It's about effort.",
  "When you feel like quitting, think about why you started.",
  "The only person you should try to be better than is the person you were yesterday.",
  "Discipline is the foundation upon which all success is built.",
];

export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[randomIndex];
};
