import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    
    if (!user) {
        // Reindirizza al login se l'utente non è autenticato
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default ProtectedRoute;