import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../app/index';
import SetupScreen from '../app/setup';
import NameScreen from '../app/setup/name';
import LongGoalsScreen from '../app/setup/long-goals';
import ShortGoalsScreen from '../app/setup/short-goals';
import TasksScreen from '../app/setup/tasks';

import LogScreen from '../app/log';
import ResultScreen from '../app/result';
import CelebrationScreen from '../app/celebration';
import StreakCalendarScreen from '../app/streak';

import SettingsScreen from '../app/settings';
import RulesScreen from '../app/settings/rules';
import LongGoalsList from '../app/settings/long-goals-list';
import ShortGoalsList from '../app/settings/short-goals-list';

import AlarmScreen from '../app/alarms-setter';
import AlarmSettings from '../app/alarms-setter/alarmsetting1';
import AlarmRingingScreen from '../app/alarms-setter/ringing123';
import TaskList from '../app/settings/task-list';
import EditProfileScreen from "../app/settings/EditProfileScreen";
// navigation/RootStack.js
import BrainGameHub from '../app/brain-games/BrainGameHub';

// games
import MathRush from '../app/brain-games/games/MathRush';
import MemoryFlash from '../app/brain-games/games/MemoryFlash';
import ColorTrap from '../app/brain-games/games/ColorTrap';
import OrderChaos from '../app/brain-games/games/OrderChaos';
import PatternBeast from '../app/brain-games/games/PatternBeast';


const Stack = createNativeStackNavigator();

const COMPACT_HEADER = {
  headerShown: false,
 
};

export default function RootStack({ initialRoute, initialAlarmData }) {

  return (
    <Stack.Navigator initialRouteName={initialRoute}>


      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />

      <Stack.Screen name="Setup" component={SetupScreen} options={{ ...COMPACT_HEADER, title: 'Setup' }} />
      <Stack.Screen name="Name Setup" component={NameScreen} options={{ ...COMPACT_HEADER, title: 'Your Name' }} />
      <Stack.Screen name="Long-Goal Setting" component={LongGoalsScreen} options={{ ...COMPACT_HEADER, title: 'Long-Term Goals' }} />
      <Stack.Screen name="Short-Goal Setting" component={ShortGoalsScreen} options={{ ...COMPACT_HEADER, title: 'Short-Term Goals' }} />
      <Stack.Screen name="Task Setting" component={TasksScreen} options={{ ...COMPACT_HEADER, title: 'Tasks' }} />

      <Stack.Screen name="Log" component={LogScreen} options={{ ...COMPACT_HEADER, title: 'Log Progress' }} />
      <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Celebration" component={CelebrationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Streak" component={StreakCalendarScreen} options={{ ...COMPACT_HEADER, title: 'Streak Calendar' }} /> 

      <Stack.Screen name="Settings" component={SettingsScreen} options={{ ...COMPACT_HEADER, title: 'Settings' }} />
      <Stack.Screen name="Rules" component={RulesScreen} options={{ ...COMPACT_HEADER, title: 'Rules' }} />
      <Stack.Screen name="Long-Goals List" component={LongGoalsList} options={{ ...COMPACT_HEADER }} />
      <Stack.Screen name="Short-Goals List" component={ShortGoalsList} options={{ ...COMPACT_HEADER }} />
      <Stack.Screen name="Task List" component={TaskList} options={{...COMPACT_HEADER}}/>
      <Stack.Screen name="Edit Profile" component={EditProfileScreen} options={{ ...COMPACT_HEADER }} />


      <Stack.Screen name="Alarms" component={AlarmScreen} options={{ ...COMPACT_HEADER }} />
      <Stack.Screen name="Alarm Setting" component={AlarmSettings} options={{ ...COMPACT_HEADER }} />
      <Stack.Screen name="Alarm Ringing" component={AlarmRingingScreen} initialParams={initialAlarmData ?? undefined} options={{ headerShown: false }} />
      <Stack.Screen name="BrainGameHub" component={BrainGameHub} options={{ headerShown: false }}/>

      <Stack.Screen name="MATH_RUSH" component={MathRush} options={{ headerShown: false }} />
      <Stack.Screen name="MEMORY_FLASH" component={MemoryFlash} options={{ headerShown: false }} />
      <Stack.Screen name="COLOR_TRAP" component={ColorTrap} options={{ headerShown: false }} />
      <Stack.Screen name="ORDER_CHAOS" component={OrderChaos} options={{ headerShown: false }} />
      <Stack.Screen name="PATTERN_BEAST" component={PatternBeast} options={{ headerShown: false }} />

    </Stack.Navigator>
  );
}
