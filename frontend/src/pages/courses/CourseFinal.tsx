import { useParams, useNavigate } from 'react-router-dom';
import FinalQuizModal from '../../components/courses/FinalQuizModal';

export default function CourseFinalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return null;

  return (
    <FinalQuizModal
      open
      courseId={id}
      onClose={() => navigate(`/courses/${id}`)}
      onSubmitted={() => navigate(`/courses/${id}`)}
    />
  );
}
