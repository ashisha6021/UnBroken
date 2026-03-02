// import React, { useState, useRef } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { cancelAllAlarmsByTaskId } from '../../alarm1/alarmScheduler123';
// import { dbGetTaskAlarmsByTask } from '../../storage/storage-sqlite';

// import { useAppStore } from '../../store/useAppStore';
// import {
//   deleteLongGoalCascade,
//   deleteShortGoalCascade,
//   deleteTaskCascade
// } from '../../storage/new123';

// import PremiumAlertModal from '../../components/PremiumAlertModal';
// import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';

// export default function LosersScreen() {

//   // ✅ SAFE DEFAULTS
//   const {
//     longGoals = [],
//     shortGoals = [],
//     tasks = [],
//     refreshData
//   } = useAppStore();

//   const scrollRef = useRef(null);

//   const lastShortRef = useRef(null);
//   const lastTaskRef = useRef(null);

//   const scrollTarget = useRef({ type: null, id: null });
//   const scrollViewHeight = useRef(0);

//   // ================= AUTO SCROLL =================
//   const handleAutoScroll = (ref, type, id) => {
//     if (
//       scrollTarget.current.type !== type ||
//       scrollTarget.current.id !== id ||
//       !ref?.current ||
//       !scrollRef.current
//     ) return;

//     setTimeout(() => {
//       ref.current.measureLayout(
//         scrollRef.current,
//         (x, y, width, height) => {
//           const visibleHeight = scrollViewHeight.current;
//           const targetScroll = y + height - visibleHeight + 40;

//           scrollRef.current.scrollTo({
//             y: targetScroll > 0 ? targetScroll : 0,
//             animated: true
//           });

//           scrollTarget.current = { type: null, id: null };
//         },
//         () => {}
//       );
//     }, 80);
//   };

//   // ================= STATE =================
//   const [expandedGoals, setExpandedGoals] = useState({});
//   const [expandedShortGoals, setExpandedShortGoals] = useState({});
//   const [confirmModal, setConfirmModal] = useState({
//     visible: false,
//     type: null,
//     id: null,
//     title: '',
//     message: ''
//   });

//   // ================= GROUPED DATA =================
//   const groupedLongGoals = (longGoals || []).map(lg => ({
//     ...lg,
//     shortGoals: (shortGoals || []).filter(
//       sg => sg.longGoalId === lg.id
//     )
//   }));

//   const hasLongGoals = groupedLongGoals.length > 0;

//   const getTasksForShort = (shortId) =>
//     (tasks || []).filter(t => t.shortGoalId === shortId);

//   // ================= DELETE LOGIC =================
//   const cancelAlarmsForTasks = async (taskList = []) => {
//     for (const task of taskList) {
//       if (!task?.id) continue;
//       const alarms = await dbGetTaskAlarmsByTask(task.id);
//       await cancelAllAlarmsByTaskId(task.id, alarms);
//     }
//   };

//   const openDeleteModal = (type, id) => {

//     let title = "Delete";
//     let message = "This cannot be undone.";

//     if (type === "long") {
//       title = "Erase Long Goal?";
//       message = "All short goals and tasks will disappear with it.";
//     }

//     if (type === "short") {
//       title = "Erase Short Goal?";
//       message = "All related tasks will vanish too.";
//     }

//     if (type === "task") {
//       title = "Erase Task?";
//       message = "This task and its progress will be gone.";
//     }

//     setConfirmModal({ visible: true, type, id, title, message });
//   };

//   const executeDelete = async () => {

//     const { type, id } = confirmModal;

//     if (type === "long") {
//       const relatedShortGoals =
//         shortGoals.filter(sg => sg.longGoalId === id);

//       const relatedTasks =
//         tasks.filter(task =>
//           relatedShortGoals.some(sg => sg.id === task.shortGoalId)
//         );

//       await cancelAlarmsForTasks(relatedTasks);
//       await deleteLongGoalCascade(id);
//     }

//     if (type === "short") {
//       const relatedTasks =
//         tasks.filter(t => t.shortGoalId === id);

//       await cancelAlarmsForTasks(relatedTasks);
//       await deleteShortGoalCascade(id);
//     }

