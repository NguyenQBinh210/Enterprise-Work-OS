export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'In Progress' | 'Completed' | 'On Hold' | 'Planning';
    progress: number;
    dueDate: string;
    team: string[];
    tasksCount: number;
    completedTasks: number;
}

export const MOCK_PROJECTS: Project[] = [
    {
        id: '1',
        name: 'Website Redesign',
        description: 'Revamping the corporate website with new brand identity and improved UX.',
        status: 'In Progress',
        progress: 65,
        dueDate: '2024-03-15',
        team: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2', 'https://i.pravatar.cc/150?u=3'],
        tasksCount: 24,
        completedTasks: 15,
    },
    {
        id: '2',
        name: 'Mobile App Development',
        description: 'Native iOS and Android application for customer loyalty program.',
        status: 'Planning',
        progress: 15,
        dueDate: '2024-06-30',
        team: ['https://i.pravatar.cc/150?u=4', 'https://i.pravatar.cc/150?u=5'],
        tasksCount: 45,
        completedTasks: 5,
    },
    {
        id: '3',
        name: 'Q1 Marketing Campaign',
        description: 'Social media and email marketing campaign for Q1 product launches.',
        status: 'Completed',
        progress: 100,
        dueDate: '2024-01-30',
        team: ['https://i.pravatar.cc/150?u=6'],
        tasksCount: 12,
        completedTasks: 12,
    },
    {
        id: '4',
        name: 'Internal Tools Migration',
        description: 'Migrating legacy internal tools to the new cloud infrastructure.',
        status: 'On Hold',
        progress: 40,
        dueDate: '2024-04-20',
        team: ['https://i.pravatar.cc/150?u=2', 'https://i.pravatar.cc/150?u=7'],
        tasksCount: 30,
        completedTasks: 12,
    },
];

export const MOCK_STATS = [
    { label: 'Total Projects', value: '12', trend: '+2 this month', trendUp: true },
    { label: 'Active Tasks', value: '64', trend: '-5 this week', trendUp: false },
    { label: 'Team Members', value: '8', trend: '+1 new', trendUp: true },
    { label: 'Completion Rate', value: '94%', trend: '+2.5%', trendUp: true },
];

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Editor' | 'Viewer';
    status: 'Active' | 'Disabled';
    avatar: string;
}

export const MOCK_USERS: User[] = [
    {
        id: '1',
        name: 'Quốc Bình',
        email: 'binh@example.com',
        role: 'Admin',
        status: 'Active',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    },
    {
        id: '2',
        name: 'Minh Thư',
        email: 'thu@example.com',
        role: 'Editor',
        status: 'Active',
        avatar: 'https://i.pravatar.cc/150?u=1',
    },
    {
        id: '3',
        name: 'Hoàng Nam',
        email: 'nam@example.com',
        role: 'Editor',
        status: 'Disabled',
        avatar: 'https://i.pravatar.cc/150?u=3',
    },
    {
        id: '4',
        name: 'Thảo Vi',
        email: 'vi@example.com',
        role: 'Viewer',
        status: 'Active',
        avatar: 'https://i.pravatar.cc/150?u=5',
    },
    {
        id: '5',
        name: 'Gia Bảo',
        email: 'bao@example.com',
        role: 'Viewer',
        status: 'Active',
        avatar: 'https://i.pravatar.cc/150?u=8',
    },
];
