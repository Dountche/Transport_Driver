import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ticketService } from '../services/tickets';
import { websocketService } from '../services/websocket';

const TicketContext = createContext();

const ticketReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TICKETS':
      return { ...state, tickets: action.payload, loading: false };
    case 'ADD_TICKET':
      return { ...state, tickets: [action.payload, ...state.tickets] };
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(ticket =>
          ticket.id === action.payload.id ? { ...ticket, ...action.payload.updates } : ticket
        )
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  tickets: [],
  loading: false,
  error: null,
};

export const TicketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ticketReducer, initialState);

  useEffect(() => {
    // Écouter les événements WebSocket
    websocketService.on('ticketValidated', handleTicketValidated);
    websocketService.on('paymentConfirmed', handlePaymentConfirmed);
    
    return () => {
      websocketService.off('ticketValidated', handleTicketValidated);
      websocketService.off('paymentConfirmed', handlePaymentConfirmed);
    };
  }, []);

  const handleTicketValidated = (data) => {
    dispatch({ type: 'ADD_TICKET', payload: data.ticket });
  };

  const handlePaymentConfirmed = (data) => {
    dispatch({ 
      type: 'UPDATE_TICKET', 
      payload: { 
        id: data.ticket.id, 
        updates: { statut_payer: true } 
      } 
    });
  };

  const loadTickets = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    const result = await ticketService.getDriverTickets();
    
    if (result.success) {
      dispatch({ type: 'SET_TICKETS', payload: result.data.tickets || [] });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.message });
    }

    return result;
  };

  const validateTicket = async (qrCode) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    const result = await ticketService.validateTicket(qrCode);
    
    dispatch({ type: 'SET_LOADING', payload: false });
    
    if (result.success && result.ticket) {
      dispatch({ type: 'ADD_TICKET', payload: result.ticket });
    } else if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.message });
    }

    return result;
  };

  const confirmCashPayment = async (ticketId, montant) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    const result = await ticketService.confirmCashPayment(ticketId, montant);
    
    if (result.success) {

      dispatch({ 
        type: 'UPDATE_TICKET', 
        payload: { 
          id: ticketId, 
          updates: { statut_payer: true } 
        } 
      });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.message });
    }

    dispatch({ type: 'SET_LOADING', payload: false });
    return result;
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    loadTickets,
    validateTicket,
    confirmCashPayment,
    clearError,
  };

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};