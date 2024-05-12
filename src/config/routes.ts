import { Home, About, Projects, Contact } from '../pages';

const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/about',
    component: About,
  },
  {
    path: '/projects',
    component: Projects,
  },
  {
    path: '/contact',
    component: Contact,
  },
];

export default routes;