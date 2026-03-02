import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRandomQuote } from "./quotes";

const QUOTE_KEY = "DAILY_QUOTE";
const QUOTE_DATE_KEY = "DAILY_QUOTE_DATE";

const QUOTE_API = "https://zenquotes.io/api/random";

export const getDailyQuote = async () => {
  try {
  
    const savedQuote = await AsyncStorage.getItem(QUOTE_KEY);
    const savedDate = await AsyncStorage.getItem(QUOTE_DATE_KEY);

    const today = new Date().toDateString();

    if (savedQuote && savedDate === today) {
       return savedQuote;
    }
    
    // ✅ Check internet
    const netState = await NetInfo.fetch();

    if (!netState.isConnected) {
      return getRandomQuote();
    }

    // ✅ Fetch from API
    const res = await fetch(QUOTE_API);
    const data = await res.json();

    const quote = data?.[0]?.q;

    if (quote) {
      // Save quote for today
      await AsyncStorage.setItem(QUOTE_KEY, quote);
      await AsyncStorage.setItem(QUOTE_DATE_KEY, today);

      return quote;
    }

    return getRandomQuote();
  } catch (error) {
    return getRandomQuote();
  }
};