//     if (type === "task") {
//       const alarms = await dbGetTaskAlarmsByTask(id);
//       await cancelAllAlarmsByTaskId(id, alarms);
//       await deleteTaskCascade(id);
//     }

//     await refreshData();

//     setConfirmModal({
//       visible: false,
//       type: null,
//       id: null,
//       title: '',
//       message: ''
//     });
//   };

//   // ================= UI =================
//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         ref={scrollRef}
//         style={styles.scroll}
//         onLayout={(e) => {
//           scrollViewHeight.current = e.nativeEvent.layout.height;
//         }}
//       >

//         <View style={styles.headerStyle}>
//           <Text style={styles.headerText}>Broken Promises</Text>
//         </View>

//         {!hasLongGoals && (
//           <Text style={styles.emptyText}>
//             No long goals to delete
//           </Text>
//         )}

//         {hasLongGoals && groupedLongGoals.map(longGoal => {

//           const isExpanded = expandedGoals[longGoal.id];

//           return (
//             <View key={longGoal.id} style={styles.section}>

//               {/* LONG GOAL */}
//               <View style={styles.longCard}>
//                 <View style={styles.longAccent} />
//                 <View style={styles.row}>

//                   <View style={styles.titleBox}>
//                     <Text style={styles.longTitle}>
//                       {longGoal.title}
//                     </Text>
//                   </View>

//                   <TouchableOpacity
//                     style={styles.deleteBtn}
//                     onPress={() =>
//                       openDeleteModal("long", longGoal.id)
//                     }
//                   >
//                     <Text style={styles.deleteTxt}>DEL</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     onPress={() => {
//                       const isOpening = !expandedGoals[longGoal.id];
//                       if (isOpening) {
//                         scrollTarget.current = {
//                           type: "long",
//                           id: longGoal.id
//                         };
//                       }
//                       setExpandedGoals(p => ({
//                         ...p,
//                         [longGoal.id]: !p[longGoal.id]
//                       }));
//                     }}
//                   >
//                     <Text style={styles.chevron1}>
//                       {isExpanded ? "▲" : "▼"}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               {/* SHORT GOALS */}
//               {isExpanded && (longGoal.shortGoals || []).length === 0 && (
//                 <Text style={styles.emptyTextSmall}>
//                   No short goals to delete
//                 </Text>
//               )}

//               {isExpanded && (longGoal.shortGoals || []).map((goal, index) => {

//                 const isShortExpanded = expandedShortGoals[goal.id];
//                 const isLast =
//                   index === longGoal.shortGoals.length - 1;

//                 return (
//                   <View
//                     key={goal.id}
//                     ref={isLast ? lastShortRef : null}
//                     onLayout={
//                       isLast
//                         ? () =>
//                           handleAutoScroll(
//                             lastShortRef,
//                             "long",
//                             longGoal.id
//                           )
//                         : undefined
//                     }
//                     style={styles.shortWrapper}
//                   >

//                     <View style={styles.shortHeader}>
//                       <View style={styles.shortAccent} />

//                       <View style={styles.row}>
//                         <View style={styles.titleBox}>
//                           <Text style={styles.shortTitle}>
//                             {goal.title}
//                           </Text>
//                         </View>

//                         <TouchableOpacity
//                           style={styles.deleteBtn}
//                           onPress={() =>
//                             openDeleteModal("short", goal.id)
//                           }
//                         >
//                           <Text style={styles.deleteTxt}>DEL</Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           onPress={() => {
//                             const isOpening =
//                               !expandedShortGoals[goal.id];

//                             if (isOpening) {
//                               scrollTarget.current = {
//                                 type: "short",
//                                 id: goal.id
//                               };
//                             }

//                             setExpandedShortGoals(p => ({
//                               ...p,
//                               [goal.id]: !p[goal.id]
//                             }));
//                           }}
//                         >
//                           <Text style={styles.chevron}>
//                             {isShortExpanded ? "▲" : "▼"}
//                           </Text>
//                         </TouchableOpacity>
//                       </View>
//                     </View>

