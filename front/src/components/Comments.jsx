import { useState, useEffect } from 'react';
import { Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Comments = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');
    const { user } = useAuth();

    const fetchComments = async () => {
        try {
            const response = await axios.get(`https://striveblog-7rn9.onrender.com/comments/post/${postId}`);
            setComments(response.data);
        } catch (err) {
            setError('Errore nel caricamento dei commenti');
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://striveblog-7rn9.onrender.com/comments', {
                content: newComment,
                author: user._id,
                post: postId
            });
            setComments([response.data, ...comments]);
            setNewComment('');
            setError('');
        } catch (err) {
            setError('Errore durante l\'invio del commento');
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await axios.delete(`https://striveblog-7rn9.onrender.com/comments/${commentId}`);
            setComments(comments.filter(comment => comment._id !== commentId));
        } catch (err) {
            setError('Errore durante l\'eliminazione del commento');
        }
    };

    return (
        <div className="mt-5">
            <h4>Commenti</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            
            {user && (
                <Form onSubmit={handleSubmit} className="mb-4">
                    <Form.Group className="mb-3">
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Scrivi un commento..."
                            required
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary">
                        Pubblica commento
                    </Button>
                </Form>
            )}

            <ListGroup className="mt-4">
                {comments.map(comment => (
                    <ListGroup.Item key={comment._id} className="d-flex justify-content-between align-items-start">
                        <div className="ms-2 me-auto">
                            <div className="fw-bold">
                                {comment.author.firstName} {comment.author.lastName}
                            </div>
                            {comment.content}
                            <div className="text-muted small">
                                {new Date(comment.createdAt).toLocaleString()}
                            </div>
                        </div>
                        {user && user._id === comment.author._id && (
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(comment._id)}
                            >
                                Elimina
                            </Button>
                        )}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
};

export default Comments;