# Feed Component Documentation

The Feed component displays a timeline of activities for group members, showing moods and tasks in chronological order.

## Features

- **Mood Sharing**: Users can share how they're feeling by selecting from 5 different mood icons.
- **Task Tracking**: Displays tasks that users have started or completed.
- **Filtering Options**:
  - By time period (All Time, Today, This Week, This Month)
  - By people (Everyone, Family Members, Me Only)
  - By activity type (All Activities, Moods Only, Tasks Only)
- **Timeline View**: Activities are grouped by date with "Today", "Yesterday" and date labels.
- **Pull-to-Refresh**: Users can pull down to refresh the feed.
- **Empty States**: Proper handling of empty feed with user-friendly messages.

## Usage

The feed component is accessible from the bottom tab navigation and works alongside the other tabs in the application.

## Components

The feed system consists of several UI components:

1. **Feed** - The main component (`feed.tsx`)
2. **FeedItemCard** - Individual feed items
3. **MoodIcon** - Icons for representing moods
4. **TimelineMarker** - Visual indicators for the timeline
5. **Dropdown** - Filter dropdowns
6. **EmptyState** - Empty state placeholder

## Data Structure

Each feed item contains:
- ID
- Type (mood or task)
- Timestamp
- User information
- Type-specific details (mood value or task details)

## Future Enhancements

Potential future improvements:
- Add ability to comment on feed items
- Add reactions/likes to feed items
- Implement real-time updates
- Add photo sharing capabilities
- Expand mood tracking with more detailed options