//                     {/* TASKS */}
//                     {isShortExpanded &&
//                       getTasksForShort(goal.id).length === 0 && (
//                         <Text style={styles.emptyTextSmall}>
//                           No tasks to delete
//                         </Text>
//                       )}

//                     {isShortExpanded &&
//                       getTasksForShort(goal.id).map((task, index) => {

//                         const isLastTask =
//                           index ===
//                           getTasksForShort(goal.id).length - 1;

//                         return (
//                           <View
//                             key={task.id}
//                             ref={isLastTask ? lastTaskRef : null}
//                             onLayout={
//                               isLastTask
//                                 ? () =>
//                                   handleAutoScroll(
//                                     lastTaskRef,
//                                     "short",
//                                     goal.id
//                                   )
//                                 : undefined
//                             }
//                             style={styles.taskCard}
//                           >
//                             <View style={styles.taskAccent} />

//                             <View style={styles.row}>
//                               <View style={styles.titleBox}>
//                                 <Text style={styles.taskTitle}>
//                                   {task.name}
//                                 </Text>
//                               </View>

//                               <TouchableOpacity
//                                 style={styles.deleteBtn}
//                                 onPress={() =>
//                                   openDeleteModal("task", task.id)
//                                 }
//                               >
//                                 <Text style={styles.deleteTxt}>
//                                   DEL
//                                 </Text>
//                               </TouchableOpacity>
//                             </View>
//                           </View>
//                         );
//                       })}
//                   </View>
//                 );
//               })}
//             </View>
//           );
//         })}
//       </ScrollView>

//       <PremiumAlertModal
//         visible={confirmModal.visible}
//         title={confirmModal.title}
//         message={confirmModal.message}
//         cancelText="Cancel"
//         confirmText="Delete"
//         type="error"
//         onCancel={() =>
//           setConfirmModal({ visible: false })
//         }
//         onConfirm={executeDelete}
//       />
//     </SafeAreaView>
//   );
// }
// const styles = StyleSheet.create({

// container:{ flex:1, backgroundColor:COLORS.background },
// scroll:{ paddingHorizontal:SPACING.lg },

// headerStyle:{ alignItems:"center", paddingVertical:SPACING.xl },
// headerText:{ fontSize:32, fontWeight:"900", color:"#8B2E2E" },

// section:{ marginBottom:SPACING.xl },

// row:{ flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between" },
// titleBox:{ flex:1, paddingRight:8 },

// showMore:{ fontSize:11, color:"rgba(255,255,255,0.4)" },
// chevron1:{ backgroundColor:"rgba(107,31,31,0.15)",
//   paddingHorizontal:10,
//   paddingVertical:4,
//   borderRadius:BORDER_RADIUS.full,
//   borderWidth:1,
//   color:"#6B1F1F",
//   borderColor:COLORS.surfaceElevated,
//   marginLeft:8,
// fontSize:16},
// chevron:{ backgroundColor:"rgba(107,31,31,0.15)",
//   paddingHorizontal:12,
//   paddingVertical:5,
//   borderRadius:BORDER_RADIUS.full,
//   borderWidth:1,
//   color:"#6B1F1F",
//   marginLeft:8,
// fontSize:16},

// deleteBtn:{
//   flexShrink:0,
//   backgroundColor:"rgba(107,31,31,0.15)",
//   paddingHorizontal:12,
//   paddingVertical:5,
//   borderRadius:BORDER_RADIUS.full,
//   borderWidth:1,
//   borderColor:"#6B1F1F",
//   marginLeft:8
// },
// deleteTxt:{ fontSize:11, fontWeight:"900", color:"#A94444" },

// longCard:{ position:"relative", padding:SPACING.lg, borderRadius:BORDER_RADIUS.xl, backgroundColor:COLORS.surfaceElevated },
// shortWrapper:{ marginLeft:SPACING.md, marginTop:SPACING.md },
// shortHeader:{ position:"relative", padding:SPACING.md, borderRadius:BORDER_RADIUS.lg, backgroundColor:"rgba(255,255,255,0.03)" },
// taskCard:{ position:"relative", marginLeft:SPACING.lg, marginTop:SPACING.md, padding:SPACING.md, borderRadius:BORDER_RADIUS.lg, backgroundColor:"rgba(255,255,255,0.05)" },

