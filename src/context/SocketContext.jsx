import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../services/socketService";
import { getAuthUser, getToken } from "../services/authState";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const user = getAuthUser();
    const token = getToken();
    const currentUserId = user?.id || user?._id;

    if (currentUserId && token) {
      const s = connectSocket(token);
      setSocket(s);
    } else {
      disconnectSocket();
      setSocket(null);
    }
  }, [location.pathname]); // Re-evaluate auth when navigation happens (login/logout redirects)

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
