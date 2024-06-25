import Home from "../pages/Home";
import About from '../pages/About'
import Projects from "../pages/Projects";
import Contact from "../pages/Contact";

interface RouteType {
    path: string,
    component: () => JSX.Element,
    name: string
}

const routes: RouteType[] = [
    {
        path: '',
        component: Home,
        name: 'Home Screen',
    },
    {
        path: '/About',
        component: About,
        name : 'About',
    },
    {
        path: '/Projects',
        component: Projects,
        name: 'Projects',
    },
    {
        path: '/Contact',
        component: Contact,
        name: 'Contact',
    }

]

export default routes