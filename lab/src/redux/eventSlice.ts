import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define Event type
export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  rsvpCount: number;
}

// Define State type
interface EventState {
  events: Event[];
}

// Initial state with sample events
const initialState: EventState = {
  events: [
    {
      id: "1",
      title: "Community Meetup",
      date: "Mar 12, 2026",
      location: "Town Hall",
      rsvpCount: 0,
    },
    {
      id: "2",
      title: "Workshop: RN Basics",
      date: "Apr 2, 2026",
      location: "Tech Center",
      rsvpCount: 0,
    },
    {
      id: "3",
      title: "Music Night",
      date: "May 20, 2026",
      location: "Central Park",
      rsvpCount: 0,
    },
  ],
};

// Create the slice
const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    // Increment RSVP count for a specific event
    incrementRSVP: (state, action: PayloadAction<string>) => {
      const event = state.events.find((e) => e.id === action.payload);
      if (event) {
        event.rsvpCount += 1;
      }
    },
  },
});

// Export action creators
export const { incrementRSVP } = eventSlice.actions;

// Export reducer
export default eventSlice.reducer;
