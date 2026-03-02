import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { usePremiumAlert } from '../../store/usePremiumAlert';
import { cancelAlarm } from '../../alarm1/alarmScheduler123';
import { dbUpdateTaskAlarm } from '../../storage/storage-sqlite';

const days = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
];

export default function AlarmListScreen({ navigation }) {

  const {
    taskAlarms = {},
    tasks = [],
    shortGoals = [],
    longGoals = []
  } = useAppStore();

  const updateAlarmInStore = useAppStore((s) => s.updateTaskAlarm);
  const showConfirm = usePremiumAlert((s) => s.showConfirm);

  const [expandedDay, setExpandedDay] = useState({});
  const [expandedText, setExpandedText] = useState({});
  const [manageMode, setManageMode] = useState(false);

  const scrollRef = useRef(null);
  const lastAlarmRef = useRef(null);
  const scrollTarget = useRef(null);
  const scrollViewHeight = useRef(0);

  const toggleDay = (day) => {
    const isOpening = !expandedDay[day];
    if (isOpening) scrollTarget.current = day;

    setExpandedDay(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleLastAlarmLayout = () => {
    if (!scrollTarget.current || !lastAlarmRef.current || !scrollRef.current) return;

    setTimeout(() => {
      lastAlarmRef.current.measureLayout(
        scrollRef.current,
        (x, y, width, height) => {

          const visibleHeight = scrollViewHeight.current;
          const targetScroll = y + height - visibleHeight + 40;

          scrollRef.current.scrollTo({
            y: targetScroll > 0 ? targetScroll : 0,
            animated: true
          });

          scrollTarget.current = null;
        },
        () => {}
      );
    }, 80);
  };

  const toggleText = (id) => {
    setExpandedText(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 🔥 Disable full day alarms
  const disableDayAlarms = (day, alarms) => {

    showConfirm(
      `Disable ${day} Alarms?`,
      `All alarms for ${day} will be cancelled.\nYou can enable them again later from settings.`,
      "Cancel",
      "Disable",
      "warning",
      async () => {

        for (const alarm of alarms) {

          const updatedAlarm = {
            ...alarm,
            enabled: false,
            isCritical: false
          };

          updateAlarmInStore(alarm.taskId, updatedAlarm);
          await dbUpdateTaskAlarm(updatedAlarm);
          await cancelAlarm(alarm.id);
        }

      }
    );
  };

  const allAlarms = Object.entries(taskAlarms).flatMap(([taskId, alarms]) =>
    (alarms || [])
      .filter(a => a.enabled)
      .map(a => ({
        ...a,
        taskId
      }))
  );
  const hasAnyActiveAlarm = allAlarms.length > 0;
  const alarmsByDay = days.reduce((acc, day) => {
    const dayKey = day.toLowerCase();
    const activeAlarms = allAlarms.filter(
      a => a.dayOfWeek === dayKey
    );

    if (activeAlarms.length > 0) {
      acc[day] = activeAlarms;
    }

    return acc;
  }, {});

  const getTask = (taskId) => tasks.find(t => t.id === taskId);
  const getShortGoal = (id) => shortGoals.find(sg => sg.id === id);
  const getLongGoal = (id) => longGoals.find(lg => lg.id === id);

  return (
    <>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Active Alarms</Text>

       <TouchableOpacity
          disabled={!hasAnyActiveAlarm}
          style={[
            styles.manageToggle,
            manageMode && styles.manageToggleActive,
            !hasAnyActiveAlarm && styles.manageToggleDisabled
          ]}
          onPress={() => setManageMode(!manageMode)}
        >
         <Text style={[
          styles.manageToggleText,
          manageMode && styles.manageToggleTextActive,
          !hasAnyActiveAlarm && styles.manageToggleTextDisabled
        ]}>
            {manageMode ? "DONE" : "Disable"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.container}
        onLayout={(e) => {
          scrollViewHeight.current = e.nativeEvent.layout.height;
        }}
      >

        {Object.entries(alarmsByDay).map(([day, dayAlarms]) => (
          <View key={day} style={styles.section}>

            {/* DAY ROW */}
            <View style={styles.dayRow}>

              <TouchableOpacity
                style={styles.dayCardFull}
                onPress={() => toggleDay(day)}
              >
                <View style={styles.dayAccentBar} />
                <Text style={styles.dayTitle}>{day}</Text>
                <Text style={styles.chevron}>
                  {expandedDay[day] ? "▲" : "▼"}
                </Text>
                  {manageMode && (
                <TouchableOpacity
                  style={styles.disableDayBtn}
                  onPress={() => disableDayAlarms(day, dayAlarms)}
                >
                  <Text style={styles.disableDayText}>Disable</Text>
                </TouchableOpacity>
              )}
              </TouchableOpacity>

            

            </View>

            {expandedDay[day] && dayAlarms.map((alarm, index) => {

              const isLast = index === dayAlarms.length - 1;

              const task = getTask(alarm.taskId);
              const shortGoal = getShortGoal(task?.shortGoalId);
              const longGoal = getLongGoal(shortGoal?.longGoalId);

              return (
                <View
                  key={alarm.id}
                  ref={isLast ? lastAlarmRef : null}
                  onLayout={isLast ? handleLastAlarmLayout : undefined}
                >
                  <TouchableOpacity
                    style={styles.alarmCard}
                    onPress={() =>
                      navigation.navigate("Alarms", {
                        taskId: alarm.taskId
                      })
                    }
                  >
                    <View style={[
                      styles.alarmAccentBar,
                      alarm.isCritical && styles.criticalAccent
                    ]} />

                    <View style={styles.timeRow}>
                      <Text style={styles.alarmTime}>
                        {alarm.time}
                      </Text>

                      {alarm.isCritical && (
                        <View style={styles.criticalBadge}>
                          <Text style={styles.criticalBadgeText}>
                            ⚠️ CRITICAL
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity onPress={() => toggleText(alarm.id + "-task")}>
                      <Text
                        style={styles.meta}
                        numberOfLines={expandedText[alarm.id + "-task"] ? undefined : 1}
                      >
                        Task: {task?.name || "—"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => toggleText(alarm.id + "-sg")}>
                      <Text
                        style={styles.meta}
                        numberOfLines={expandedText[alarm.id + "-sg"] ? undefined : 1}
                      >
                        Short Goal: {shortGoal?.title || "—"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => toggleText(alarm.id + "-lg")}>
                      <Text
                        style={styles.meta}
                        numberOfLines={expandedText[alarm.id + "-lg"] ? undefined : 1}
                      >
                        Long Goal: {longGoal?.title || "—"}
                      </Text>
                    </TouchableOpacity>

                  </TouchableOpacity>
                </View>
              );
            })}

          </View>
        ))}

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({

headerRow:{
  flexDirection:"row",
  alignItems:"center",
  justifyContent:"space-between",
  paddingHorizontal:SPACING.lg,
  paddingTop:SPACING.xl,
  paddingBottom:SPACING.md,
  backgroundColor:COLORS.background,
},

headerText:{
  fontSize:34,
  fontWeight:"900",
  color:COLORS.textPrimary,
},

container:{
  flex:1,
  paddingHorizontal:SPACING.lg,
  backgroundColor:COLORS.background,
},

section:{
  marginBottom:SPACING.lg,
},

dayRow:{
  flexDirection:"row",
  alignItems:"center",
  marginBottom:SPACING.sm
},

dayCardFull:{
  flex:1,
  backgroundColor:"rgba(255,255,255,0.04)",
  borderWidth:1,
  borderColor:"rgba(255,255,255,0.08)",
  padding:SPACING.lg,
  borderRadius:BORDER_RADIUS.xl,
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
},

dayTitle:{
  fontSize:18,
  fontWeight:"800",
  color:COLORS.textPrimary,
},

alarmCard:{
  backgroundColor:"rgba(255,255,255,0.025)",
  borderWidth:1,
  borderColor:"rgba(255,255,255,0.06)",
  padding:SPACING.md,
  borderRadius:BORDER_RADIUS.lg,
  marginLeft:SPACING.md,
  marginTop:SPACING.md,
},

timeRow:{
  flexDirection:"row",
  alignItems:"center",
  justifyContent:"space-between",
  marginBottom:6
},

alarmTime:{
  fontSize:20,
  fontWeight:"900",
  color:COLORS.textPrimary,
},

meta:{
  fontSize:13,
  color:COLORS.textSecondary,
  marginTop:4,
  fontWeight:"600"
},

divider:{
  height:1,
  backgroundColor:"rgba(255,255,255,0.06)",
  marginVertical:SPACING.sm,
},

alarmAccentBar:{
  position:"absolute",
  left:0,
  top:12,
  bottom:12,
  width:4,
  backgroundColor:COLORS.accent,
  borderRadius: 10,
},

criticalAccent:{
  backgroundColor:"#ff4d4d",
  borderRadius: 10,
},

dayAccentBar:{
  position:"absolute",
  left:0,
  top:12,
  bottom:12,
  width:4,
  backgroundColor:COLORS.warning,
  borderRadius: 10,
},

criticalBadge:{
  backgroundColor:"rgba(255,0,0,0.15)",
  borderWidth:1,
  borderColor:"rgba(255,0,0,0.4)",
  paddingVertical:3,
  paddingHorizontal:8,
  borderRadius:12
},

criticalBadgeText:{
  fontSize:10,
  fontWeight:"800",
  color:"#ff4d4d",
},

chevron:{
  fontSize:16,
  color:COLORS.accent,
},

manageToggle:{
  paddingVertical:6,
  paddingHorizontal:14,
  borderRadius:20,
  borderWidth:1,
  borderColor:COLORS.borderLight,
  backgroundColor:"rgba(255,255,255,0.04)"
},

manageToggleActive:{
  backgroundColor:COLORS.warning,
  borderColor:COLORS.warning
},

manageToggleText:{
  fontSize:11,
  fontWeight:"900",
  color:COLORS.textSecondary
},

manageToggleTextActive:{
  color:COLORS.background
},

disableDayBtn:{
//   marginLeft:1,
  backgroundColor:"rgba(255,0,0,0.08)",
  borderWidth:1,
  borderColor:"rgba(255,0,0,0.25)",
  paddingVertical:6,
  paddingHorizontal:14,
  borderRadius:20
},

disableDayText:{
  fontSize:11,
  fontWeight:"900",
  color:"#ff4d4d"
},
manageToggleDisabled: {
  backgroundColor: "rgba(255,255,255,0.04)",
  borderColor: "rgba(255,255,255,0.12)",
  opacity: 0.4,
},

manageToggleTextDisabled: {
  color: COLORS.textMuted,
},

});