import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from '../src/pages/signup';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </BrowserRouter>
    )
}