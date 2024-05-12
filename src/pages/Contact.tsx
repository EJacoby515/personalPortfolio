import React, { useState } from 'react';

interface Comment {
  id: number;
  content: string;
}

const Contact: React.FC = () => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() !== '') {
      const newComment: Comment = {
        id: Date.now(),
        content: comment,
      };
      setComments([...comments, newComment]);
      setComment('');
    }
  };

  return (
    <div className="contact">
      <h1>Contact</h1>
      <section className="contact-form">
        <h2>Leave a Comment or Suggestion</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment or suggestion"
            required
          ></textarea>
          <button type="submit">Submit</button>
        </form>
      </section>
      <section className="comments-section">
        <h2>Comments and Suggestions</h2>
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>{comment.content}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Contact;