import Layout from "./Layout.jsx";

import Home from "./Home";

import Dashboard from "./Dashboard";

import Militia from "./Militia";

import Events from "./Events";

import Heritage from "./Heritage";

import Volunteer from "./Volunteer";

import EventDetails from "./EventDetails";

import AdminTools from "./AdminTools";

import VolunteerServiceDetails from "./VolunteerServiceDetails";

import HeritageRecordDetails from "./HeritageRecordDetails";

import LocalGovernment from "./LocalGovernment";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Dashboard: Dashboard,
    
    Militia: Militia,
    
    Events: Events,
    
    Heritage: Heritage,
    
    Volunteer: Volunteer,
    
    EventDetails: EventDetails,
    
    AdminTools: AdminTools,
    
    VolunteerServiceDetails: VolunteerServiceDetails,
    
    HeritageRecordDetails: HeritageRecordDetails,
    
    LocalGovernment: LocalGovernment,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Militia" element={<Militia />} />
                
                <Route path="/Events" element={<Events />} />
                
                <Route path="/Heritage" element={<Heritage />} />
                
                <Route path="/Volunteer" element={<Volunteer />} />
                
                <Route path="/EventDetails" element={<EventDetails />} />
                
                <Route path="/AdminTools" element={<AdminTools />} />
                
                <Route path="/VolunteerServiceDetails" element={<VolunteerServiceDetails />} />
                
                <Route path="/HeritageRecordDetails" element={<HeritageRecordDetails />} />
                
                <Route path="/LocalGovernment" element={<LocalGovernment />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}