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

  // 🔥 50 More Power Quotes
  "Small progress is still progress.",
  "Consistency beats motivation every time.",
  "Your future self is watching you right now.",
  "Don’t stop when you’re tired. Stop when you’re done.",
  "The body achieves what the mind believes.",
  "Strong habits create strong results.",
  "Hard work beats talent when talent doesn’t work hard.",
  "You didn’t come this far to only come this far.",
  "Train your mind to be stronger than your feelings.",
  "The struggle you feel today builds the strength you need tomorrow.",
  "No excuses. Just results.",
  "Success is earned, not given.",
  "Every day is a new chance to improve.",
  "Push yourself because no one else will do it for you.",
  "A little progress each day adds up to big results.",
  "Great things never come from comfort zones.",
  "The hardest lift is showing up.",
  "Discipline is doing it even when you don’t feel like it.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Winners focus on progress, not perfection.",
  "The work you put in today will pay off tomorrow.",
  "Dream big. Work bigger.",
  "Be stronger than your strongest excuse.",
  "Your only competition is yesterday’s version of you.",
  "Success starts with self-discipline.",
  "You don’t find willpower, you build it.",
  "Make yourself proud.",
  "The grind will be worth it.",
  "Sweat is just weakness leaving the body.",
  "Your limits are only in your mind.",
  "Do something today your future self will thank you for.",
  "One workout at a time.",
  "Focus. Commit. Grow.",
  "Results happen over time, not overnight.",
  "Work hard in silence. Let success make noise.",
  "Be addicted to bettering yourself.",
  "Your body can stand almost anything. It’s your mind you have to convince.",
  "Don’t wish for it. Work for it.",
  "Discipline is freedom.",
  "Stay consistent. Stay hungry.",
  "The difference is discipline.",
  "Your goals don’t care how you feel.",
  "Turn pain into power.",
  "The effort never lies.",
  "Strive for progress, not excuses.",
  "Every rep counts.",
  "Every day you train, you level up.",
  "Fall in love with the process.",
  "The results will come if you don’t quit.",
  "Earn your strength.",
  "You are built for hard things.",
  "Your discipline decides your destiny.",
  "The comeback is always stronger than the setback.",
  "Do it for the person you are becoming.",
  "Stay patient. Stay relentless.",
  "Your strongest muscle is your mindset.",
  "Discipline is the difference between wanting and achieving.",
  "Train like it matters.",
  "Your journey is your power.",
  "Keep showing up.",
  "Success is built in the boring days.",
  "Be consistent, not perfect.",
  "Your discipline will take you places motivation never will.",
  // 🔥 Additional Execution & Discipline Quotes

"Execution beats intention every single time.",
"Your goals are waiting for the version of you that takes action.",
"Every alarm is a chance to prove who you are.",
"Comfort builds nothing. Action builds everything.",
"The moment you act is the moment your life changes.",
"Greatness is built in the moments nobody sees.",
"Wake up with purpose. Execute with discipline.",
"Your goals demand action, not excuses.",
"Success starts the moment you decide to move.",
"Every disciplined action compounds into greatness.",
"Don’t negotiate with excuses. Execute.",
"The life you want is hidden behind the work you avoid.",
"Every time you show up, you win.",
"The difference between dreams and reality is execution.",
"Today’s effort becomes tomorrow’s success.",
"The hardest step is the one you delay.",
"Progress starts when excuses stop.",
"Your goals are earned, never gifted.",
"The future belongs to those who execute today.",
"Champions execute even when they don’t feel like it.",

// 🔥 Alarm-Specific Motivation (perfect for your alarm screen)

"The alarm rang. Your future just called.",
"Your goals are waiting. Don’t keep them waiting.",
"This moment decides your discipline.",
"The version of you that wins is the one who gets up now.",
"Every time you answer this alarm, you become stronger.",
"The alarm is not noise. It’s opportunity.",
"The alarm rings for those who want more.",
"Get up. Your goals are waiting.",
"Your discipline begins the moment the alarm rings.",
"Each alarm is a test of who you are becoming.",

// 🔥 Identity & Growth

"You are becoming the person your goals require.",
"Small disciplined actions create powerful identities.",
"The person you want to become starts with today’s action.",
"Your habits are building your future.",
"Identity is built through repeated discipline.",
"Each action is a vote for the person you want to be.",
"The strongest identity is built through consistency.",
"Great lives are built on disciplined days.",
"Your future self depends on today’s choices.",
"Show up enough times and greatness becomes normal.",
];


export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[randomIndex];
};

export const getAlarmQuote = () => {
  const alarmQuotes = [
   // 🔔 Alarm Execution Quotes

"The alarm rang. Your future is calling.",
"Get up. Your goals won't chase you.",
"This moment decides your discipline.",
"Don't snooze your potential.",
"The difference is what you do right now.",
"Your goals are waiting for action.",
"Wake up and prove yourself.",
"Execution starts now.",
"Champions answer the alarm.",
"Success starts with getting up.",

// Discipline

"Discipline begins the moment you move.",
"No excuses. Just action.",
"Every alarm is a test.",
"Comfort is the enemy of progress.",
"The alarm is your opportunity.",
"Greatness starts when excuses stop.",
"Today’s discipline builds tomorrow’s success.",
"Don't negotiate with the alarm.",
"Your discipline is watching.",
"Your habits decide your future.",

// Growth

"Wake up stronger than yesterday.",
"Your future self is watching.",
"Progress starts now.",
"Be the person your goals require.",
"The next level starts today.",
"You are one action away from progress.",
"Level up today.",
"Success is built in moments like this.",
"The grind begins now.",
"Consistency starts here.",

// Action

"Move now. Think later.",
"Action beats intention.",
"Execute your plan.",
"Start before you're ready.",
"Momentum starts with one step.",
"Do it now.",
"Execution defines winners.",
"Act before excuses speak.",
"Show up and win.",
"Small actions create big futures.",

// Identity

"You are becoming stronger.",
"This is where winners are made.",
"Discipline defines you.",
"Prove it to yourself.",
"Become who you promised to be.",
"Your goals are worth the effort.",
"Strong people get up.",
"The person you want to be is waiting.",
"This moment builds your character.",
"Your mindset is your power.",

// Hard mode

"The alarm is a challenge. Accept it.",
"You didn't set this alarm to ignore it.",
"Greatness doesn't snooze.",
"Don't betray your goals.",
"This is your moment.",
"Wake up and dominate the day.",
  ];

  return alarmQuotes[Math.floor(Math.random() * alarmQuotes.length)];
};