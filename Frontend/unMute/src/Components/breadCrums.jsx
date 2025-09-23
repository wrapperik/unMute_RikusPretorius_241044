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

    // If previous page is available, always show it as first crumb
    if (fromPath) {
        const fromSeg = fromPath.split('/').filter(Boolean).pop() || '';
        const fromLabel = LABELS[fromSeg] || (fromSeg.charAt(0).toUpperCase() + fromSeg.slice(1)) || 'Previous';
        crumbs.push({ label: fromLabel, to: fromPath, isLast: false });
    } else {
        crumbs.push({ label: LABELS[''] || 'Home', to: '/' });
    }

    // For viewpost, use postTitle if available
    if (segments[0] === 'viewpost' && state && state.postTitle) {
        crumbs.push({ label: state.postTitle, to: pathname, isLast: true });
    } else {
        let cumulative = '';
        segments.forEach((seg, idx) => {
            cumulative += `/${seg}`;
            let label = LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
            let isLast = idx === segments.length - 1;
            crumbs.push({ label, to: cumulative, isLast });
        });
    }

    return (
        <nav className="breadcrumbs text-sm mb-5" aria-label="Breadcrumb">
            <ul className="flex gap-0.5 items-center">
                {crumbs.map((c, i) => (
                    <li key={i} className="flex items-center">
                        {!c.isLast ? (
                            <>
                                <Link to={c.to} className="text-gray-600 hover:underline">{c.label}</Link>
                                <span className="mx-2 text-gray-400">&gt;</span>
                            </>
                        ) : (
                            <span className="text-black">{c.label}</span>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    )
}