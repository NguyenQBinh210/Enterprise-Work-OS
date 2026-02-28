export const APP_NAME = 'Enterprise WorkOS';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const NAVIGATION_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { label: 'Projects', href: '/dashboard/projects', icon: 'Folder' },
    { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
];