// longAccent:{ position:"absolute", left:0, top:9, bottom:9, width:4, backgroundColor:"#6B1F1F" },
// shortAccent:{ position:"absolute", left:0,  top:9, bottom:9, width:4, backgroundColor:"#FFFFFF" },
// taskAccent:{ position:"absolute", left:0,  top:9, bottom:9, width:4, backgroundColor:"#0017af" },

// longTitle:{ fontSize:16, fontWeight:"800", color:COLORS.textPrimary },
// shortTitle:{ fontSize:14, fontWeight:"700", color:COLORS.textPrimary },
// taskTitle:{ fontSize:13, fontWeight:"600", color:COLORS.textSecondary },

// emptyText: {
//   textAlign: "center",
//   color: "rgba(255,255,255,0.55)",
//   fontSize: 15,
//   fontWeight: "700",
//   marginTop: SPACING.xl,
//   letterSpacing: 0.6,

//   backgroundColor: "rgba(255,255,255,0.04)",
//   borderWidth: 1,
//   borderColor: "rgba(255,255,255,0.08)",
//   paddingVertical: 14,
//   paddingHorizontal: 18,
//   borderRadius: BORDER_RADIUS.lg,

//   alignSelf: "center",

//   shadowColor: "#000",
//   shadowOpacity: 0.25,
//   shadowRadius: 8,
//   elevation: 3
// },

// emptyTextSmall: {
//   textAlign: "center",
//   color: "rgba(255,255,255,0.45)",
//   fontSize: 13,
//   fontWeight: "600",
//   marginTop: SPACING.sm,
//   marginLeft: SPACING.md,
//   letterSpacing: 0.4,

//   backgroundColor: "rgba(255,255,255,0.03)",
//   borderWidth: 1,
//   borderColor: "rgba(255,255,255,0.06)",
//   paddingVertical: 8,
//   paddingHorizontal: 12,
//   borderRadius: BORDER_RADIUS.full,

//   alignSelf: "flex-start"
// },
// });



import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cancelAllAlarmsByTaskId } from '../../alarm1/alarmScheduler123';
import { dbGetTaskAlarmsByTask } from '../../storage/storage-sqlite';

import { useAppStore } from '../../store/useAppStore';
import {
  deleteLongGoalCascade,
  deleteShortGoalCascade,
  deleteTaskCascade
} from '../../storage/new123';

