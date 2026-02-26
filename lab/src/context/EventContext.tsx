import React, { createContext, useReducer, useContext, ReactNode } from "react";

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

// Define Action types
type EventAction = { type: "INCREMENT_RSVP"; payload: string };

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

// Reducer function
const eventReducer = (state: EventState, action: EventAction): EventState => {
  switch (action.type) {
    case "INCREMENT_RSVP":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload
            ? { ...event, rsvpCount: event.rsvpCount + 1 }
            : event,
        ),
      };
    default:
      return state;
  }
};

// Context type
interface EventContextType {
  events: Event[];
  incrementRSVP: (eventId: string) => void;
}

// Create Context
export const EventContext = createContext<EventContextType | undefined>(
  undefined,
);

// Provider Props
interface EventProviderProps {
  children: ReactNode;
}

// EventProvider component
export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  const incrementRSVP = (eventId: string) => {
    dispatch({ type: "INCREMENT_RSVP", payload: eventId });
  };

  return (
    <EventContext.Provider value={{ events: state.events, incrementRSVP }}>
      {children}
    </EventContext.Provider>
  );
};

// Custom hook for using EventContext
export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
};
