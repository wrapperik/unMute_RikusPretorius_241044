import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const LABELS = {
    '': 'Home',
    explore: 'Explore',
    addpost: 'Create Post',
    login: 'Login',
    signup: 'Signup',
}

export default function BreadCrumbs() {
    const location = useLocation()
    const { pathname, state } = location

    const crumbs = [];
    const segments = pathname.split('/').filter(Boolean);
    const fromPath = state && state.from;

    // Previous page
    if (fromPath) {
        const fromSeg = fromPath.split('/').filter(Boolean).pop() || '';
        const fromLabel = LABELS[fromSeg] || (fromSeg.charAt(0).toUpperCase() + fromSeg.slice(1)) || 'Previous';
        crumbs.push({ label: fromLabel, to: fromPath, isLast: false });
    } else {
        crumbs.push({ label: LABELS[''] || 'Home', to: '/' });
    }

    // Current page - prefer titles when the route provides them in location.state
    let currentLabel;
    if (segments[0] === 'viewpost' && state && state.postTitle) {
        currentLabel = state.postTitle;
    } else if (segments[0] === 'viewentry' && state && state.entryTitle) {
        currentLabel = state.entryTitle;
    } else {
        const lastSeg = segments[segments.length - 1] || '';
        currentLabel = LABELS[lastSeg] || (lastSeg.charAt(0).toUpperCase() + lastSeg.slice(1)) || 'Current';
    }
    crumbs.push({ label: currentLabel, to: pathname, isLast: true });

    return (
        <nav className="breadcrumbs text-sm mb-6" aria-label="Breadcrumb">
            <ul className="flex gap-3 items-center">
                {crumbs.map((c, i) => (
                    <li key={i}>
                        {!c.isLast ? (
                            <Link to={c.to} className="text-gray-600 hover:text-black hover:underline font-medium transition-colors duration-200">{c.label}</Link>
                        ) : (
                            <span className="text-black font-bold">{c.label}</span>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    )
}