import PremiumAlertModal from '../../components/PremiumAlertModal';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function LosersScreen() {

  const {
    longGoals = [],
    shortGoals = [],
    tasks = [],
    refreshData
  } = useAppStore();

  const scrollRef = useRef(null);
  const lastShortRef = useRef(null);
  const lastTaskRef = useRef(null);

  const scrollTarget = useRef({ type: null, id: null });
  const scrollViewHeight = useRef(0);

  const handleAutoScroll = (ref, type, id) => {
    if (
      scrollTarget.current.type !== type ||
      scrollTarget.current.id !== id ||
      !ref?.current ||
      !scrollRef.current
    ) return;

    setTimeout(() => {
      ref.current.measureLayout(
        scrollRef.current,
        (x, y, width, height) => {
          const visibleHeight = scrollViewHeight.current;
          const targetScroll = y + height - visibleHeight + 40;

          scrollRef.current.scrollTo({
            y: targetScroll > 0 ? targetScroll : 0,
            animated: true
          });

          scrollTarget.current = { type: null, id: null };
        },
        () => {}
      );
    }, 80);
  };

  const [expandedGoals, setExpandedGoals] = useState({});
  const [expandedShortGoals, setExpandedShortGoals] = useState({});
  const [expandedLongTitle, setExpandedLongTitle] = useState({});
  const [expandedShortTitle, setExpandedShortTitle] = useState({});
  const [expandedTaskTitle, setExpandedTaskTitle] = useState({});
  const [overflowMap, setOverflowMap] = useState({});

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    type: null,
    id: null,
    title: '',
    message: ''
  });

  const detectOverflow = (e, id) => {
    const lines = e.nativeEvent?.lines;
    if (!lines || overflowMap[id] !== undefined) return;

    const lastLine = lines[1]?.text || "";
    const cleaned = lastLine.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

    const isOverflow =
      lines.length === 2 &&
      /…|\.\.\./.test(cleaned);

    setOverflowMap(prev => ({ ...prev, [id]: isOverflow }));
  };

  const groupedLongGoals = longGoals.map(lg => ({
    ...lg,
    shortGoals: shortGoals.filter(
      sg => sg.longGoalId === lg.id
    )
  }));

  const getTasksForShort = (shortId) =>
    tasks.filter(t => t.shortGoalId === shortId);

  const cancelAlarmsForTasks = async (taskList = []) => {
    for (const task of taskList) {
      if (!task?.id) continue;
      const alarms = await dbGetTaskAlarmsByTask(task.id);
      await cancelAllAlarmsByTaskId(task.id, alarms);
    }
  };

  const openDeleteModal = (type, id) => {
    let title = "Delete";
    let message = "This cannot be undone.";

    if (type === "long") {
      title = "Erase Long Goal?";
      message = "All short goals and tasks will disappear with it.";
    }

    if (type === "short") {
      title = "Erase Short Goal?";
      message = "All related tasks will vanish too.";
    }

    if (type === "task") {
      title = "Erase Task?";
      message = "This task and its progress will be gone.";
    }

    setConfirmModal({ visible: true, type, id, title, message });
  };

  const executeDelete = async () => {

    const { type, id } = confirmModal;

    if (type === "long") {
      const relatedShortGoals =
        shortGoals.filter(sg => sg.longGoalId === id);

      const relatedTasks =
        tasks.filter(task =>
          relatedShortGoals.some(sg => sg.id === task.shortGoalId)
        );

      await cancelAlarmsForTasks(relatedTasks);
      await deleteLongGoalCascade(id);
    }

    if (type === "short") {
      const relatedTasks =
        tasks.filter(t => t.shortGoalId === id);

      await cancelAlarmsForTasks(relatedTasks);
      await deleteShortGoalCascade(id);
    }

    if (type === "task") {
      const alarms = await dbGetTaskAlarmsByTask(id);
      await cancelAllAlarmsByTaskId(id, alarms);
      await deleteTaskCascade(id);
    }

    await refreshData();

    setConfirmModal({
      visible: false,
      type: null,
      id: null,
      title: '',
      message: ''
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        onLayout={(e) => {
          scrollViewHeight.current = e.nativeEvent.layout.height;
        }}
      >

        <View style={styles.headerStyle}>
          <Text style={styles.headerText}>Broken Promises</Text>
        </View>

        {groupedLongGoals.map(longGoal => {

          const isExpanded = expandedGoals[longGoal.id];

          return (
            <View key={longGoal.id} style={styles.section}>

              <View style={styles.longCard}>
                <View style={styles.longAccent} />
                <View style={styles.row}>

                  <View style={styles.titleBox}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        setExpandedLongTitle(prev => ({
                          ...prev,
                          [longGoal.id]: !prev[longGoal.id]
                        }))
                      }
                    >
                      <Text
                        style={styles.longTitle}
                        numberOfLines={expandedLongTitle[longGoal.id] ? undefined : 2}
                        ellipsizeMode="tail"
                        onTextLayout={(e) => detectOverflow(e, `long-${longGoal.id}`)}
                      >
                        {longGoal.title}
                      </Text>

                      {overflowMap[`long-${longGoal.id}`] && (
                        <Text style={styles.showMoreText}>
                          {expandedLongTitle[longGoal.id] ? "Show less ▲" : "Show more ▼"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => openDeleteModal("long", longGoal.id)}
                  >
                    <Text style={styles.deleteTxt}>DEL</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      const isOpening = !expandedGoals[longGoal.id];
                      if (isOpening) {
                        scrollTarget.current = {
                          type: "long",
                          id: longGoal.id
                        };
                      }
                      setExpandedGoals(p => ({
                        ...p,
                        [longGoal.id]: !p[longGoal.id]
                      }));
                    }}
                  >
                    <Text style={styles.chevron1}>
                      {isExpanded ? "▲" : "▼"}
                    </Text>
                  </TouchableOpacity>

                </View>
              </View>

              {isExpanded && longGoal.shortGoals.length === 0 && (
                <Text style={styles.emptyTextSmall}>
                  No short goals to delete
                </Text>
              )}

              {isExpanded && longGoal.shortGoals.map((goal, index) => {

                const isShortExpanded = expandedShortGoals[goal.id];
                const isLast = index === longGoal.shortGoals.length - 1;

                return (
                  <View
                    key={goal.id}
                    ref={isLast ? lastShortRef : null}
                    onLayout={
                      isLast
                        ? () => handleAutoScroll(lastShortRef, "long", longGoal.id)
                        : undefined
                    }
                    style={styles.shortWrapper}
                  >

                    <View style={styles.shortHeader}>
                      <View style={styles.shortAccent} />
                      <View style={styles.row}>

                        <View style={styles.titleBox}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                              setExpandedShortTitle(prev => ({
                                ...prev,
                                [goal.id]: !prev[goal.id]
                              }))
                            }
                          >
                            <Text
                              style={styles.shortTitle}
                              numberOfLines={expandedShortTitle[goal.id] ? undefined : 2}
                              ellipsizeMode="tail"
                              onTextLayout={(e) => detectOverflow(e, `short-${goal.id}`)}
                            >
                              {goal.title}
                            </Text>

                            {overflowMap[`short-${goal.id}`] && (
                              <Text style={styles.showMoreText}>
                                {expandedShortTitle[goal.id] ? "Show less ▲" : "Show more ▼"}
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => openDeleteModal("short", goal.id)}
                        >
                          <Text style={styles.deleteTxt}>DEL</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            const isOpening = !expandedShortGoals[goal.id];

                            if (isOpening) {
                              scrollTarget.current = {
                                type: "short",
                                id: goal.id
                              };
                            }

                            setExpandedShortGoals(p => ({
                              ...p,
                              [goal.id]: !p[goal.id]
                            }));
                          }}
                        >
                          <Text style={styles.chevron}>
                            {isShortExpanded ? "▲" : "▼"}
                          </Text>
                        </TouchableOpacity>

                      </View>
                    </View>

                    {isShortExpanded && getTasksForShort(goal.id).length === 0 && (
                      <Text style={styles.emptyTextSmall}>
                        No tasks to delete
                      </Text>
                    )}

                    {isShortExpanded &&
                      getTasksForShort(goal.id).map((task, index) => {

                        const isLastTask =
                          index === getTasksForShort(goal.id).length - 1;

                        return (
                          <View
                            key={task.id}
                            ref={isLastTask ? lastTaskRef : null}
                            onLayout={
                              isLastTask
                                ? () =>
                                  handleAutoScroll(
                                    lastTaskRef,
                                    "short",
                                    goal.id
                                  )
                                : undefined
                            }
                            style={styles.taskCard}
                          >
                            <View style={styles.taskAccent} />

                            <View style={styles.row}>

                              <View style={styles.titleBox}>
                                <TouchableOpacity
                                  activeOpacity={0.8}
                                  onPress={() =>
                                    setExpandedTaskTitle(prev => ({
                                      ...prev,
                                      [task.id]: !prev[task.id]
                                    }))
                                  }
                                >
                                  <Text
                                    style={styles.taskTitle}
                                    numberOfLines={expandedTaskTitle[task.id] ? undefined : 2}
                                    ellipsizeMode="tail"
                                    onTextLayout={(e) => detectOverflow(e, `task-${task.id}`)}
                                  >
                                    {task.name}
                                  </Text>

                                  {overflowMap[`task-${task.id}`] && (
                                    <Text style={styles.showMoreText}>
                                      {expandedTaskTitle[task.id] ? "Show less ▲" : "Show more ▼"}
                                    </Text>
                                  )}
                                </TouchableOpacity>
                              </View>

                              <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => openDeleteModal("task", task.id)}
                              >
                                <Text style={styles.deleteTxt}>DEL</Text>
                              </TouchableOpacity>

                            </View>

                          </View>
                        );
                      })}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <PremiumAlertModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        cancelText="Cancel"
        confirmText="Delete"
        type="error"
        onCancel={() => setConfirmModal({ visible: false })}
        onConfirm={executeDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

container:{ flex:1, backgroundColor:COLORS.background },
scroll:{ paddingHorizontal:SPACING.lg },

headerStyle:{ alignItems:"center", paddingVertical:SPACING.xl },
headerText:{ fontSize:32, fontWeight:"900", color:"#8B2E2E" },

section:{ marginBottom:SPACING.xl },

row:{ flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between" },
titleBox:{ flex:1, paddingRight:8 },

showMore:{ fontSize:11, color:"rgba(255,255,255,0.4)" },
chevron1:{ backgroundColor:"rgba(107,31,31,0.15)",
  paddingHorizontal:10,
  paddingVertical:4,
  borderRadius:BORDER_RADIUS.full,
  borderWidth:1,
  color:"#6B1F1F",
  borderColor:COLORS.surfaceElevated,
  marginLeft:8,
fontSize:16},
chevron:{ backgroundColor:"rgba(107,31,31,0.15)",
  paddingHorizontal:12,
  paddingVertical:5,
  borderRadius:BORDER_RADIUS.full,
  borderWidth:1,
  color:"#6B1F1F",
  marginLeft:8,
fontSize:16},

deleteBtn:{
  flexShrink:0,
  backgroundColor:"rgba(107,31,31,0.15)",
  paddingHorizontal:12,
  paddingVertical:5,
  borderRadius:BORDER_RADIUS.full,
  borderWidth:1,
  borderColor:"#6B1F1F",
  marginLeft:8
},
deleteTxt:{ fontSize:11, fontWeight:"900", color:"#A94444" },

longCard:{ position:"relative", padding:SPACING.lg, borderRadius:BORDER_RADIUS.xl, backgroundColor:COLORS.surfaceElevated },
shortWrapper:{ marginLeft:SPACING.md, marginTop:SPACING.md },
shortHeader:{ position:"relative", padding:SPACING.md, borderRadius:BORDER_RADIUS.lg, backgroundColor:"rgba(255,255,255,0.03)" },
taskCard:{ position:"relative", marginLeft:SPACING.lg, marginTop:SPACING.md, padding:SPACING.md, borderRadius:BORDER_RADIUS.lg, backgroundColor:"rgba(255,255,255,0.05)" },

longAccent:{ position:"absolute", left:0, top:9, bottom:9, width:4, backgroundColor:"#6B1F1F" },
shortAccent:{ position:"absolute", left:0,  top:9, bottom:9, width:4, backgroundColor:"#FFFFFF" },
taskAccent:{ position:"absolute", left:0,  top:9, bottom:9, width:4, backgroundColor:"#0017af" },

longTitle:{ fontSize:16, fontWeight:"800", color:COLORS.textPrimary },
shortTitle:{ fontSize:14, fontWeight:"700", color:COLORS.textPrimary },
taskTitle:{ fontSize:13, fontWeight:"600", color:COLORS.textSecondary },

emptyText: {
  textAlign: "center",
  color: "rgba(255,255,255,0.55)",
  fontSize: 15,
  fontWeight: "700",
  marginTop: SPACING.xl,
  letterSpacing: 0.6,

  backgroundColor: "rgba(255,255,255,0.04)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
  paddingVertical: 14,
  paddingHorizontal: 18,
  borderRadius: BORDER_RADIUS.lg,

  alignSelf: "center",

  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 3
},

emptyTextSmall: {
  textAlign: "center",
  color: "rgba(255,255,255,0.45)",
  fontSize: 13,
  fontWeight: "600",
  marginTop: SPACING.sm,
  marginLeft: SPACING.md,
  letterSpacing: 0.4,

  backgroundColor: "rgba(255,255,255,0.03)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.06)",
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: BORDER_RADIUS.full,

  alignSelf: "flex-start"
},
showMoreText:{
  fontSize:12,
  color:COLORS.textMuted,
  marginTop:4
},
});
