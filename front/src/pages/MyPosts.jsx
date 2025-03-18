import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import PostCard from '../components/PostCard';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts?author=${user._id}`);
      setPosts(response.data.posts);
    } catch (err) {
      console.error('Errore nel caricamento dei post:', err);
      setError('Errore nel caricamento dei tuoi post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyPosts();
    }
  }, [user]);

  const handleDelete = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      fetchMyPosts(); // Ricarica i post dopo l'eliminazione
    } catch (err) {
      setError('Errore durante la eliminazione del post');
    }
  };

  if (loading) return <Container className="mt-4"><p>Caricamento...</p></Container>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">I Miei Post</h2>
      <Row>
        {posts.length > 0 ? (
          posts.map(post => (
            <Col key={post._id} md={4} className="mb-4">
              <PostCard 
                post={post}
                showActions={true}
                onDelete={() => handleDelete(post._id)}
              />
            </Col>
          ))
        ) : (
          <Col>
            <p>Non hai ancora pubblicato nessun post</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default MyPosts;