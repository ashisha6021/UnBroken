# Storage Architecture

## Database: SQLite (expo-sqlite)

The app now uses **SQLite** for persistent data storage, which is perfect for storing 3+ years of data.

### Why SQLite?

✅ **Unlimited storage** - Can handle years of data (limited only by device storage)
✅ **Fast queries** - Indexed database for quick lookups
✅ **Relational data** - Proper foreign keys and relationships
✅ **Data integrity** - ACID transactions ensure data consistency
✅ **Efficient** - Optimized for mobile devices
✅ **Persistent** - Data survives app updates and restarts

### Database Schema

The database includes the following tables:

1. **users** - User profile information
2. **long_goals** - Long-term goals
3. **short_goals** - Short-term goals (linked to long-term)
4. **tasks** - Daily tasks (linked to short-term goals)
5. **task_logs** - Daily completion records (can grow to thousands)
6. **reward_rules** - User-defined reward rules
7. **punishment_rules** - User-defined punishment rules
8. **break_days** - Scheduled break days

### Indexes

The database includes indexes on:
- `task_logs.date` - For fast date-based queries
- `task_logs.taskId` - For task-specific queries
- `short_goals.longGoalId` - For goal hierarchy queries
- `tasks.shortGoalId` - For task-to-goal relationships

### Data Retention

- **Task logs** are stored indefinitely (can accumulate over 3+ years)
- All data is stored locally on the device
- No data expiration - everything is kept unless manually deleted
- Database file: `unbroken.db` in the app's document directory

### Migration from AsyncStorage

The app has been migrated from AsyncStorage to SQLite. The old `storage/storage.js` file is kept for reference but is no longer used. All imports now point to `storage/storage-sqlite.js`.

### Performance

- **Query speed**: Milliseconds even with thousands of records
- **Storage efficiency**: SQLite compresses data efficiently
- **Memory usage**: Only loads what's needed
- **Scalability**: Can handle 100,000+ task logs without performance issues

### Backup & Export

For future enhancements, you can:
- Export the SQLite database file
- Create backup functionality
- Sync to cloud storage (if needed)
