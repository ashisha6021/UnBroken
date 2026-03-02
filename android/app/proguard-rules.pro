# ================================
# ✅ React Native Default Rules
# ================================

# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Prevent stripping of native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep annotations
-keepattributes *Annotation*

# ================================
# ✅ Realm Rules (IMPORTANT)
# ================================

# Realm uses reflection heavily
-keep class io.realm.** { *; }
-keep class org.bson.** { *; }
-dontwarn io.realm.**
-dontwarn org.bson.**

# Keep model classes (Realm schema)
-keep class com.unbrokenrna.** { *; }

# ================================
# ✅ React Navigation Safe Rules
# ================================

-dontwarn androidx.navigation.**

# ================================
# ✅ AsyncStorage + NetInfo Rules
# ================================

-dontwarn com.reactnativecommunity.**

# ================================
# ✅ Keep Debugging Symbols (Optional)
# ================================

# Remove logs in release (optional)
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# ================================
# ✅ General Safety
# ================================

# Don't warn for missing optional deps
-dontwarn javax.annotation.**
-dontwarn kotlin.**

-keepclassmembers class * extends io.realm.RealmObject {
    <fields>;
}
