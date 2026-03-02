import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { formatDateDisplay } from '../../utils/dateHelpers';

export default function ShortGoalsList({ navigation }) {

  const { shortGoals, longGoals } = useAppStore();

  const [expandedGoals, setExpandedGoals] = useState({});
  const [expandedShortTitle, setExpandedShortTitle] = useState({});
  const [expandedLongTitle, setExpandedLongTitle] = useState({});
  const [shortOverflow, setShortOverflow] = useState({});
  const [longOverflow, setLongOverflow] = useState({});
  const shortTitleMapRef = useRef({});

const longTitleMapRef = useRef({});

  const scrollRef = useRef(null);
  const lastShortRef = useRef(null);
  const scrollTarget = useRef(null);
  const scrollViewHeight = useRef(0);
  useEffect(() => {
  const updated = {};

  shortGoals.forEach(goal => {
    const prev = shortTitleMapRef.current[goal.id];

    if (prev !== goal.title) {
      shortTitleMapRef.current[goal.id] = goal.title;
      updated[goal.id] = true;
    }
  });

  if (Object.keys(updated).length > 0) {
    setShortOverflow(prev => {
      const copy = { ...prev };
      Object.keys(updated).forEach(id => delete copy[id]);
      return copy;
    });
  }
}, [shortGoals]);

useEffect(() => {
  const updated = {};

  longGoals.forEach(goal => {
    const prev = longTitleMapRef.current[goal.id];

    if (prev !== goal.title) {
      longTitleMapRef.current[goal.id] = goal.title;
      updated[goal.id] = true;
    }
  });

  if (Object.keys(updated).length > 0) {
    setLongOverflow(prev => {
      const copy = { ...prev };
      Object.keys(updated).forEach(id => delete copy[id]);
      return copy;
    });
  }
}, [longGoals]);
 


  const toggleExpand = (id) => {
    const isOpening = !expandedGoals[id];
    if (isOpening) scrollTarget.current = id;

    setExpandedGoals(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleLastShortLayout = () => {
    if (!scrollTarget.current || !lastShortRef.current || !scrollRef.current) return;

    setTimeout(() => {
      lastShortRef.current.measureLayout(
        scrollRef.current,
        (x, y, width, height) => {

          const visibleHeight = scrollViewHeight.current;
          const targetScroll = y + height - visibleHeight + 50;

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
const detectOverflow = (e, id, setter, store) => {
  const lines = e.nativeEvent?.lines;
  if (!lines) return;

  if (store[id] !== undefined) return;

  const lastLine = lines[1]?.text || "";

  const cleaned = lastLine
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  const isOverflow =
    lines.length === 2 &&
    /…|\.\.\./.test(cleaned);

  setter(prev => ({ ...prev, [id]: isOverflow }));
};
  const groupedShortGoals = longGoals.map(longGoal => ({
    ...longGoal,
    shortGoals: shortGoals.filter(sg => sg.longGoalId === longGoal.id),
  }));

  return (
    <>
      <View style={styles.headerStyle}>
        <Text style={styles.headerText}>Short Goal List</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.container}
        onLayout={(e) => {
          scrollViewHeight.current = e.nativeEvent.layout.height;
        }}
      >

        {groupedShortGoals.map(longGoal => {

          const isExpanded = expandedGoals[longGoal.id];
          const shortList = longGoal.shortGoals;

          return (
            <View key={longGoal.id} style={styles.section}>

              {/* LONG GOAL */}
              <View style={styles.longGoalCard}>
                <View style={styles.taskAccentBar2} />

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
                  key={longGoal.id + longGoal.title}
                  style={styles.longGoalTitle}
                    numberOfLines={expandedLongTitle[longGoal.id] ? undefined : 2}
                   onTextLayout={(e) =>
                          detectOverflow(
                            e,
                            longGoal.id,
                            setLongOverflow,
                            longOverflow,
                       )
                        }
                  >
                    {longGoal.title}
                  </Text>

                  {longOverflow[longGoal.id] && (
                    <Text style={styles.showMoreText}>
                      {expandedLongTitle[longGoal.id] ? "Show less ▲" : "Show more ▼"}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.divider} />

                <View style={styles.longGoalBottomRow}>
                  <Text style={styles.goalDeadline}>
                    Deadline: {longGoal.deadline ? formatDateDisplay(longGoal.deadline) : "—"}
                  </Text>

                  <View style={styles.longGoalBottomRight}>
                    <TouchableOpacity
                      style={styles.addShortGoalButton}
                      onPress={() =>
                        navigation.navigate("Short-Goal Setting", {
                          longGoalId: longGoal.id,
                        })
                      }
                    >
                      <Text style={styles.addShortGoalText}>+ Short Goal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => toggleExpand(longGoal.id)}>
                      <Text style={styles.chevron}>
                        {isExpanded ? "▲" : "▼"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* SHORT GOALS */}
              {isExpanded && shortList.map((goal, index) => {

                const isLast = index === shortList.length - 1;

                return (
                  <View
                    key={goal.id + goal.title}
                    ref={isLast ? lastShortRef : null}
                    onLayout={isLast ? handleLastShortLayout : undefined}
                    style={styles.shortGoalCard}
                  >

                    <View style={styles.taskAccentBar} />

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
                        key={goal.id + goal.title}
                        style={styles.shortGoalTitle}
                        numberOfLines={expandedShortTitle[goal.id] ? undefined : 2}
                       onTextLayout={(e) =>
                          detectOverflow(
                            e,
                            goal.id,
                            setShortOverflow,
                            shortOverflow,
                          )
                        }
                      >
                        {goal.title}
                      </Text>

                      {shortOverflow[goal.id] && (
                        <Text style={styles.showMoreText}>
                          {expandedShortTitle[goal.id] ? "Show less ▲" : "Show more ▼"}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <View style={styles.shortGoalBottomRow}>
                      <Text style={styles.shortGoalDeadline}>
                        Deadline: {goal.deadline ? formatDateDisplay(goal.deadline) : "—"}
                      </Text>

                      <View style={styles.shortGoalActions}>

                        <View style={styles.completionBadge}>
                          <Text style={styles.completionText}>
                            {Math.round(goal.completionPercentage || 0)}%
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() =>
                            navigation.navigate("Short-Goal Setting", {
                              editingGoalId: goal.id,
                            })
                          }
                        >
                          <Text style={styles.editButtonText}>EDIT</Text>
                        </TouchableOpacity>

                      </View>
                    </View>

                  </View>
                );
              })}

            </View>
          );
        })}

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({

headerStyle:{
  alignItems:"center",
  paddingTop:SPACING.xl,
  paddingBottom:SPACING.lg,
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
  marginBottom:SPACING.xl,
},

longGoalCard:{
  backgroundColor:COLORS.surfaceElevated,
  padding:SPACING.lg,
  borderRadius:BORDER_RADIUS.xl,
},

longGoalTitle:{
  fontSize:16,
  fontWeight:"800",
  color:COLORS.textPrimary,
},

divider:{
  height:1,
  backgroundColor:"rgba(255,255,255,0.06)",
  marginVertical:SPACING.sm,
},

longGoalBottomRow:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
},

goalDeadline:{
  fontSize:12,
  color:COLORS.textSecondary,
  fontWeight: "600",
},

longGoalBottomRight:{
  flexDirection:"row",
  alignItems:"center",
},

addShortGoalButton:{
  backgroundColor:COLORS.accent,
  paddingHorizontal:18,
  paddingVertical:8,
  borderRadius:BORDER_RADIUS.full,
  marginRight:8,
},

addShortGoalText:{
  fontSize:13,
  fontWeight:"800",
  color:COLORS.background,
},

chevron:{
  fontSize:16,
  color:COLORS.accent,
},

shortGoalCard:{
  backgroundColor:"rgba(255,255,255,0.03)",
  padding:SPACING.md,
  borderRadius:BORDER_RADIUS.lg,
  marginLeft:SPACING.md,
  marginTop:SPACING.md,
},

shortGoalTitle:{
  fontSize:14,
  fontWeight:"700",
  color:COLORS.textPrimary,
},

shortGoalBottomRow:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
},

shortGoalDeadline:{
  fontSize:12,
  color:COLORS.textMuted,
  fontWeight: "600",
},

shortGoalActions:{
  flexDirection:"row",
  alignItems:"center",
  gap:SPACING.sm,
},

completionBadge:{
  backgroundColor:"rgba(0,255,136,0.15)",
  borderWidth:1,
  borderColor:COLORS.accent,
  paddingHorizontal:12,
  paddingVertical:5,
  borderRadius:BORDER_RADIUS.full,
},

completionText:{
  fontSize:12,
  fontWeight:"800",
  color:COLORS.accent,
},

editButton:{
  backgroundColor: COLORS.accent,
  paddingHorizontal: 16,
  paddingVertical: 7,
  borderRadius: BORDER_RADIUS.full,
  shadowColor: COLORS.accent,
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 4,
},

editButtonText:{
  fontSize: 12,
  fontWeight: "900",
  color: COLORS.background,
  letterSpacing: 0.6,
},

taskAccentBar:{
  position:"absolute",
  left:0,
  top:12,
  bottom:12,
  width:4,
  backgroundColor:COLORS.accent,
},

taskAccentBar2:{
  position:"absolute",
  left:0,
  top:12,
  bottom:12,
  width:4,
  backgroundColor:COLORS.warning,
},

showMoreText:{
  fontSize:12,
  color:COLORS.textMuted,
  marginTop:4,
}

});