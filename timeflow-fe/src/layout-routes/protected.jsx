import { Outlet } from 'react-router-dom';

const Protected = () => {
    return (
        <div>
            <Outlet />
        </div>
    );
}

export default Protected;
