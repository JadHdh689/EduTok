import React, { lazy, Suspense } from 'react';
import { type RouteObject, useParams } from 'react-router-dom';

const MyCoursesList = lazy(() => import('../components/profile/MyCoursesList'));
const CourseBuilder = lazy(() => import('../components/courses/CourseBuilder'));

// Adapter to pull :id from the URL and pass it to CourseBuilder
function CourseBuilderWithParam() {
  const { id } = useParams();
  return <CourseBuilder courseId={id} />;
}

const withSuspense = (el: React.ReactElement) => (
  <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>{el}</Suspense>
);

export const profileCoursesRoutes: RouteObject[] = [
  { path: '/profile/courses', element: withSuspense(<MyCoursesList />) },
  { path: '/profile/courses/new', element: withSuspense(<CourseBuilder />) },
  { path: '/profile/courses/:id/edit', element: withSuspense(<CourseBuilderWithParam />) },
];
