import { useState, useEffect } from 'react';
import { Container, Row, Col, Pagination } from 'react-bootstrap';
import axios from 'axios';
import PostCard from '../components/PostCard';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3100/posts?page=${currentPage}&limit=6`);
        setPosts(response.data.posts);
        setTotalPages(response.data.totalPages);
        setError(null);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Errore nel caricamento dei post');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [currentPage]); // Aggiunto currentPage come dipendenza

  return (
    <Container className="mt-5">
      {loading && <p>Caricamento in corso...</p>}
      {error && <p className="text-danger">{error}</p>}
      <Row>
        {!loading && posts && posts.length > 0 ? (
          posts.map(post => (
            <Col key={post._id} md={4} className="mb-4">
              <PostCard post={post} />
            </Col>
          ))
        ) : (
          <Col>
            <p>Nessun post disponibile</p>
          </Col>
        )}
      </Row>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item 
                key={idx + 1} 
                active={idx + 1 === currentPage} 
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default Home;